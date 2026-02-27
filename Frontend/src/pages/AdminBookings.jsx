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
import { X, MapPin, UserCheck, Search, Clock, Calendar, IndianRupee, TrendingUp } from "lucide-react";

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeBookingId, setActiveBookingId] = useState(null);
  const [driverSearch, setDriverSearch] = useState("");

  // Calculate Total Revenue
  const totalRevenue = bookings.reduce((acc, curr) => acc + (Number(curr.totalFare) || 0), 0);

  useEffect(() => {
    const q = collection(db, "bookings");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setBookings(list.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
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
    await autoAssignDriver(activeBookingId, driverId);
    setShowModal(false);
    setActiveBookingId(null);
  };

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
              <IndianRupee size={20} /> {totalRevenue.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {bookings.map(b => {
          const isCarBooking = b.bookingMethod === "car_specific";
          
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
                  isCarBooking ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                }`}>
                  {isCarBooking ? 'Car Specific' : 'Quick Booking'}
                </span>
                <p className="text-lg font-black text-green-600 flex items-center justify-end">
                   <IndianRupee size={16} /> {Number(b.totalFare || 0).toLocaleString('en-IN')}
                </p>
              </div>

              <div className="flex flex-col md:flex-row justify-between gap-6 pr-32">
                <div className="flex-1">
                  <h2 className="text-xl font-black text-gray-800 uppercase">
                    {b.name || b.passengers?.[0]?.name || "Guest User"}
                  </h2>
                  <p className="text-sm text-gray-500 font-bold">{b.phone}</p>
                  <p className="text-[10px] text-blue-600 font-black uppercase mt-1">{b.vehicleName}</p>
                </div>

                <div className="flex gap-4">
                  <div className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 flex items-center gap-3">
                    <Calendar size={16} className="text-blue-500" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Date</p>
                      <p className="text-sm font-bold text-gray-700">{tripDate}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 flex items-center gap-3">
                    <Clock size={16} className="text-blue-500" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Time</p>
                      <p className="text-sm font-bold text-gray-700">{tripTime}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trip Stats (Distance/Duration) */}
              <div className="mt-4 flex gap-6 text-xs font-bold text-gray-500">
                <span className="bg-gray-100 px-2 py-1 rounded">Distance: {(b.distance / 1000).toFixed(2)} KM</span>
                <span className="bg-gray-100 px-2 py-1 rounded">Duration: {b.durationDays} Days</span>
                <span className="bg-gray-100 px-2 py-1 rounded uppercase">Type: {b.tripType}</span>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm bg-gray-50 p-4 rounded-2xl">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-black mb-1">Pickup Location</p>
                  <p className="text-gray-700 font-medium leading-tight truncate">{b.pickup}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-black mb-1">Drop Location</p>
                  <p className="text-gray-700 font-medium leading-tight truncate">{b.drop}</p>
                </div>
              </div>

              {/* ... Action buttons remain the same ... */}
              <div className="mt-6 flex items-center justify-between border-t pt-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase">Status</span>
                  <span className={`text-xs font-black uppercase px-2 py-1 rounded ${
                    b.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {b.status}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  {b.status === "pending" && (
                    <>
                      <button onClick={() => updateStatus(b, "approved")} className="bg-green-600 text-white font-bold px-4 py-2 rounded-xl hover:bg-green-700 transition">Approve</button>
                      <button onClick={() => updateStatus(b, "rejected")} className="bg-red-50 text-red-600 font-bold px-4 py-2 rounded-xl hover:bg-red-100 transition">Reject</button>
                    </>
                  )}

                  {b.status !== "completed" && b.status !== "rejected" && (
                    <button
                      onClick={() => openAssignModal(b.id)}
                      className="bg-black text-yellow-400 px-6 py-2 rounded-xl font-bold hover:bg-gray-800 transition shadow-md"
                    >
                      {b.status === "assigned" ? "Re-assign Driver" : "Assign Driver"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DRIVER MODAL REMAINS THE SAME */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          {/* ... Modal Content ... */}
        </div>
      )}
    </div>
  );
};

export default AdminBookings;