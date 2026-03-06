import React, { useState, useEffect } from "react";
import { db,rtdb } from "../firebase";
import { ref, onValue } from "firebase/database";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";
import { MapPin, Phone, UserCheck, UserX, Search, ShieldCheck, ShieldAlert, Star, Mail } from "lucide-react";

const AdminDrivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(""); // Added email state
  const [searchQuery, setSearchQuery] = useState("");
 const [rtdbStatus, setRtdbStatus] = useState({});


// Listen to Realtime Database for LIVE connection status
useEffect(() => {
  const statusRef = ref(rtdb, "status");
  const unsubscribe = onValue(statusRef, (snapshot) => {
    if (snapshot.exists()) {
      setRtdbStatus(snapshot.val());
    }
  });
  return () => unsubscribe();
}, []);
// 2. Real-time listener for Firestore driver fleet
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
    d.phone?.includes(searchQuery) ||
    d.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // const addDriver = async () => {
  //   if (!name || !phone || !email) return alert("Please fill all fields");

  //   try {
  //     await addDoc(collection(db, "drivers"), {
  //       name,
  //       phone,
  //       email,
  //       available: true,
  //       onTrip: false,
  //       status: "active",
  //       rating: 5,
  //       currentRideId: "",
  //       location: {
  //         address: "Solapur HQ",
  //         lat: 17.6599,
  //         lng: 75.9064
  //       },
  //       createdAt: serverTimestamp(),
  //       lastUpdated: serverTimestamp()
  //     });
  //     setName("");
  //     setPhone("");
  //     setEmail("");
  //     alert("Driver registered successfully!");
  //   } catch (error) {
  //     alert("Error adding driver: " + error.message);
  //   }
  // };
  // Inside AdminDrivers.js -> addDriver function
  const addDriver = async () => {
    if (!name || !phone || !email) return alert("Please fill all fields");

    try {
      await addDoc(collection(db, "drivers"), {
        name: name, // Ensure this is saved
        phone: phone,
        email: email, // Ensure this is saved
        available: false,
        onTrip: false,
        status: "active",
        createdAt: serverTimestamp(),
        lastLocation: null // Initialize tracking field
      });
      // ... reset states
    } catch (error) {
      alert("Error adding driver: " + error.message);
    }
  };



  const toggleAccountStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    try {
      await updateDoc(doc(db, "drivers", id), {
        status: newStatus,
        available: newStatus === "active",
        lastUpdated: serverTimestamp()
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
    
    <div className="p-4 sm:p-6 md:p-10 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-2xl md:text-3xl font-black text-gray-800 uppercase tracking-tight">Fleet Management</h1>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search name, phone, or email..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-yellow-400 outline-none shadow-sm transition"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* REGISTRATION FORM */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm mb-10 border border-gray-100 flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-400 uppercase">Full Name</label>
          <input
            className="border p-3 rounded-xl w-full sm:w-60 outline-none focus:border-yellow-500"
            value={name}
            placeholder="Driver Name"
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-400 uppercase">Phone</label>
          <input
            className="border p-3 rounded-xl w-full sm:w-48 outline-none focus:border-yellow-500"
            value={phone}
            placeholder="Phone Number"
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-400 uppercase">Email</label>
          <input
            className="border p-3 rounded-xl w-full sm:w-60 outline-none focus:border-yellow-500"
            value={email}
            placeholder="Email Address"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button onClick={addDriver} className="bg-black text-yellow-400 px-6 sm:px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg shadow-gray-200 w-full sm:w-auto">
          Register Driver
        </button>
      </div>

      {/* DRIVER GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrivers.map(d => {
                       const isActuallyConnected = rtdbStatus[d.id]?.available === true;
                       return (
          <div key={d.id} className="bg-white rounded-[2.5rem] p-5 md:p-8 shadow-sm border border-gray-100 relative hover:shadow-xl transition-shadow duration-300">
          
            {/* STATUS BADGES */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex flex-col gap-2">
                <span className={`w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
            d.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
          }`}>
            {d.status}
          </span>
          
<span className={`w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
            isActuallyConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {isActuallyConnected && <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse"></span>}
            {isActuallyConnected ? "Live Now" : "Disconnected"}
          </span>
        </div>
              <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-bold text-yellow-700">{d.rating || 5}</span>
              </div>
            </div>

            <h2 className="text-xl md:text-2xl font-black text-gray-800 uppercase leading-none">
              {d.name || "Unnamed Driver"}
            </h2>
            <div className="mt-2 space-y-1">
              <p className="text-gray-500 text-sm font-bold flex items-center gap-2">
                <Mail size={14} className="text-gray-400" />
                {d.email || "Email not registered"}
              </p>
            </div>


{/* LIVE LOCATION SECTION */}
      <div className={`mt-6 p-5 rounded-[2rem] flex items-start gap-3 border transition-colors ${
        isActuallyConnected ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-100 opacity-60'
      }`}>
        <MapPin className={`${isActuallyConnected ? 'text-blue-600' : 'text-gray-400'} shrink-0 mt-1`} size={20} />
        <div className="overflow-hidden">
          <div className="flex justify-between items-center mb-1">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {isActuallyConnected ? "Live Tracking Active" : "Last Known Location"}
            </p>
          </div>

                {/* ⭐ UPDATED DATA PATH: d.lastLocation.address */}
                <p className={`text-sm font-bold leading-tight ${d.available ? 'text-blue-900' : 'text-gray-700'}`}>
                  {d.lastLocation?.address || "Wait for driver to go online..."}
                </p>

                <div className="flex gap-4 mt-2">
                  <p className="text-[9px] text-gray-400 font-bold">
                    Lat: {d.lastLocation?.lat?.toFixed(5) || "0.00"}
                  </p>
                  <p className="text-[9px] text-gray-400 font-bold">
                    Lng: {d.lastLocation?.lng?.toFixed(5) || "0.00"}
                  </p>
                  {d.lastLocation?.speed > 0 && (
                    <p className="text-[9px] text-green-600 font-black uppercase">
                      Moving: {Math.round(d.lastLocation.speed * 3.6)} KM/H
                    </p>
                  )}
                </div>
              </div>
            </div>




            {/* ACTION BUTTONS */}
            <div className="grid grid-cols-2 gap-3 mt-8">
              <button
                onClick={() => toggleAvailability(d.id, d.available)}
                className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-[11px] font-black uppercase tracking-tighter transition shadow-sm ${d.available ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-600 hover:bg-green-100"
                  }`}
              >
                {d.available ? <UserX size={14} /> : <UserCheck size={14} />}
                {d.available ? "Go Offline" : "Go Online"}
              </button>

              <button
                onClick={() => toggleAccountStatus(d.id, d.status)}
                className="flex items-center justify-center gap-2 bg-gray-50 text-gray-600 py-3 rounded-2xl text-[11px] font-black uppercase tracking-tighter hover:bg-gray-100 transition shadow-sm"
              >
                {d.status === "active" ? <ShieldAlert size={14} /> : <ShieldCheck size={14} />}
                {d.status === "active" ? "Suspend" : "Activate"}
              </button>

              <button
                onClick={() => deleteDriver(d.id, d.name)}
                className="col-span-2 mt-4 text-gray-400 text-[10px] font-bold hover:text-red-600 transition uppercase tracking-widest border-t pt-4"
              >
                Remove Driver Permanently
              </button>
            </div>
          </div>
                       );
})}
      </div>
    </div>
  );
};

export default AdminDrivers;
