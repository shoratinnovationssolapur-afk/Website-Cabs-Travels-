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
import { X, MapPin, UserCheck, Search, Clock, Calendar } from "lucide-react";

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeBookingId, setActiveBookingId] = useState(null);
  const [driverSearch, setDriverSearch] = useState("");


  
  // 1. Listen to Bookings (Real-time)
  useEffect(() => {
  
    const q = collection(db, "bookings");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort by most recent createdAt timestamp
      setBookings(list.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
    });
    return () => unsubscribe();
  }, []);

  // 2. Optimized Driver Listener
  // Only shows drivers who are: Active (Account), Online (Toggle), and NOT on a trip
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
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Fleet Bookings</h1>

      <div className="space-y-4">
        {bookings.map(b => {
          const isCarBooking = b.passengers && b.passengers.length > 0 && b.passengers[0].age;
  
          // Formatting the Trip Schedule from ISO string
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
              {/* Category Badge */}
              <span className={`absolute top-4 right-4 px-3 py-1 text-[10px] rounded-full font-black uppercase tracking-widest ${
                isCarBooking ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
              }`}>
                {isCarBooking ? 'Car Specific' : 'Quick Booking'}
              </span>

              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                  <h2 className="text-xl font-black text-gray-800 uppercase">
                    {b.passengers?.[0]?.name || b.name || "Guest User"}
                  </h2>
                  <p className="text-sm text-gray-500 font-bold">{b.phone}</p>
                </div>

                {/* VISIBLE DATE & TIME SECTION */}
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

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm bg-gray-50 p-4 rounded-2xl">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-black mb-1">Pickup Location</p>
                  <p className="text-gray-700 font-medium leading-tight">{b.pickup}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-black mb-1">Drop Location</p>
                  <p className="text-gray-700 font-medium leading-tight">{b.drop}</p>
                </div>
              </div>

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

      {/* DRIVER MODAL (UNCHANGED LOGIC) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl flex flex-col max-h-[80vh]">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-3xl">
              <div>
                <h2 className="font-black text-xl text-gray-800">Dispatch Driver</h2>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-tighter">Available & Online Only</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition">
                <X size={24} />
              </button>
            </div>

            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text"
                  placeholder="Search driver name..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-yellow-400 transition"
                  onChange={(e) => setDriverSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-y-auto p-4 space-y-3">
              {availableDrivers
                .filter(d => d.name.toLowerCase().includes(driverSearch.toLowerCase()))
                .length > 0 ? (
                availableDrivers
                  .filter(d => d.name.toLowerCase().includes(driverSearch.toLowerCase()))
                  .map((driver) => (
                  <div 
                    key={driver.id} 
                    className="border border-gray-100 p-4 rounded-2xl hover:border-yellow-400 hover:bg-yellow-50 transition cursor-pointer flex justify-between items-center group"
                    onClick={() => handleFinalAssignment(driver.id)}
                  >
                    <div className="flex-1">
                      <p className="font-black text-gray-800 group-hover:text-yellow-700">{driver.name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1 font-medium">
                        <MapPin size={12} className="text-red-500"/> {driver.address || "Location Hidden"}
                      </p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <UserCheck className="text-green-600" size={20}/>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-sm font-bold italic">No drivers online and available.</p>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-gray-50 text-center rounded-b-3xl">
               <button onClick={() => setShowModal(false)} className="text-sm font-black text-gray-400 hover:text-red-500 uppercase tracking-widest">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;