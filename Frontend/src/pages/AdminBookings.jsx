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
import { X, MapPin, UserCheck, Search, Clock, Calendar, IndianRupee, TrendingUp, User } from "lucide-react";

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeBookingId, setActiveBookingId] = useState(null);
  const [driverSearch, setDriverSearch] = useState("");

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
    const q = query(
      collection(db, "drivers"),
      where("status", "==", "active"),
      where("available", "==", true),
      where("onTrip", "==", false)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAvailableDrivers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
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
    try {
      await autoAssignDriver(activeBookingId, driverId);
      setShowModal(false);
      setActiveBookingId(null);
      alert("Driver assigned successfully!");
    } catch (error) {
      alert("Assignment failed: " + error.message);
    }
  };

  const filteredDrivers = availableDrivers.filter(d =>
    d.name?.toLowerCase().includes(driverSearch.toLowerCase()) ||
    d.phone?.includes(driverSearch)
  );

  return (
    <div className="p-10 bg-gray-100 min-h-screen">
      {/* HEADER WITH REVENUE STATS */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-800 uppercase tracking-tight">Fleet Bookings</h1>
          <p className="text-gray-500 font-bold text-sm">Manage orders and track revenue</p>
        </div>

        <div className="bg-white px-8 py-4 rounded-3xl shadow-sm border border-green-100 flex items-center gap-6">
          <div className="bg-green-500 p-3 rounded-2xl text-white">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Total Fleet Revenue</p>
            <p className="text-2xl font-black text-gray-900 flex items-center">
              <IndianRupee size={20} /> {Math.round(totalRevenue).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {bookings.map(b => {
          // ⭐ FIXED: Logic moved inside .map() so 'b' is accessible
          const tripDate = b.dateTime 
            ? new Date(b.dateTime).toLocaleDateString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric'
              })
            : "Date N/A";

          const tripTime = b.dateTime 
            ? new Date(b.dateTime).toLocaleTimeString('en-US', {
                hour: '2-digit', minute: '2-digit', hour12: true
              })
            : "Time N/A";

          return (
            <div key={b.id} className="bg-white p-6 rounded-2xl shadow-sm relative border-l-8 border-yellow-400">
              
              {/* Fare Badge */}
              <div className="absolute top-4 right-4 text-right">
                <span className={`px-3 py-1 text-[10px] rounded-full font-black uppercase tracking-widest block mb-2 ${
                  b.bookingMethod === "car_specific" ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                }`}>
                  {b.bookingMethod === "car_specific" ? 'Car Specific' : 'Quick Booking'}
                </span>
                <p className="text-lg font-black text-green-600 flex items-center justify-end">
                  <IndianRupee size={16} /> {Math.round(b.totalFare || 0).toLocaleString('en-IN')}
                </p>
              </div>

              <div className="flex flex-col md:flex-row justify-between gap-6 pr-32">
                <div className="flex-1">
                  <h2 className="text-xl font-black text-gray-800 uppercase">{b.name || "Guest User"}</h2>
                  <p className="text-sm text-gray-500 font-bold">{b.phone}</p>
                </div>
              </div>

              {/* Date and Time Badges */}
              <div className="flex gap-3 mt-4">
                <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 flex items-center gap-3">
                  <Calendar size={18} className="text-blue-600" />
                  <div>
                    <p className="text-[10px] text-blue-400 font-black uppercase">Date</p>
                    <p className="text-sm font-bold text-blue-900">{tripDate}</p>
                  </div>
                </div>
                <div className="bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 flex items-center gap-3">
                  <Clock size={18} className="text-indigo-600" />
                  <div>
                    <p className="text-[10px] text-indigo-400 font-black uppercase">Time</p>
                    <p className="text-sm font-bold text-indigo-900">{tripTime}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-6 text-xs font-bold text-gray-500">
                <span className="bg-gray-100 px-2 py-1 rounded">Distance: {(b.distance || 0).toFixed(2)} KM</span>
                <span className="bg-gray-100 px-2 py-1 rounded uppercase">Type: {b.tripType || "City"}</span>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm bg-gray-50 p-4 rounded-2xl">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-black mb-1">Pickup Location</p>
                  <p className="text-gray-700 font-medium leading-tight break-words">
                    {b.pickup || "No Pickup Address Found"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-black mb-1">Drop Location</p>
                  <p className="text-gray-700 font-medium leading-tight break-words">
                    {b.drop || "No Drop Address Found"}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t pt-4">
                <span className={`text-xs font-black uppercase px-2 py-1 rounded ${
                  b.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {b.status}
                </span>

                <div className="flex gap-2">
                  {b.status === "pending" && (
                    <button onClick={() => updateStatus(b, "approved")} className="bg-green-600 text-white font-bold px-4 py-2 rounded-xl">Approve</button>
                  )}
                  {b.status !== "completed" && b.status !== "rejected" && (
                    <button onClick={() => openAssignModal(b.id)} className="bg-black text-yellow-400 px-6 py-2 rounded-xl font-bold">
                      Assign Driver
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DRIVER ASSIGNMENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 bg-gray-900 text-white flex justify-between items-center">
              <h3 className="text-xl font-black uppercase tracking-tight">Select Driver</h3>
              <button onClick={() => setShowModal(false)} className="bg-gray-800 p-2 rounded-full hover:bg-red-500 transition">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 bg-gray-100">
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
              {filteredDrivers.length > 0 ? (
                filteredDrivers.map(driver => (
                  <div
                    key={driver.id}
                    className="bg-white p-4 rounded-2xl border border-gray-100 hover:border-yellow-400 cursor-pointer transition flex justify-between items-center group"
                    onClick={() => handleFinalAssignment(driver.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-yellow-100 p-3 rounded-xl text-yellow-700 group-hover:bg-yellow-400 group-hover:text-black transition">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="font-black text-gray-800 uppercase">{driver.name}</p>
                        <p className="text-xs text-gray-500 font-bold">{driver.phone}</p>
                      </div>
                    </div>
                    <UserCheck className="text-gray-300 group-hover:text-green-500 transition" />
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-400 font-bold">No available drivers found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;