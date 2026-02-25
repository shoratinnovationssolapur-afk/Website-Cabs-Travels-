import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { serverTimestamp } from "firebase/firestore";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc // Added for toggling availability manually
} from "firebase/firestore";
import { MapPin, Phone, UserCheck, UserX } from "lucide-react"; // Icons for better UI

const AdminDrivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const fetchDrivers = async () => {
    const snapshot = await getDocs(collection(db, "drivers"));
    const list = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
    setDrivers(list);
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const addDriver = async () => {
    if (!name || !phone) return alert("Fill all fields");

    await addDoc(collection(db, "drivers"), {
      name,
      phone,
      available: true,
      status: "active",
      rating: 5,
      // Default location for new drivers
      currentLocation: { lat: 17.6599, lng: 75.9064, address: "Solapur HQ" }, 
      createdAt: serverTimestamp()
    });

    setName("");
    setPhone("");
    fetchDrivers();
  };

  const deleteDriver = async (id) => {
    if (window.confirm("Are you sure you want to delete this driver?")) {
      await deleteDoc(doc(db, "drivers", id));
      fetchDrivers();
    }
  };

  const toggleAvailability = async (id, currentStatus) => {
    await updateDoc(doc(db, "drivers", id), {
      available: !currentStatus
    });
    fetchDrivers();
  };

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-black mb-8 text-gray-800">
        Fleet Management — Drivers
      </h1>

      {/* ADD DRIVER FORM */}
      <div className="bg-white p-8 rounded-2xl shadow-sm mb-10 border border-gray-100 flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Full Name</label>
          <input
            placeholder="e.g. Rahul Patil"
            className="border p-3 rounded-xl w-64 focus:ring-2 focus:ring-yellow-400 outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Phone Number</label>
          <input
            placeholder="e.g. 9876543210"
            className="border p-3 rounded-xl w-64 focus:ring-2 focus:ring-yellow-400 outline-none"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <button
          onClick={addDriver}
          className="bg-black text-yellow-400 px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg"
        >
          Register Driver
        </button>
      </div>

      {/* DRIVER CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drivers.map(d => (
          <div
            key={d.id}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition relative overflow-hidden"
          >
            {/* Availability Badge */}
            <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              d.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}>
              {d.available ? "Online" : "On Trip / Offline"}
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-1">{d.name}</h2>
            
            <div className="flex items-center gap-2 text-gray-500 mb-4">
              <Phone size={14} />
              <span className="text-sm">{d.phone}</span>
            </div>

            <hr className="mb-4 border-gray-50" />

            {/* Location Info */}
            <div className="bg-gray-50 p-4 rounded-2xl mb-4">
              <div className="flex items-start gap-3">
                <MapPin className="text-yellow-600 shrink-0 mt-1" size={18} />
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Current Location</p>
                  <p className="text-sm font-semibold text-gray-700">
                    {d.currentLocation?.address || "Location Unknown"}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 italic">
                    {d.currentLocation?.lat.toFixed(4)}, {d.currentLocation?.lng.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => toggleAvailability(d.id, d.available)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition ${
                  d.available ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                }`}
              >
                {d.available ? <UserX size={16} /> : <UserCheck size={16} />}
                {d.available ? "Go Offline" : "Set Online"}
              </button>
              
              <button
                onClick={() => deleteDriver(d.id)}
                className="bg-gray-100 text-gray-400 hover:bg-red-600 hover:text-white px-4 py-2 rounded-xl transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDrivers;