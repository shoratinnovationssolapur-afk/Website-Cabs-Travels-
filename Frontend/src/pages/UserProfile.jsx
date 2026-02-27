// import { useEffect, useState } from "react";
// import { auth, db } from "../firebase";
// import { doc, getDoc, updateDoc } from "firebase/firestore";

// export default function UserProfile() {
//   const [userData, setUserData] = useState(null);
//   const [name, setName] = useState("");

//   const fetchUser = async () => {
//     const user = auth.currentUser;
//     if (!user) return;

//     const snap = await getDoc(doc(db, "users", user.uid));
//     if (snap.exists()) {
//       setUserData(snap.data());
//       setName(snap.data().name || "");
//     }
//   };

//   useEffect(() => {
//     fetchUser();
//   }, []);

//   const updateProfile = async () => {
//     const user = auth.currentUser;
//     await updateDoc(doc(db, "users", user.uid), {
//       name,
//     });
//     alert("Profile Updated");
//   };

//   if (!userData) return <p className="p-10">Loading...</p>;

//   return (
//     <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded shadow">

//       <h2 className="text-2xl font-bold mb-6">My Profile</h2>

//       <img
//         src={userData.photo || "https://via.placeholder.com/120"}
//         className="w-28 h-28 rounded-full mb-4"
//       />

//       <p className="mb-2"><b>Email:</b> {userData.email}</p>
//       <p className="mb-4"><b>Role:</b> {userData.role}</p>

//       <input
//         className="border p-2 w-full mb-3"
//         value={name}
//         onChange={(e) => setName(e.target.value)}
//         placeholder="Full Name"
//       />

//       <button
//         onClick={updateProfile}
//         className="bg-blue-600 text-white px-4 py-2 rounded"
//       >
//         Update Profile
//       </button>

//     </div>
//   );
// }
import { useEffect, useState } from "react";
import { useAuthContext } from "../context/AuthContext"; // Assuming you use this based on your snippet
import { db, auth } from "../firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { Camera, User, Mail, Phone, MapPin, Save, X } from "lucide-react";
import axios from "axios";

const UserProfile = () => {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    displayName: "",
    phone: "",
    address: "",
    photoURL: ""
  });

  useEffect(() => {
    if (!user) return;

    // Real-time listener for user-specific data from Firestore
    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setFormData({
          displayName: data.displayName || user.displayName || "",
          phone: data.phone || "",
          address: data.address || "",
          photoURL: data.photoURL || user.photoURL || ""
        });
      }
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Image Upload to your backend/Cloudinary
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append("images", file); // Matching your backend key "images"
    data.append("userId", user.uid);

    try {
      // Using your existing backend endpoint logic
      const response = await axios.post("http://localhost:3000/api/images/upload", data);
      const newImageUrl = response.data.urls[0];

      // Update Firestore immediately with the new image URL
      await updateDoc(doc(db, "users", user.uid), {
        photoURL: newImageUrl
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
        displayName: formData.displayName,
        phone: formData.phone,
        address: formData.address,
      });
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      alert("Update failed: " + error.message);
    }
  };

  if (loading) return <div className="p-10 text-center font-semibold">Loading Profile...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Banner Decor */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-32 relative">
          <div className="absolute -bottom-12 left-8 flex items-end gap-4">
            <div className="relative group">
              {formData.photoURL ? (
                <img 
                  src={formData.photoURL} 
                  alt="Profile" 
                  className="w-28 h-28 rounded-2xl border-4 border-white object-cover bg-white"
                />
              ) : (
                <div className="w-28 h-28 bg-gray-200 rounded-2xl border-4 border-white flex items-center justify-center">
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
              <h1 className="text-3xl font-bold text-gray-900">{formData.displayName || "User Name"}</h1>
              <p className="text-gray-500 flex items-center gap-1"><Mail size={14}/> {user?.email}</p>
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
                    name="displayName"
                    type="text" 
                    value={formData.displayName} 
                    onChange={handleChange}
                    className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
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
                  <p className="text-gray-800 font-medium text-lg">{formData.phone || "Not provided"}</p>
                </div>
                <div>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <MapPin size={12}/> Location
                  </h3>
                  <p className="text-gray-800 font-medium text-lg">{formData.address || "Not provided"}</p>
                </div>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                <h3 className="font-bold text-blue-900 mb-2">Account Security</h3>
                <p className="text-sm text-blue-700 mb-4">Your User ID is private and used for support purposes.</p>
                <code className="text-xs bg-white/50 p-2 rounded block truncate border border-blue-200">
                  UID: {user.uid}
                </code>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;