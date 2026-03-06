import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import axios from "axios";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  onSnapshot
} from "firebase/firestore";

const AdminVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    type: "SUV",
    desc: "",
    fuelType: "",
    imageUrl: "",
    pricePerKm: "",
    available: true
  });

  // const fetchVehicles = async () => {
  //   const snapshot = await getDocs(collection(db, "vehicles"));
  //   const list = snapshot.docs.map(doc => ({
  //     id: doc.id,
  //     ...doc.data()
  //   }));
  //   setVehicles(list);
  // };

  // useEffect(() => {
  //   fetchVehicles();
  // }, []);
  // 🔄 Real-time listener for auto-refresh
useEffect(() => {
  const q = collection(db, "vehicles");
  
  // onSnapshot listens for any changes in the 'vehicles' collection
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setVehicles(list);
  });

  // Clean up the listener when the component unmounts
  return () => unsubscribe();
}, []);

  const handleEdit = (v) => {
    setEditingId(v.id);
    setForm({
      name: v.name,
      type: v.type || "SUV",
      desc: v.desc,
      fuelType: v.fuelType || "",
      imageUrl: v.imageUrl,
      pricePerKm: v.pricePerKm,
      available: v.available
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      name: "",
      type: "SUV",
      desc: "",
      fuelType: "",
      imageUrl: "",
      pricePerKm: "",
      available: true
    });
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    const fileInput = e.target;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const data = new FormData();
      for (let i = 0; i < files.length; i++) {
        data.append("images", files[i]);
      }
      if (auth.currentUser) {
        data.append("userId", auth.currentUser.uid);
      }

      const response = await axios.post("http://localhost:3000/api/images/upload", data);
      if (response.data.urls && response.data.urls.length > 0) {
        setForm(prev => ({ ...prev, imageUrl: response.data.urls[0] }));
      }
    } catch (error) {
      console.error("Upload Error:", error);
      fileInput.value = "";
      setForm(prev => ({ ...prev, imageUrl: "" }));
      alert("Upload failed. Check console for details.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    const vehicleName = form.name;
    try {
      if (editingId) {
        await updateDoc(doc(db, "vehicles", editingId), {
          ...form,
          pricePerKm: Number(form.pricePerKm)
        });
        alert(`${vehicleName} updated successfully!`);
      } else {
        await addDoc(collection(db, "vehicles"), {
          ...form,
          pricePerKm: Number(form.pricePerKm),
          createdAt: serverTimestamp()
        });
        alert(`${vehicleName} added successfully!`);
      }
      resetForm();
    
    } catch (error) {
      alert("Error saving vehicle: " + error.message);
    }
  };

  const deleteVehicle = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await deleteDoc(doc(db, "vehicles", id));
     
      alert(`${name || "Vehicle"} deleted successfully!`);
    } catch (error) {
      alert("Error deleting vehicle: " + error.message);
    }
  };

  const toggleAvailability = async (v) => {
    await updateDoc(doc(db, "vehicles", v.id), {
      available: !v.available
    });
  
  };

  const changePrice = async (id, newPrice) => {
    if (!newPrice) return;
    try {
      await updateDoc(doc(db, "vehicles", id), {
        pricePerKm: Number(newPrice)
      });
      
    } catch (error) {
      alert("Invalid price");
    }
  };

  return (
    <div className="p-10 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Admin — Manage Vehicles</h1>

      <div className="bg-white p-6 rounded-xl shadow mb-10 grid gap-3">
        <h3 className="font-bold text-xl mb-2">
          {editingId ? `Editing: ${form.name}` : "Add New Vehicle"}
        </h3>

        <input
          placeholder="Vehicle Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border p-2 rounded"
        />

        {/* FIXED: Was pointing to form.desc, now correctly points to form.type */}
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="border p-2 rounded"
          required
        >
          <option value="" disabled>Car Type</option>
          <option value="SUV">SUV</option>
          <option value="Sedan">Sedan</option>
          <option value="Luxury">Luxury</option>
          <option value="Travels">Travels</option>
        </select>

        <input
          placeholder="Description"
          value={form.desc}
          onChange={(e) => setForm({ ...form, desc: e.target.value })}
          className="border p-2 rounded"
        />

        <select
          value={form.fuelType}
          onChange={(e) => setForm({ ...form, fuelType: e.target.value })}
          className="border p-2 rounded"
          required
        >
          <option value="" disabled>Fuel Type</option>
          <option value="Petrol">Petrol</option>
          <option value="CNG">CNG</option>
          <option value="Diesel">Diesel</option>
          <option value="Hybrid">Hybrid</option>
        </select>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-2 border-dashed border-gray-200 p-4 rounded-lg">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-600">Option 1: Paste URL</label>
            <input
              placeholder="Image URL"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="border p-2 rounded w-full"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-600">Option 2: Upload File</label>
            <input type="file" onChange={handleFileUpload} className="text-sm text-gray-500" />
            {uploading && <span className="text-xs text-blue-500 animate-pulse">Uploading...</span>}
          </div>
        </div>

        {form.imageUrl && (
          <div className="relative w-32 h-20 border rounded overflow-hidden">
            <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" />
            <button
              className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-1"
              onClick={() => setForm({ ...form, imageUrl: "" })}
            >X</button>
          </div>
        )}

        <input
          placeholder="Price per km"
          type="number"
          value={form.pricePerKm}
          onChange={(e) => setForm({ ...form, pricePerKm: e.target.value })}
          className="border p-2 rounded"
        />

        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            className={`flex-1 py-2 rounded font-bold text-white ${editingId ? 'bg-blue-600' : 'bg-green-600'}`}
          >
            {editingId ? "Update Vehicle" : "Add Vehicle"}
          </button>
          {editingId && (
            <button onClick={resetForm} className="bg-gray-400 text-white py-2 px-4 rounded font-bold">
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {vehicles.map(v => (
          <div key={v.id} className="bg-white rounded-xl shadow overflow-hidden">
            <img src={v.imageUrl} alt={v.name} className="h-48 w-full object-cover" />
            <div className="p-4">
              <h2 className="font-bold text-lg">{v.name}</h2>
              <p className="text-sm text-gray-600">{v.desc}</p>
              <div className="mt-2 font-semibold">
                <p>₹ {v.pricePerKm}/km</p>
                <button 
                  className="text-blue-600 text-xs underline"
                  onClick={() => changePrice(v.id, prompt("Enter new price"))}
                >
                  Quick Price Change
                </button>
              </div>
              <p className={v.available ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                {v.available ? "Available" : "Not Available"}
              </p>
              <div className="flex gap-2 mt-4">
                <button onClick={() => handleEdit(v)} className="bg-blue-500 text-white px-3 py-1 rounded">Edit</button>
                <button onClick={() => toggleAvailability(v)} className="bg-yellow-500 text-white px-3 py-1 rounded">Toggle</button>
                <button onClick={() => deleteVehicle(v.id, v.name)} className="bg-red-600 text-white px-3 py-1 rounded">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminVehicles;