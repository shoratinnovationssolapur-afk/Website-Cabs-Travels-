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
import { MapPin, Phone, UserCheck, UserX, Search } from "lucide-react"; // Added Search icon

const AdminDrivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // New state for search

  // Auto-refresh logic using onSnapshot
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

  // Filter drivers based on search query
  const filteredDrivers = drivers.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.phone.includes(searchQuery)
  );

  const addDriver = async () => {
    if (!name.trim() || !phone.trim()) return alert("Fill all fields");

    try {
      await addDoc(collection(db, "drivers"), {
        name,
        phone,
        available: true,
        status: "active",
        rating: 5,
        currentLocation: { lat: 17.6599, lng: 75.9064, address: "Solapur HQ" }, 
        createdAt: serverTimestamp()
      });

      setName("");
      setPhone("");
    } catch (error) {
      alert("Error adding driver: " + error.message);
    }
  };

  const deleteDriver = async (id, driverName) => {
    if (window.confirm(`Are you sure you want to delete ${driverName}?`)) {
      try {
        await deleteDoc(doc(db, "drivers", id));
      } catch (error) {
        alert("Error deleting driver: " + error.message);
      }
    }
  };

  const toggleAvailability = async (id, currentStatus) => {
    try {
      await updateDoc(doc(db, "drivers", id), {
        available: !currentStatus
      });
    } catch (error) {
      alert("Error updating status: " + error.message);
    }
  };

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-black text-gray-800">
          Fleet Management — Drivers
        </h1>

        {/* SEARCH BAR */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search by name or phone..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-yellow-400 outline-none transition shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

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
        {filteredDrivers.length > 0 ? (
          filteredDrivers.map(d => (
            <div
              key={d.id}
              className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition relative overflow-hidden"
            >
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

              <div className="bg-gray-50 p-4 rounded-2xl mb-4">
                <div className="flex items-start gap-3">
                  <MapPin className="text-yellow-600 shrink-0 mt-1" size={18} />
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Current Location</p>
                    <p className="text-sm font-semibold text-gray-700">
                      {d.currentLocation?.address || "Location Unknown"}
                    </p>
                  </div>
                </div>
              </div>

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
                  onClick={() => deleteDriver(d.id, d.name)}
                  className="bg-gray-100 text-gray-400 hover:bg-red-600 hover:text-white px-4 py-2 rounded-xl transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-20 text-gray-400 font-medium">
            No drivers found matching "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDrivers;