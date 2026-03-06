import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { Calendar, IndianRupee, Clock } from "lucide-react";

const DriverHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!auth.currentUser) return;

      try {
        const q = query(
          collection(db, "confirmed_bookings"),
          where("driverId", "==", auth.currentUser.uid),
          orderBy("createdAt", "desc")
        );
        
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        }));
        setHistory(data);
      } catch (error) {
        console.error("History Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) return <div className="p-6 md:p-10 animate-pulse text-gray-500 text-center">Loading History...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h1 className="text-xl md:text-2xl font-bold text-slate-800">My Completed Rides</h1>
        <span className="bg-blue-100 px-4 py-1 rounded-full text-sm font-bold text-blue-600">
          {history.length} Rides
        </span>
      </div>

      <div className="grid gap-4">
        {history.length > 0 ? (
          history.map((ride) => (
            <div key={ride.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-slate-500 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    {ride.createdAt?.toDate ? ride.createdAt.toDate().toLocaleDateString() : 'Just now'}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    {ride.createdAt?.toDate ? ride.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span> {ride.pickup}
                  </p>
                  <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span> {ride.drop}
                  </p>
                </div>
              </div>

              <div className="flex md:flex-col justify-between items-end border-t md:border-t-0 pt-3 md:pt-0">
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 uppercase font-black">Earnings</p>
                  <p className="text-lg font-bold text-slate-900 flex items-center justify-end">
                    <IndianRupee size={16} />{ride.totalFare}
                  </p>
                </div>
                <span className="text-[10px] bg-green-50 text-green-600 px-2 py-1 rounded font-bold uppercase tracking-wider mt-1">
                  Success
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-gray-50 p-8 md:p-20 text-center rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">No trip history found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverHistory;
