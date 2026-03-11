import { useEffect, useState } from "react";
import { useAuthContext } from "../context/AuthContext"; // Ensure this path is correct
import { db } from "../firebase";
import { doc, onSnapshot, updateDoc, serverTimestamp } from "firebase/firestore";
import { Camera, User, Mail, Phone, MapPin, Save, X, ShieldCheck,Trash2 } from "lucide-react";
import axios from "axios";

const AdminProfile = () => {
  const { user, loading: authLoading } = useAuthContext();
  const [adminData, setAdminData] = useState(null);
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

    // Real-time listener for the Admin's document in "users" collection
    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setAdminData(data);
        setFormData({
          name: data.name || "",
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

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?.uid) return;

    setUploading(true);
    const data = new FormData();
    data.append("images", file);
    data.append("userId", user.uid);

    try {
      // Using your existing Render API for image uploads
      const response = await axios.post("https://website-cabs-travels.onrender.com/api/images/upload", data);
      const newImageUrl = response.data.urls[0];

      await updateDoc(doc(db, "users", user.uid), {
        photo: newImageUrl
      });
      alert("Admin Profile picture updated!");
    } catch (error) {
      console.error("Upload failed", error);
      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  //delete profile image
  const handleDeleteImage = async () => {
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

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!user?.uid) return;

    try {
      await updateDoc(doc(db, "users", user.uid), {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        updatedAt: serverTimestamp(),
      });
      setIsEditing(false);
      alert("Admin Profile updated successfully!");
    } catch (error) {
      alert("Update failed: " + error.message);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-6">
      <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100">
        {/* Header/Banner Section */}
        <div className="bg-gradient-to-r from-slate-800 to-zinc-900 h-24 sm:h-40 relative">
          <div className="absolute -bottom-12 left-6 sm:left-10 flex items-end gap-5">
            <div className="relative">
              {formData.photoURL ? (
                <>
                  <img
                    src={formData.photoURL}
                    alt="Admin"
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl border-4 border-white object-cover bg-white shadow-xl"
                  />
                  <button
                    onClick={handleDeleteImage}
                    className="absolute -top-2 -right-2 p-1.5 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition transform hover:scale-110"
                    title="Delete Photo"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-3xl border-4 border-white flex items-center justify-center">
                  <User size={48} className="text-gray-300" />
                </div>
              )}


              <label className="absolute bottom-1 right-1 p-2 bg-blue-600 text-white rounded-xl shadow-lg cursor-pointer hover:bg-blue-700 transition transform hover:scale-110">
                <Camera size={18} />
                <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
              </label>
              {uploading && (
                <div className="absolute inset-0 bg-black/50 rounded-3xl flex items-center justify-center">
                  <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="pt-16 p-6 sm:p-10">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                {adminData?.name || "Admin Manager"}
              </h1>
              <div className="flex flex-wrap gap-3 mt-3">
                <span className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
                  <Mail size={16} className="text-blue-500" /> {adminData?.email}
                </span>
                <span className="bg-blue-100 text-blue-700 text-xs font-black px-3 py-1 rounded-full uppercase flex items-center gap-1.5">
                  <ShieldCheck size={14} /> {adminData?.role || "Administrator"}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold transition shadow-lg ${isEditing
                  ? "bg-red-50 text-red-600 hover:bg-red-100"
                  : "bg-brand-black text-black hover:bg-white"
                }`}
            >
              {isEditing ? <><X size={18} /> Cancel</> : "Edit Admin Details"}
            </button>
          </div>

          <hr className="mb-10 border-gray-100" />

          {isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
                  <input
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-50 bg-gray-50/50 p-3.5 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition"
                    placeholder="Enter admin name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Direct Phone</label>
                  <input
                    name="phone"
                    type="text"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-50 bg-gray-50/50 p-3.5 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition"
                    placeholder="Phone number"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Office Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-50 bg-gray-50/50 p-3.5 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition"
                    rows="3"
                    placeholder="Physical location"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="flex items-center justify-center gap-2 bg-green-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-green-100 hover:bg-green-700 hover:scale-[1.02] active:scale-95 transition-all w-full sm:w-auto"
              >
                <Save size={20} /> Update Records
              </button>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="group">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                      <Phone size={14} className="text-blue-500" /> Contact Number
                    </h3>
                    <p className="text-gray-800 font-bold text-lg">{adminData?.phone || "Not Set"}</p>
                  </div>
                  <div className="group">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                      <MapPin size={14} className="text-blue-500" /> Office Location
                    </h3>
                    <p className="text-gray-800 font-bold text-lg">{adminData?.address || "Not Set"}</p>
                  </div>
                </div>
              </div>

              {/* Sidebar Info Card */}
              <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                <h3 className="font-black text-gray-900 mb-4 text-sm uppercase">Administration Info</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Authorized Since</p>
                    <p className="text-sm font-bold text-gray-700">
                      {adminData?.createdAt?.toDate ? adminData.createdAt.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : "2026"}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Internal UUID</p>
                    <div className="text-[10px] bg-white p-3 rounded-xl border border-gray-200 font-mono text-gray-500 break-all leading-relaxed">
                      {user?.uid}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;