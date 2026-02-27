import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

import {
  LineChart,
  Line, 
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#6366F1", "#22C55E", "#F59E0B", "#EF4444"];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    bookings: 0,
    users: 0,
    vehicles: 0,
    revenue: 0,      // Total Car Booking Revenue
    tourRevenue: 0,  // From tour_bookings collection
    totalRevenue: 0, // Sum of both
  });

  const [monthlyData, setMonthlyData] = useState([]);
  const [statusData, setStatusData] = useState([]);

  useEffect(() => {
    // 1. Listen to Car Bookings
    const unsubBookings = onSnapshot(collection(db, "bookings"), (snapshot) => {
      const bookings = snapshot.docs.map(d => d.data());
      
      // FIX: Summing totalFare for ALL valid car bookings
      // Based on your Firestore data, we sum where 'totalFare' exists
      const cabRevenue = bookings.reduce((acc, curr) => {
        // Only count revenue for orders that are confirmed/finished
        if (curr.status === "approved" || curr.status === "completed") {
          return acc + (Number(curr.totalFare) || 0);
        }
        return acc;
      }, 0);

      setStats(prev => {
        const newTotal = cabRevenue + prev.tourRevenue;
        return {
          ...prev,
          bookings: snapshot.size,
          revenue: cabRevenue,
          totalRevenue: newTotal,
        };
      });

      // --- Chart Processing logic remains the same ---
      const monthMap = {};
      bookings.forEach(b => {
        if (!b.createdAt) return;
        const date = b.createdAt.toDate();
        const m = date.toLocaleString("default", { month: "short" });
        monthMap[m] = (monthMap[m] || 0) + 1;
      });
      setMonthlyData(Object.keys(monthMap).map(m => ({ name: m, bookings: monthMap[m] })));

      const statusMap = {};
      bookings.forEach(b => {
        const s = b.status || "pending";
        statusMap[s] = (statusMap[s] || 0) + 1;
      });
      setStatusData(Object.keys(statusMap).map(k => ({ name: k, value: statusMap[k] })));
    });

    // 2. Listen to Tour Bookings
    const unsubTourBookings = onSnapshot(collection(db, "tour_bookings"), (snapshot) => {
      const tourTotal = snapshot.docs.reduce((acc, curr) => {
        const data = curr.data();
        return acc + (Number(data.price || data.totalFare) || 0);
      }, 0);

      setStats(prev => ({
        ...prev,
        tourRevenue: tourTotal,
        totalRevenue: prev.revenue + tourTotal,
      }));
    });

    // 3. Listen to Users
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      setStats(prev => ({ ...prev, users: snapshot.size }));
    });

    // 4. Listen to Vehicles
    const unsubVehicles = onSnapshot(collection(db, "vehicles"), (snapshot) => {
      setStats(prev => ({ ...prev, vehicles: snapshot.size }));
    });

    return () => {
      unsubBookings();
      unsubTourBookings();
      unsubUsers();
      unsubVehicles();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-yellow-400">Admin Dashboard</h1>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-10">
        <Card title="Total Bookings" value={stats.bookings} color="from-indigo-600 to-purple-700" />
        <Card title="Booking Revenue" value={`₹ ${stats.revenue.toLocaleString('en-IN')}`} color="from-green-600 to-emerald-700" />
        <Card title="Tour Revenue" value={`₹ ${stats.tourRevenue.toLocaleString('en-IN')}`} color="from-yellow-600 to-orange-700" />
        <Card title="Total Revenue" value={`₹ ${stats.totalRevenue.toLocaleString('en-IN')}`} color="from-pink-600 to-rose-700" />
        <Card title="Users" value={stats.users} color="from-blue-600 to-cyan-700" />
        <Card title="Vehicles" value={stats.vehicles} color="from-gray-600 to-slate-700" />
      </div>
      
      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-2xl">
          <h2 className="font-bold mb-6 text-xl text-gray-300">Monthly Bookings</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#111", border: "none", borderRadius: "10px", color: "#fff" }}
              />
              <Line type="monotone" dataKey="bookings" stroke="#FACC15" strokeWidth={4} dot={{ r: 6, fill: "#FACC15" }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-2xl">
          <h2 className="font-bold mb-6 text-xl text-gray-300">Booking Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={100} innerRadius={60} paddingAngle={5}>
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: "#111", border: "none", borderRadius: "10px", color: "#fff" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, color }) {
  return (
    <div className={`bg-gradient-to-br ${color} p-6 rounded-3xl shadow-xl hover:translate-y-[-5px] transition-all duration-300`}>
      <p className="text-white/70 text-[10px] font-black uppercase tracking-widest">{title}</p>
      <h2 className="text-2xl font-black mt-1">{value}</h2>
    </div>
  );
}