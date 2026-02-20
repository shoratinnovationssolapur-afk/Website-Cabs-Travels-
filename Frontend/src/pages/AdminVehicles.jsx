import React, { useState, useEffect } from "react";
import { db } from "../firebase";
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

        <input
          placeholder="Image URL"
          value={form.imageUrl}
          onChange={(e) =>
            setForm({ ...form, imageUrl: e.target.value })
          }
          className="border p-2 rounded"
        />

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
