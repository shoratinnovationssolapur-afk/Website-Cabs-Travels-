import { useEffect, useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { Camera, User, Mail, Phone, MapPin, Save, X, ShieldCheck } from "lucide-react";
import axios from "axios";

const UserProfile = () => {
  const { user, loading: authLoading } = useAuthContext();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form States matching your Firestore keys
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    photoURL: ""
  });

  useEffect(() => {
    if (!user) return;

    // Real-time listener
    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setUserData(data);
        setFormData({
          // Using 'name' as primary, fallback to 'displayName'
          name: data.name || data.displayName || "",
          phone: data.phone || "",
          address: data.address || "",
          photoURL: data.photo || data.photoURL || "" 
        });
      }
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append("images", file);
    data.append("userId", user.uid);

    try {
      const response = await axios.post("http://localhost:3000/api/images/upload", data);
      const newImageUrl = response.data.urls[0];

      // Update Firestore 'photo' field to match your DB structure
      await updateDoc(doc(db, "users", user.uid), {
        photo: newImageUrl
      });
      alert("Profile picture updated!");
    } catch (error) {
      console.error("Upload failed", error);
      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "users", user.uid), {
        name: formData.name,
        displayName: formData.name, // Keeping both in sync
        phone: formData.phone,
        address: formData.address,
        updatedAt: new Date()
      });
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      alert("Update failed: " + error.message);
    }
  };

  if (authLoading || loading) return <div className="p-10 text-center font-semibold text-gray-600">Loading Profile...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Header/Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-32 relative">
          <div className="absolute -bottom-12 left-8 flex items-end gap-4">
            <div className="relative group">
              {formData.photoURL ? (
                <img 
                  src={formData.photoURL} 
                  alt="Profile" 
                  className="w-28 h-28 rounded-2xl border-4 border-white object-cover bg-white shadow-md"
                />
              ) : (
                <div className="w-28 h-28 bg-gray-100 rounded-2xl border-4 border-white flex items-center justify-center">
                  <User size={48} className="text-gray-400" />
                </div>
              )}
              <label className="absolute bottom-2 right-2 p-1.5 bg-white rounded-full shadow-lg cursor-pointer hover:scale-110 transition">
                <Camera size={16} className="text-blue-600" />
                <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
              </label>
              {uploading && <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center text-white text-xs">...</div>}
            </div>
          </div>
        </div>

        <div className="pt-16 p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{userData?.name || "User"}</h1>
              <div className="flex flex-wrap gap-3 mt-2">
                <p className="text-gray-500 flex items-center gap-1 text-sm"><Mail size={14}/> {userData?.email}</p>
                <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                  <ShieldCheck size={12}/> {userData?.role || "User"}
                </span>
              </div>
            </div>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold transition ${
                isEditing ? "bg-red-50 text-red-600" : "bg-blue-600 text-white shadow-lg shadow-blue-200"
              }`}
            >
              {isEditing ? <><X size={18}/> Cancel</> : "Edit Profile"}
            </button>
          </div>

          <hr className="my-8 border-gray-100" />

          {isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                  <input 
                    name="name"
                    type="text" 
                    value={formData.name} 
                    onChange={handleChange}
                    className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                  <input 
                    name="phone"
                    type="text" 
                    value={formData.phone} 
                    onChange={handleChange}
                    className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Address</label>
                  <textarea 
                    name="address"
                    value={formData.address} 
                    onChange={handleChange}
                    className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                    rows="3"
                  />
                </div>
              </div>
              <button type="submit" className="flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition">
                <Save size={18}/> Save Changes
              </button>
            </form>
          ) : (
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Phone size={12}/> Contact Info
                  </h3>
                  <p className="text-gray-800 font-medium text-lg">{userData?.phone || "No phone added"}</p>
                </div>
                <div>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <MapPin size={12}/> Location
                  </h3>
                  <p className="text-gray-800 font-medium text-lg">{userData?.address || "No address added"}</p>
                </div>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                <h3 className="font-bold text-blue-900 mb-2">Account Info</h3>
                <p className="text-sm text-blue-700 mb-4">Member since {userData?.createdAt?.toDate().toLocaleDateString()}</p>
                <div className="text-xs bg-white/60 p-3 rounded-lg border border-blue-200 font-mono truncate">
                  ID: {user.uid}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;