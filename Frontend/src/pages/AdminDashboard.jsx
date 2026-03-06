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

// Updated COLORS to match the KPI card themes in the image
const COLORS = ["#8B5CF6", "#10B981", "#F59E0B", "#EC4899", "#0EA5E9", "#64748B"];

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
      
      const cabRevenue = bookings.reduce((acc, curr) => {
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
    <div className="min-h-screen bg-[#0a0a0b] text-white p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl md:text-4xl font-bold mb-6 md:mb-8 text-yellow-500">Admin Dashboard</h1>

      {/* Adjusted Grid to match 6-column layout in screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-10">
        <Card title="Total Bookings" value={stats.bookings} color="from-[#7c3aed] to-[#6d28d9]" />
        <Card title="Booking Revenue" value={`₹ ${Math.round(stats.revenue).toLocaleString('en-IN')}`} color="from-[#059669] to-[#047857]" />
        <Card title="Tour Revenue" value={`₹ ${Math.round(stats.tourRevenue).toLocaleString('en-IN')}`} color="from-[#ea580c] to-[#c2410c]" />
        <Card title="Total Revenue" value={`₹ ${Math.round(stats.totalRevenue).toLocaleString('en-IN')}`} color="from-[#db2777] to-[#be185d]" />
        <Card title="Users" value={stats.users} color="from-[#0284c7] to-[#0369a1]" />
        <Card title="Vehicles" value={stats.vehicles} color="from-[#4b5563] to-[#374151]" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <div className="bg-[#141416] p-4 sm:p-6 rounded-2xl shadow-2xl border border-white/5">
          <h2 className="font-bold mb-6 text-xl text-gray-200 uppercase tracking-tight">Monthly Bookings</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <XAxis dataKey="name" stroke="#e2e2eb" fontSize={12} tickLine={false} axisLine={true} />
              <YAxis stroke="#e2e2eb" fontSize={12} tickLine={false} axisLine={true} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "12px", color: "#fff" }}
              />
              <Line type="monotone" dataKey="bookings" stroke="#eab308" strokeWidth={4} dot={{ r: 6, fill: "#eab308" }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#141416] p-4 sm:p-6 rounded-2xl shadow-2xl border border-white/5">
          <h2 className="font-bold mb-6 text-xl text-gray-200 uppercase tracking-tight">Booking Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={100} innerRadius={65} paddingAngle={8}>
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #010101", borderRadius: "12px", fontWeight: "bold", color: "#000" }}
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
    <div className={`bg-gradient-to-br ${color} p-5 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300`}>
      <p className="text-white/80 text-[11px] font-bold uppercase tracking-wider leading-none mb-3">{title}</p>
      <h2 className="text-3xl font-black">{value}</h2>
    </div>
  );
}
