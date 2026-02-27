import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { TbMoodSad } from "react-icons/tb";
import { Calendar, Clock, MapPin, Car, ChevronRight } from "lucide-react";

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    // 1. Setup Real-time Listener (onSnapshot)
    const q = query(
      collection(db, "bookings"),
      where("userId", "==", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      
      // Sort by most recent (using createdAt or dateTime)
      const sortedList = list.sort((a, b) => {
        const dateA = new Date(a.dateTime || a.createdAt?.seconds * 1000);
        const dateB = new Date(b.dateTime || b.createdAt?.seconds * 1000);
        return dateB - dateA;
      });

      setBookings(sortedList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="p-10 text-center font-bold text-gray-500">Loading your trips...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Bookings</h1>
        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
          {bookings.length} Total Trips
        </span>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
          <TbMoodSad className="mx-auto text-6xl text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">No bookings found</h2>
          <p className="text-gray-500 mt-2">Ready to hit the road? Your future trips will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map((b) => {
            // Formatting logic from reference
            const dateObj = b.dateTime ? new Date(b.dateTime) : null;
            const tripDate = dateObj 
              ? dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
              : "Date N/A";

            const tripTime = dateObj 
              ? dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
              : "Time N/A";

            return (
              <div key={b.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Top Row: Vehicle & Status */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-600 p-3 rounded-2xl text-white">
                        <Car size={24} />
                      </div>
                      <div>
                        <h3 className="font-black text-gray-900 uppercase tracking-tight">
                          {b.vehicleName || "Standard Vehicle"}
                        </h3>
                        <p className="text-xs text-gray-400 font-bold uppercase">Booking ID: #{b.id.slice(-6)}</p>
                      </div>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      b.status === 'completed' ? 'bg-green-100 text-green-700' : 
                      b.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {b.status || 'pending'}
                    </span>
                  </div>

                  {/* Date & Time Row */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-gray-50 p-3 rounded-2xl flex items-center gap-3 border border-gray-100">
                      <Calendar size={18} className="text-blue-500" />
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Date</p>
                        <p className="text-sm font-bold text-gray-700">{tripDate}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-2xl flex items-center gap-3 border border-gray-100">
                      <Clock size={18} className="text-blue-500" />
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Pickup Time</p>
                        <p className="text-sm font-bold text-gray-700">{tripTime}</p>
                      </div>
                    </div>
                  </div>

                  {/* Route Row */}
                  <div className="space-y-4 relative">
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <MapPin size={16} className="text-green-500 z-10" />
                        <div className="w-0.5 h-8 bg-gray-200 border-dashed border-l"></div>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Pickup</p>
                        <p className="text-sm font-medium text-gray-700">{b.pickup}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin size={16} className="text-red-500" />
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Drop-off</p>
                        <p className="text-sm font-medium text-gray-700">{b.drop}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Link (Optional) */}
                <div className="bg-gray-50 px-6 py-3 flex justify-between items-center border-t border-gray-50">
                  <span className="text-xs font-bold text-gray-400">Total Fare: ₹{b.price || b.totalAmount || "TBA"}</span>
                  <button className="text-blue-600 text-xs font-black uppercase flex items-center gap-1 hover:underline">
                    View Details <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserBookings;