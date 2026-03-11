import { useEffect, useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { Camera, User, Mail, Phone, MapPin, Save, X, ShieldCheck,Trash2 } from "lucide-react";
import axios from "axios";

const UserProfile = () => {
  const { user, loading: authLoading } = useAuthContext();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    photoURL: "",
  });

  useEffect(() => {
    if (!user) return;

    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setUserData(data);
        setFormData({
          name: data.name || data.displayName || "",
          phone: data.phone || "",
          address: data.address || "",
          photoURL: data.photo || data.photoURL || "",
        });
      }
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const handleDeleteUserImage = async () => {
    if (!user?.uid) return;
    if (!window.confirm("Are you sure you want to remove your profile picture?")) return;

    setUploading(true);
    try {
      // This removes the field or sets it to an empty string in Firestore
      await updateDoc(doc(db, "users", user.uid), {
        photo: ""
      });

      setFormData(prev => ({ ...prev, photoURL: "" }));
      alert("Profile picture removed!");
    } catch (error) {
      console.error("Delete failed", error);
      alert("Failed to remove image");
    } finally {
      setUploading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?.uid) return;

    setUploading(true);
    const data = new FormData();
    data.append("images", file);
    data.append("userId", user.uid);

    try {
      const response = await axios.post("https://website-cabs-travels.onrender.com/api/images/upload", data);
      const newImageUrl = response.data.urls[0];
      await updateDoc(doc(db, "users", user.uid), { photo: newImageUrl });
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
    if (!user?.uid) return;

    try {
      await updateDoc(doc(db, "users", user.uid), {
        name: formData.name,
        displayName: formData.name,
        phone: formData.phone,
        address: formData.address,
        updatedAt: new Date(),
      });
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      alert("Update failed: " + error.message);
    }
  };

  if (authLoading || loading) {
    return <div className="p-8 md:p-10 text-center font-semibold text-gray-600">Loading Profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-20 sm:h-32 relative">
          <div className="absolute -bottom-10 sm:-bottom-12 left-4 sm:left-8 flex items-end gap-4">
            <div className="relative group">
              {formData.photoURL ? (
                <>
                <img
                
                  src={formData.photoURL}
                  
                  alt="Profile"
                  className="w-10 h-10 sm:w-28 sm:h-28 rounded-2xl border-4 border-white object-cover bg-white shadow-md"
                />
                <button
                    onClick={handleDeleteUserImage}
                    className="absolute -top-2 -right-2 p-1.5 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition transform hover:scale-110"
                    title="Delete Photo"
                  >
                    <Trash2 size={14} />
                  </button>
                  </>
              ) : (
                <div className="w-10 h-10 sm:w-28 sm:h-28 bg-gray-100 rounded-2xl border-4 border-white flex items-center justify-center">
                  <User size={40} className="text-gray-400" />
                </div>
              )}
              <label className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 p-1.5 bg-white rounded-full shadow-lg cursor-pointer hover:scale-110 transition">
                <Camera size={14} className="text-blue-600" />
                <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
              </label>
              {uploading && (
                <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center text-white text-xs">
                  ...
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-12 sm:pt-16 p-4 sm:p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl mt-4 sm:mt-5 font-bold text-gray-900">{userData?.name || "User"}</h1>
              <div className="flex flex-wrap gap-2 sm:gap-3 mt-2">
                <p className="text-gray-500 flex items-center gap-1 text-sm break-all">
                  <Mail size={14} /> {userData?.email}
                </p>
                <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                  <ShieldCheck size={12} /> {userData?.role || "User"}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2 rounded-xl font-bold transition w-full sm:w-auto ${
                isEditing ? "bg-red-50 text-red-600" : "bg-blue-600 text-white shadow-lg shadow-blue-200"
              }`}
            >
              {isEditing ? (
                <>
                  <X size={18} /> Cancel
                </>
              ) : (
                "Edit Profile"
              )}
            </button>
          </div>

          <hr className="my-6 md:my-8 border-gray-100" />

          {isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
              <button
                type="submit"
                className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 sm:px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition w-full sm:w-auto"
              >
                <Save size={18} /> Save Changes
              </button>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Phone size={12} /> Contact Info
                  </h3>
                  <p className="text-gray-800 font-medium text-base md:text-lg">{userData?.phone || "No phone added"}</p>
                </div>
                <div>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <MapPin size={12} /> Location
                  </h3>
                  <p className="text-gray-800 font-medium text-base md:text-lg break-words">
                    {userData?.address || "No address added"}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 p-5 md:p-6 rounded-2xl border border-blue-100">
                <h3 className="font-bold text-blue-900 mb-2">Account Info</h3>
                <p className="text-sm text-blue-700 mb-4">
                  Member since {userData?.createdAt?.toDate ? userData.createdAt.toDate().toLocaleDateString() : "N/A"}
                </p>
                <div className="text-xs bg-white/60 p-3 rounded-lg border border-blue-200 font-mono break-all">
                  ID: {user?.uid}
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
