import React, { useState, useEffect } from "react";
import { db,auth } from "../firebase";
import axios from "axios";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";

const AdminVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [uploading, setUploading] = useState(false); // To show loading state

  const [form, setForm] = useState({
    name: "",
    type: "SUV",
    desc: "",
    imageUrl: "",
    pricePerKm: "",
    available: true
  });

  // 🔄 Fetch vehicles
  const fetchVehicles = async () => {
    const snapshot = await getDocs(collection(db, "vehicles"));

    const list = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setVehicles(list);
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // ☁️ Cloudinary Upload Logic
// ☁️ Cloudinary Upload Logic (Modified to match your working demo)
const handleFileUpload = async (e) => {
  const files = e.target.files;
  const fileInput = e.target; // Reference to the actual input tag
  
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
    
    // ❌ THIS FIXES THE "NAME STAYS THERE" ISSUE
    fileInput.value = ""; 
    
    // Reset the form state so no old/broken URL is used
    setForm(prev => ({ ...prev, imageUrl: "" }));

    alert("Upload failed. Check Browser Console (F12) -> Network tab for details.");
  } finally {
    setUploading(false);
  }
};

  // ➕ Add vehicle
  const addVehicle = async () => {
    await addDoc(collection(db, "vehicles"), {
      ...form,
      pricePerKm: Number(form.pricePerKm),
      createdAt: serverTimestamp()
    });

    setForm({
      name: "",
      type: "SUV",
      desc: "",
      imageUrl: "",
      pricePerKm: "",
      available: true
    });

    fetchVehicles();
  };

  // ❌ Delete vehicle
  const deleteVehicle = async (id) => {
    await deleteDoc(doc(db, "vehicles", id));
    fetchVehicles();
  };

  // 🔄 Toggle availability
  const toggleAvailability = async (v) => {
    await updateDoc(doc(db, "vehicles", v.id), {
      available: !v.available
    });

    fetchVehicles();
  };
  const changePrice = async (id, newPrice) => {
    try {
      await updateDoc(doc(db, "vehicles", id), {
        pricePerKm: Number(newPrice)
      });
      fetchVehicles();
    } catch (error) {
      alert("Invalid price");
    }
  };

  return (
    <div className="p-10 bg-gray-100 min-h-screen">

      <h1 className="text-3xl font-bold mb-6">
        Admin — Manage Vehicles
      </h1>

      {/* ADD FORM */}
      <div className="bg-white p-6 rounded-xl shadow mb-10 grid gap-3">

        <input
          placeholder="Vehicle Name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
          className="border p-2 rounded"
        />

        <select
          value={form.type}
          onChange={(e) =>
            setForm({ ...form, type: e.target.value })
          }
          className="border p-2 rounded"
        >
          <option>SUV</option>
          <option>Sedan</option>
          <option>Luxury</option>
        </select>

        <input
          placeholder="Description"
          value={form.desc}
          onChange={(e) =>
            setForm({ ...form, desc: e.target.value })
          }
          className="border p-2 rounded"
        />

{/* IMAGE INPUTS SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-2 border-dashed border-gray-200 p-4 rounded-lg">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-600"> <pre> Option 1: Paste URL                      OR </pre> </label>
            <input
              placeholder="Image URL"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="border p-2 rounded w-full"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-600">  Option 2: Upload Local File </label>
            <input
              type="file"
              onChange={handleFileUpload}
              className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
            />
            {uploading && <span className="text-xs text-blue-500 animate-pulse">Uploading to Cloudinary...</span>}
          </div>
        </div>

        {/* PREVIEW */}
        {form.imageUrl && (
          <div className="relative w-32 h-20 border rounded overflow-hidden">
            <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" />
            <button 
              className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-1"
              onClick={() => setForm({...form, imageUrl: ""})}
            >X</button>
          </div>
        )}
  

        <input
          placeholder="Price per km"
          type="number"
          value={form.pricePerKm}
          onChange={(e) =>
            setForm({ ...form, pricePerKm: e.target.value })
          }
          className="border p-2 rounded"
        />

        <button
          onClick={addVehicle}
          className="bg-green-600 text-white py-2 rounded font-bold"
        >
          Add Vehicle
        </button>
      </div>

      {/* VEHICLE LIST */}
      <div className="grid md:grid-cols-3 gap-6">

        {vehicles.map(v => (
          <div
            key={v.id}
            className="bg-white rounded-xl shadow overflow-hidden"
          >

            <img
              src={v.imageUrl}
              alt={v.name}
              className="h-48 w-full object-cover"
            />

            <div className="p-4">

              <h2 className="font-bold text-lg">{v.name}</h2>
              <p className="text-sm text-gray-600">{v.desc}</p>

              <p className="mt-2 font-semibold">
                <button onClick={() => changePrice(v.id, prompt("Enter new price per km"))}>Change Price</button>
                ₹ {v.pricePerKm}/km
              </p>

              <p
                className={
                  v.available
                    ? "text-green-600 font-bold"
                    : "text-red-600 font-bold"
                }
              >
                {v.available ? "Available" : "Not Available"}
              </p>

              <div className="flex gap-2 mt-4">

                <button
                  onClick={() => toggleAvailability(v)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Toggle
                </button>

                <button
                  onClick={() => deleteVehicle(v.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>

              </div>

            </div>
          </div>
        ))}

      </div>

    </div>
  );
};

export default AdminVehicles;
