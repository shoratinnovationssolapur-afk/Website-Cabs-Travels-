import { useEffect, useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

export default function DriverProfile() {
  const { user, loading: authLoading } = useAuthContext();
  const [driverData, setDriverData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Form States
  const [name, setName] = useState(""); // Added name state
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (!user) return;

    const unsub = onSnapshot(doc(db, "drivers", user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setDriverData(data);
        setName(data.name || ""); // Initialize name
        setPhone(data.phone || "");
        setAddress(data.address || "");
      }
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "drivers", user.uid), {
        name, // Now updates the name in Firestore
        phone,
        address,
        updatedAt: new Date(), // Good practice to track the update time
      });
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      alert("Update failed: " + error.message);
    }
  };

  if (authLoading || loading) return <div className="p-6 md:p-10 text-center">Loading Driver Profile...</div>;

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-0">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header Section */}
        <div className="bg-slate-900 h-24 sm:h-32 relative">
          <div className="absolute -bottom-10 sm:-bottom-12 left-4 sm:left-8">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-500 rounded-2xl border-4 border-white flex items-center justify-center text-white text-2xl sm:text-3xl font-bold">
              {driverData?.name?.charAt(0) || "D"}
            </div>
          </div>
        </div>

        <div className="pt-12 sm:pt-16 p-4 sm:p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{driverData?.name}</h1>
              <p className="text-gray-500 break-all">{driverData?.email}</p>
              <div className="flex gap-2 mt-2">
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">
                  {driverData?.status?.toUpperCase()}
                </span>
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">
                  ⭐ {driverData?.rating} Rating
                </span>
              </div>
            </div>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-200 transition"
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          <hr className="mb-8" />

          {isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-4 max-w-md">
              {/* Added Name Input Field */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
                <input 
                  type="text" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Home Address</label>
                <textarea 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                  rows="3"
                />
              </div>
              <button type="submit" className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition w-full sm:w-auto">
                Save Changes
              </button>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Contact Information</h3>
                  <p className="text-gray-800 font-medium">{driverData?.phone || "No phone provided"}</p>
                </div>
                <div>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Registered Address</h3>
                  <p className="text-gray-800 font-medium break-words">{driverData?.address || "No address provided"}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4">Account Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Current Availability</span>
                    <span className={driverData?.available ? "text-green-600 font-bold" : "text-red-500 font-bold"}>
                      {driverData?.available ? "Online" : "Offline"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Member Since</span>
                    <span className="text-gray-800 font-medium">
                      {driverData?.createdAt?.toDate().toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
