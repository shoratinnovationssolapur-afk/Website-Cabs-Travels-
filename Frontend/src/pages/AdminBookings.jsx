import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  updateDoc,
  doc,
  onSnapshot,
  query,
  where
} from "firebase/firestore";
import { autoAssignDriver } from "../utils/autoAssignDriver";
import { X, Search, Clock, Calendar, IndianRupee, TrendingUp, User, UserCheck, AlertTriangle, MapPin } from "lucide-react";

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeBookingId, setActiveBookingId] = useState(null);
  const [driverSearch, setDriverSearch] = useState("");
  
  // New: State for filtering bookings
  const [bookingSearch, setBookingSearch] = useState("");

  const totalRevenue = bookings.reduce((acc, curr) => acc + (Number(curr.totalFare) || 0), 0);

  useEffect(() => {
    const q = collection(db, "bookings");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setBookings(list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "drivers"), where("status", "==", "active"), where("available", "==", true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const driversList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      const readyDrivers = driversList.filter(d => d.onTrip !== true);
      setAvailableDrivers(readyDrivers);
    });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (b, status) => {
    try {
      await updateDoc(doc(db, "bookings", b.id), { status });
    } catch (error) {
      alert("Error updating status: " + error.message);
    }
  };

  const openAssignModal = (bookingId) => {
    setActiveBookingId(bookingId);
    setShowModal(true);
  };

  const handleFinalAssignment = async (driverId) => {
    if (!activeBookingId) return;
    try {
      await autoAssignDriver(activeBookingId, driverId);
      setShowModal(false);
      setActiveBookingId(null);
      alert("Driver assigned successfully!");
    } catch (error) {
      alert("Assignment failed: " + error.message);
    }
  };

  // Filter Bookings by Phone or Pickup City
  const filteredBookings = bookings.filter(b => 
    b.phone?.includes(bookingSearch) || 
    b.pickup?.toLowerCase().includes(bookingSearch.toLowerCase())
  );

  const filteredDrivers = availableDrivers.filter(d =>
    d.name?.toLowerCase().includes(driverSearch.toLowerCase()) ||
    d.phone?.includes(driverSearch)
  );

  return (
    <div className="p-10 bg-gray-100 min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-800 uppercase tracking-tight">Fleet Bookings</h1>
          <p className="text-gray-500 font-bold text-sm">Manage orders and track revenue</p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* SEARCH BAR FOR BOOKINGS */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search Phone or City..."
              className="pl-10 pr-4 py-2 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-yellow-400 w-64 outline-none"
              value={bookingSearch}
              onChange={(e) => setBookingSearch(e.target.value)}
            />
          </div>

          <div className="bg-white px-8 py-4 rounded-3xl shadow-sm border border-green-100 flex items-center gap-6">
            <div className="bg-green-500 p-3 rounded-2xl text-white"><TrendingUp size={24} /></div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Total Fleet Revenue</p>
              <p className="text-2xl font-black text-gray-900 flex items-center">
                <IndianRupee size={20} /> {Math.round(totalRevenue).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredBookings.map(b => {
          const bookingDateObj = b.dateTime ? new Date(b.dateTime) : null;
          const now = new Date();
          const isCancelled = b.status === "cancelled" || b.status === "rejected";
          const isExpired = bookingDateObj && bookingDateObj < now && b.status !== "completed" && !isCancelled;

          const tripDate = bookingDateObj 
            ? bookingDateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : "Date N/A";
          const tripTime = bookingDateObj 
            ? bookingDateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
            : "Time N/A";

          const displayDistance = b.distance ? (Number(b.distance)).toFixed(0) : "0.00";
          const isAssigned = b.status === "assigned" || b.driverId;
          const assignedDriverOffline = b.driverId && !availableDrivers.find(d => d.id === b.driverId);

          return (
            <div key={b.id} className={`bg-white p-6 rounded-2xl shadow-sm relative border-l-8 ${
              isCancelled ? 'border-gray-400 opacity-75' : isExpired ? 'border-red-600' : 'border-yellow-400'
            }`}>
              
              {isExpired && (
                <div className="mb-4 bg-red-100 border border-red-200 p-3 rounded-xl flex items-center gap-3 animate-pulse">
                  <AlertTriangle className="text-red-600" size={20} />
                  <p className="text-xs text-red-800 font-bold">PAST DATE DETECTED: Scheduled for {tripDate} at {tripTime}. Please cancel.</p>
                </div>
              )}

              <div className="absolute top-4 right-4 text-right">
                <span className={`px-3 py-1 text-[10px] rounded-full font-black uppercase tracking-widest block mb-2 bg-gray-100`}>
                  {b.bookingMethod === "car_specific" ? 'Car Specific' : 'Quick Booking'}
                </span>
                <p className={`text-lg font-black flex items-center justify-end ${isCancelled ? 'text-gray-400 line-through' : 'text-green-600'}`}>
                  <IndianRupee size={16} /> {Math.round(b.totalFare || 0).toLocaleString('en-IN')}
                </p>
              </div>

              <div className="flex flex-col md:flex-row justify-between gap-6 pr-32">
                <div className={`flex-1 ${isCancelled ? 'line-through text-gray-400' : ''}`}>
                  <h2 className="text-xl font-black text-gray-800 uppercase">{b.name || "Guest User"}</h2>
                  <p className="text-sm font-bold">{b.phone}</p>
                </div>
                <div className="flex gap-3">
                  <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${isCancelled ? 'grayscale opacity-50' : isExpired ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'}`}>
                    <Calendar size={16} className={isExpired ? 'text-red-600' : 'text-blue-600'} />
                    <span className="text-sm font-bold">{tripDate}</span>
                  </div>
                  <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${isCancelled ? 'grayscale opacity-50' : isExpired ? 'bg-red-50 border-red-100' : 'bg-indigo-50 border-indigo-100'}`}>
                    <Clock size={16} className={isExpired ? 'text-red-600' : 'text-indigo-600'} />
                    <span className="text-sm font-bold">{tripTime}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-6 text-xs font-bold text-gray-500">
                <span className="bg-gray-100 px-2 py-1 rounded">Distance: {displayDistance} KM</span>
                <span className="bg-gray-100 px-2 py-1 rounded uppercase">Type: {b.tripType || "City"}</span>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-2xl">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-black mb-1">Pickup Location</p>
                  <p className={`text-gray-700 font-medium break-words leading-tight ${isCancelled ? 'line-through text-gray-400' : ''}`}>
                    {b.pickup || "No Pickup Address Found"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-black mb-1">Drop Location</p>
                  <p className={`text-gray-700 font-medium break-words leading-tight ${isCancelled ? 'line-through text-gray-400' : ''}`}>
                    {b.drop || "No Drop Address Found"}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t pt-4">
                <span className={`text-xs font-black uppercase px-2 py-1 rounded ${
                  b.status === 'completed' ? 'bg-green-100 text-green-700' : 
                  isCancelled ? 'bg-gray-200 text-gray-500' : 
                  isExpired ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                }`}>
                   {isCancelled ? "CANCELLED" : isExpired ? "EXPIRED" : b.status}
                </span>
                
               <div className="flex gap-2">
  {/* ⭐ CHANGE: Only show buttons if the trip is NOT cancelled AND NOT completed */}
  {!isCancelled && b.status !== "completed" && (
    <>
      {isExpired ? (
        <button 
          onClick={() => updateStatus(b, "cancelled")} 
          className="bg-red-600 text-white font-bold px-6 py-2 rounded-xl hover:bg-red-700 transition"
        >
          Cancel Old
        </button>
      ) : (
        <button 
          onClick={() => openAssignModal(b.id)} 
          disabled={isAssigned && !assignedDriverOffline}
          className={`px-6 py-2 rounded-xl font-bold transition shadow-md ${ 
            (isAssigned && !assignedDriverOffline) 
              ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
              : assignedDriverOffline 
                ? "bg-red-600 text-white" 
                : "bg-black text-yellow-400 hover:bg-gray-800"
          }`}
        >
          {assignedDriverOffline ? "Reassign Now" : isAssigned ? "Driver Assigned" : "Assign Driver"}
        </button>
      )}
    </>
  )}
</div>
              </div>
            </div>
          );
        })}
        {filteredBookings.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
            <p className="text-gray-400 font-bold uppercase tracking-widest">No matching bookings found.</p>
          </div>
        )}
      </div>

      {/* DRIVER MODAL (Selection) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-gray-900 text-white flex justify-between items-center">
              <h3 className="text-xl font-black uppercase tracking-tight">Select Driver</h3>
              <button onClick={() => setShowModal(false)} className="bg-gray-800 p-2 rounded-full hover:bg-red-500 transition">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 bg-gray-100 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by name or phone..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-yellow-400 shadow-sm outline-none"
                  value={driverSearch}
                  onChange={(e) => setDriverSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="max-h-[400px] overflow-y-auto p-4 space-y-3">
              {filteredDrivers.map(driver => (
                <div key={driver.id} onClick={() => handleFinalAssignment(driver.id)} className="bg-white p-4 rounded-2xl border border-gray-100 hover:border-yellow-400 cursor-pointer transition flex justify-between items-center group">
                  <div className="flex items-center gap-4">
                    <div className="bg-yellow-100 p-3 rounded-xl text-yellow-700 group-hover:bg-yellow-400 group-hover:text-black transition"><User size={20} /></div>
                    <div>
                      <p className="font-black text-gray-800 uppercase">{driver.name}</p>
                      <p className="text-xs text-gray-500 font-bold">{driver.phone}</p>
                    </div>
                  </div>
                  <UserCheck className="text-gray-300 group-hover:text-green-500 transition" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;