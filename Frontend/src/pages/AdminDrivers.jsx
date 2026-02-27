import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";
import { MapPin, Phone, UserCheck, UserX, Search, ShieldCheck, ShieldAlert } from "lucide-react";

const AdminDrivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Real-time listener
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "drivers"), (snapshot) => {
      const list = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      setDrivers(list);
    });
    return () => unsubscribe(); 
  }, []);

  const filteredDrivers = drivers.filter(d => 
    d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.phone?.includes(searchQuery)
  );

const addDriver = async () => {
  // ... existing validation
  await addDoc(collection(db, "drivers"), {
    name,
    phone,
    available: true, 
    onTrip: false,  // <--- Add this line
    status: "active",
    rating: 5,
    currentLocation: { lat: 17.6599, lng: 75.9064, address: "Solapur HQ" }, 
    createdAt: serverTimestamp()
  });
  // ... existing reset
};

  const toggleAccountStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    try {
      await updateDoc(doc(db, "drivers", id), {
        status: newStatus,
        // If we suspend them, we should also make them unavailable
        available: newStatus === "active"
      });
    } catch (error) {
      alert("Error updating account status");
    }
  };

  const toggleAvailability = async (id, currentAvailable) => {
    try {
      await updateDoc(doc(db, "drivers", id), {
        available: !currentAvailable,
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      alert("Error updating availability");
    }
  };

  const deleteDriver = async (id, driverName) => {
    if (window.confirm(`Delete ${driverName}? This cannot be undone.`)) {
      try {
        await deleteDoc(doc(db, "drivers", id));
      } catch (error) {
        alert("Error deleting driver");
      }
    }
  };

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-black text-gray-800">Fleet Management</h1>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search name or phone..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-yellow-400 outline-none shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* REGISTRATION FORM */}
      <div className="bg-white p-6 rounded-2xl shadow-sm mb-10 border border-gray-100 flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-400 uppercase">Full Name</label>
          <input
            className="border p-3 rounded-xl w-64 outline-none focus:border-yellow-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-400 uppercase">Phone</label>
          <input
            className="border p-3 rounded-xl w-64 outline-none focus:border-yellow-500"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <button onClick={addDriver} className="bg-black text-yellow-400 px-8 py-3 rounded-xl font-bold hover:opacity-90 transition">
          Register Driver
        </button>
      </div>

      {/* DRIVER GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrivers.map(d => (
          <div key={d.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative">
            
            {/* STATUS BADGES */}
            <div className="flex justify-between mb-4">
               <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                d.status === 'active' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
               }`}>
                 {d.status}
               </span>
               <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                d.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
               }`}>
                 {d.available ? "Online" : "Offline / Busy"}
               </span>
            </div>

            <h2 className="text-xl font-bold text-gray-800">{d.name}</h2>
            <p className="text-gray-500 text-sm flex items-center gap-2 mt-1">
              <Phone size={14} /> {d.phone}
            </p>

            <div className="mt-4 bg-gray-50 p-4 rounded-2xl flex items-start gap-3">
              <MapPin className="text-yellow-600 shrink-0" size={18} />
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Location</p>
                <p className="text-sm font-semibold text-gray-700 truncate w-40">
                  {d.currentLocation?.address || "Unknown"}
                </p>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="grid grid-cols-2 gap-2 mt-6">
              <button
                onClick={() => toggleAvailability(d.id, d.available)}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition ${
                  d.available ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                }`}
              >
                {d.available ? <UserX size={14} /> : <UserCheck size={14} />}
                {d.available ? "Go Offline" : "Go Online"}
              </button>

              <button
                onClick={() => toggleAccountStatus(d.id, d.status)}
                className="flex items-center justify-center gap-2 bg-gray-50 text-gray-600 py-2 rounded-xl text-xs font-bold hover:bg-gray-100"
              >
                {d.status === "active" ? <ShieldAlert size={14} /> : <ShieldCheck size={14} />}
                {d.status === "active" ? "Suspend" : "Activate"}
              </button>

              <button
                onClick={() => deleteDriver(d.id, d.name)}
                className="col-span-2 mt-2 text-gray-400 text-xs hover:text-red-500 transition"
              >
                Remove from Fleet
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDrivers;