import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { Calendar, MapPin, IndianRupee, Clock } from "lucide-react";

const DriverHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const q = query(
          collection(db, "confirmed_bookings"),
          where("driverId", "==", auth.currentUser.uid),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        setHistory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <div className="p-10 animate-pulse text-gray-500">Loading your journey...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Ride History</h1>
        <span className="bg-slate-200 px-3 py-1 rounded-full text-sm font-semibold text-slate-600">
          Total Rides: {history.length}
        </span>
      </div>

      <div className="grid gap-4">
        {history.length > 0 ? (
          history.map((ride) => (
            <div key={ride.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Calendar size={16} />
                  {ride.createdAt?.toDate().toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
                  <Clock size={16} className="ml-2" />
                  {ride.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="font-medium">{ride.pickup}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="font-medium">{ride.drop}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-row md:flex-col justify-between items-end gap-2 border-t md:border-t-0 pt-4 md:pt-0">
                <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase font-bold">Fare Collected</p>
                  <p className="text-xl font-black text-slate-800 flex items-center justify-end">
                    <IndianRupee size={18} /> {ride.totalFare}
                  </p>
                </div>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-bold uppercase">
                  Completed
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-20 text-center rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400">No completed rides found yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverHistory;