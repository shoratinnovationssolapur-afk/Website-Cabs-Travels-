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
  const [bookingSearch, setBookingSearch] = useState("");

  const totalRevenue = bookings.reduce((acc, curr) => acc + (Number(curr.totalFare) || 0), 0);

  // 1. Monitor Bookings
  useEffect(() => {
    const q = collection(db, "bookings");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setBookings(list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    });
    return () => unsubscribe();
  }, []);

  // 2. ⭐ CORRECTED DRIVER FETCHING LOGIC
  useEffect(() => {
    // Only query for drivers who have toggled "Online" (available: true)
    const q = query(
      collection(db, "drivers"), 
      where("available", "==", true)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const driversList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // Accept both "active" and "approved" statuses found in your DB
      // We removed the strict 'onTrip' filter so you can see all online drivers
      const readyDrivers = driversList.filter(d => 
        d.status === "active" || d.status === "approved"
      );
      
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

      {/* BOOKING LIST */}
      <div className="space-y-4">
        {filteredBookings.map(b => {
          const bookingDateObj = b.dateTime ? new Date(b.dateTime) : null;
          const isCancelled = b.status === "cancelled" || b.status === "rejected";
          const isAssigned = b.status === "assigned" || b.driverId;

          return (
            <div key={b.id} className={`bg-white p-6 rounded-2xl shadow-sm relative border-l-8 ${
              isCancelled ? 'border-gray-400' : 'border-yellow-400'
            }`}>
              <div className="absolute top-4 right-4 text-right">
                <p className="text-lg font-black text-green-600">
                  ₹{Math.round(b.totalFare || 0).toLocaleString('en-IN')}
                </p>
              </div>

              <h2 className="text-xl font-black text-gray-800 uppercase">{b.name || "Guest User"}</h2>
              <p className="text-sm font-bold text-gray-500 mb-4">{b.phone}</p>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-2xl">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-black mb-1">Pickup</p>
                  <p className="text-gray-700 font-medium leading-tight">{b.pickup}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-black mb-1">Drop</p>
                  <p className="text-gray-700 font-medium leading-tight">{b.drop}</p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t pt-4">
                <span className="text-xs font-black uppercase bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {b.status}
                </span>
                
                {!isCancelled && (
                  <button 
                    onClick={() => openAssignModal(b.id)} 
                    disabled={isAssigned}
                    className={`px-6 py-2 rounded-xl font-bold transition shadow-md ${
                      isAssigned ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-black text-yellow-400 hover:bg-gray-800"
                    }`}
                  >
                    {isAssigned ? "Driver Assigned" : "Assign Driver"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* DRIVER MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 bg-gray-900 text-white flex justify-between items-center">
              <h3 className="text-xl font-black uppercase tracking-tight">Select Driver</h3>
              <button onClick={() => setShowModal(false)} className="bg-gray-800 p-2 rounded-full hover:bg-red-500">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 bg-gray-100 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search name or phone..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-yellow-400 outline-none"
                  value={driverSearch}
                  onChange={(e) => setDriverSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto p-4 space-y-3">
              {filteredDrivers.map(driver => (
                <div 
                  key={driver.id} 
                  onClick={() => handleFinalAssignment(driver.id)} 
                  className={`bg-white p-4 rounded-2xl border cursor-pointer transition flex justify-between items-center group ${
                    driver.onTrip ? 'border-orange-200 bg-orange-50' : 'border-gray-100 hover:border-yellow-400'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${driver.onTrip ? 'bg-orange-200 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      <User size={20} />
                    </div>
                    <div>
                      <p className="font-black text-gray-800 uppercase">{driver.name}</p>
                      <p className="text-xs text-gray-500 font-bold">
                        {driver.onTrip ? "⚠️ ON ANOTHER TRIP" : driver.phone}
                      </p>
                    </div>
                  </div>
                  <UserCheck className={driver.onTrip ? 'text-orange-400' : 'text-gray-300'} />
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