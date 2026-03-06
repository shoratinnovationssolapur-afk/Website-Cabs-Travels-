import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { TrendingUp, Wallet, Award, ArrowUpRight } from "lucide-react";

const DriverEarnings = () => {
  const [stats, setStats] = useState({ total: 0, count: 0, monthTotal: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const q = query(
          collection(db, "confirmed_bookings"),
          where("driverId", "==", auth.currentUser.uid)
        );
        const snap = await getDocs(q);
        
        let total = 0;
        let monthTotal = 0;
        const currentMonth = new Date().getMonth();

        snap.forEach(doc => {
          const data = doc.data();
          const fare = parseFloat(data.totalFare || 0);
          total += fare;
          
          if (data.createdAt?.toDate().getMonth() === currentMonth) {
            monthTotal += fare;
          }
        });

        setStats({ total, count: snap.size, monthTotal });
      } catch (error) {
        console.error("Earnings Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  const cardStyle = "bg-white p-6 rounded-3xl shadow-sm border border-gray-100";

  return (
    <div className="space-y-6 md:space-y-8">
      <h1 className="text-xl md:text-2xl font-bold text-slate-800">Earnings Dashboard</h1>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${cardStyle} bg-slate-900 text-white`}>
          <Wallet className="text-green-400 mb-4" size={32} />
          <p className="text-slate-400 text-sm font-medium">Total Lifetime Earnings</p>
          <h2 className="text-3xl font-black mt-1">₹{stats.total.toLocaleString()}</h2>
        </div>

        <div className={cardStyle}>
          <TrendingUp className="text-blue-500 mb-4" size={32} />
          <p className="text-gray-400 text-sm font-medium">Earnings This Month</p>
          <h2 className="text-3xl font-black text-slate-800 mt-1">₹{stats.monthTotal.toLocaleString()}</h2>
        </div>

        <div className={cardStyle}>
          <Award className="text-yellow-500 mb-4" size={32} />
          <p className="text-gray-400 text-sm font-medium">Completed Rides</p>
          <h2 className="text-3xl font-black text-slate-800 mt-1">{stats.count}</h2>
        </div>
      </div>

      {/* EARNINGS LOGIC HINT */}
      <div className="bg-green-50 p-4 md:p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-green-800 font-bold">Payout Status</h3>
          <p className="text-green-600 text-sm">Your next payout will be processed on the 1st of next month.</p>
        </div>
        <ArrowUpRight className="text-green-400" size={40} />
      </div>

      {/* RECENT PERFORMANCE */}
      <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold mb-4 text-slate-800">Performance Summary</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Average Earning Per Ride</span>
            <span className="font-bold">₹{stats.count > 0 ? (stats.total / stats.count).toFixed(0) : 0}</span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
             <div className="bg-green-500 h-full" style={{ width: '75%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverEarnings;
