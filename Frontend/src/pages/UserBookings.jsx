import React, { useEffect, useState, useMemo } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { TbMoodSad, TbFilter } from "react-icons/tb";
import { Calendar, Clock, MapPin, Car, ChevronRight, ChevronDown } from "lucide-react";

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New State for Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateSort, setDateSort] = useState("desc"); // 'desc' for Newest, 'asc' for Oldest

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "bookings"),
      where("userId", "==", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setBookings(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter and Sort Logic
  const filteredBookings = useMemo(() => {
    let result = [...bookings];

    // 1. Filter by Status
    if (statusFilter !== "all") {
      result = result.filter((b) => b.status?.toLowerCase() === statusFilter.toLowerCase());
    }

    // 2. Sort by Date
    result.sort((a, b) => {
      const dateA = new Date(a.dateTime || a.createdAt?.seconds * 1000);
      const dateB = new Date(b.dateTime || b.createdAt?.seconds * 1000);
      return dateSort === "desc" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [bookings, statusFilter, dateSort]);

  if (loading) {
    return <div className="p-8 md:p-10 text-center font-bold text-gray-500 italic">Loading your trips...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-4 md:p-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">My Bookings</h1>
          <p className="text-xs font-bold text-gray-400 uppercase mt-1">{bookings.length} Total Trips Found</p>
        </div>
        
        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center bg-white border border-gray-200 rounded-2xl px-3 py-2 shadow-sm">
            <TbFilter className="text-gray-400 mr-2" size={18} />
            <select 
              className="bg-transparent text-xs font-bold text-gray-700 outline-none appearance-none pr-6 cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="assigned">Assigned</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 pointer-events-none text-gray-400" />
          </div>

          <div className="relative flex items-center bg-white border border-gray-200 rounded-2xl px-3 py-2 shadow-sm">
            <select 
              className="bg-transparent text-xs font-bold text-gray-700 outline-none appearance-none pr-6 cursor-pointer"
              value={dateSort}
              onChange={(e) => setDateSort(e.target.value)}
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 pointer-events-none text-gray-400" />
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 md:p-12 text-center border-2 border-dashed border-gray-200">
          <TbMoodSad className="mx-auto text-5xl md:text-6xl text-gray-300 mb-4" />
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">No matches found</h2>
          <p className="text-gray-500 mt-2 text-sm md:text-base">
            Try adjusting your filters to see more results.
          </p>
          {statusFilter !== 'all' && (
            <button 
              onClick={() => setStatusFilter('all')}
              className="mt-4 text-blue-600 font-bold text-sm underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:gap-6">
          {filteredBookings.map((b) => {
            const dateObj = b.dateTime ? new Date(b.dateTime) : null;
            const tripDate = dateObj
              ? dateObj.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
              : "Date N/A";
            const tripTime = dateObj
              ? dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
              : "Time N/A";

            return (
              <div
                key={b.id}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* ... (Rest of your existing booking card JSX remains the same) ... */}
                <div className="p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3 mb-5 md:mb-6">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="bg-blue-600 p-3 rounded-2xl text-white shrink-0">
                        <Car size={22} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-black text-gray-900 uppercase tracking-tight truncate">
                          {b.vehicleName || "Standard Vehicle"}
                        </h3>
                        <p className="text-xs text-gray-400 font-bold uppercase">Booking ID: #{b.id.slice(-6)}</p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest w-fit ${
                        b.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : b.status === "approved"
                            ? "bg-yellow-100 text-yellow-700"
                            : b.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {b.status || "pending"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 md:mb-6">
                    <div className="bg-gray-50 p-3 rounded-2xl flex items-center gap-3 border border-gray-100">
                      <Calendar size={18} className="text-blue-500 shrink-0" />
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Date</p>
                        <p className="text-sm font-bold text-gray-700">{tripDate}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-2xl flex items-center gap-3 border border-gray-100">
                      <Clock size={18} className="text-blue-500 shrink-0" />
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Pickup Time</p>
                        <p className="text-sm font-bold text-gray-700">{tripTime}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center shrink-0">
                        <MapPin size={16} className="text-green-500 z-10" />
                        <div className="w-0.5 h-8 bg-gray-200 border-dashed border-l" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Pickup</p>
                        <p className="text-sm font-medium text-gray-700 break-words">{b.pickup}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin size={16} className="text-red-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Drop-off</p>
                        <p className="text-sm font-medium text-gray-700 break-words">{b.drop}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 md:px-6 py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border-t border-gray-50">
                  <span className="text-xs font-bold text-gray-400">
                    Total Fare: Rs.{b.totalFare ? Number(b.totalFare).toFixed(2) : "TBA"}
                  </span>
                  <button className="text-blue-600 text-xs font-black uppercase flex items-center gap-1 hover:underline w-fit">
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