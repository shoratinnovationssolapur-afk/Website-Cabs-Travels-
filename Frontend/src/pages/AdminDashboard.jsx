import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query } from "firebase/firestore";

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
    revenue: 0,      // Quick Booking Revenue
    tourRevenue: 0,  // From tour_bookings collection
    totalRevenue: 0, // Sum of both
  });

  const [monthlyData, setMonthlyData] = useState([]);
  const [statusData, setStatusData] = useState([]);

  useEffect(() => {
    // 1. Listen to Quick Bookings (Cab Services)
    const unsubBookings = onSnapshot(collection(db, "bookings"), (snapshot) => {
  const bookings = snapshot.docs.map(d => d.data());
  
  // Summing totalFare for all bookings not marked as 'car_specific'
  const quickRev = bookings
    .filter(b => b.bookingMethod !== "car_specific")
    .reduce((acc, curr) => {
      // Logic: If totalFare exists, use it; otherwise, use 0
      return acc + (Number(curr.totalFare) || 0);
    }, 0);

  setStats(prev => ({
    ...prev,
    bookings: snapshot.size,
    revenue: quickRev,
    totalRevenue: quickRev + prev.tourRevenue,
  }));


      // Process Monthly Data for Charts
      const monthMap = {};
      bookings.forEach(b => {
        if (!b.createdAt) return;
        const date = b.createdAt.toDate();
        const m = date.toLocaleString("default", { month: "short" });
        monthMap[m] = (monthMap[m] || 0) + 1;
      });

      setMonthlyData(
        Object.keys(monthMap).map(m => ({
          name: m,
          bookings: monthMap[m],
        }))
      );

      // Process Status Data for Pie Chart
      const statusMap = {};
      bookings.forEach(b => {
        const s = b.status || "pending";
        statusMap[s] = (statusMap[s] || 0) + 1;
      });

      setStatusData(
        Object.keys(statusMap).map(k => ({
          name: k,
          value: statusMap[k],
        }))
      );
    });

    // 2. Listen to Tour Bookings (Tour Package Revenue)
    const unsubTourBookings = onSnapshot(collection(db, "tour_bookings"), (snapshot) => {
  const tourTotal = snapshot.docs.reduce((acc, curr) => {
    const data = curr.data();
    // Summing based on 'price' or 'totalFare' - ensure this matches your bookTour function
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

      {/* Optimized KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-10">
        <Card title="Total Bookings" value={stats.bookings} color="from-indigo-500 to-purple-600" />
        <Card title="Booking Revenue" value={`₹ ${stats.revenue.toLocaleString()}`} color="from-green-500 to-emerald-600" />
        <Card title="Tour Revenue" value={`₹ ${stats.tourRevenue.toLocaleString()}`} color="from-yellow-500 to-orange-600" />
        <Card title="Total Revenue" value={`₹ ${stats.totalRevenue.toLocaleString()}`} color="from-pink-500 to-rose-600" />
        <Card title="Users" value={stats.users} color="from-blue-500 to-cyan-600" />
        <Card title="Vehicles" value={stats.vehicles} color="from-gray-500 to-slate-600" />
      </div>
      
      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-xl hover:scale-[1.01] transition">
          <h2 className="font-semibold mb-4 text-xl">Monthly Bookings</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <XAxis dataKey="name" stroke="#ddd" />
              <YAxis stroke="#ddd" />
              <Tooltip />
              <Line type="monotone" dataKey="bookings" stroke="#FACC15" strokeWidth={3} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-xl hover:scale-[1.01] transition">
          <h2 className="font-semibold mb-4 text-xl">Booking Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={110} label>
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, color }) {
  return (
    <div className={`bg-gradient-to-br ${color} p-6 rounded-2xl shadow-xl hover:scale-105 transition cursor-pointer`}>
      <p className="text-white/80 text-sm font-medium uppercase">{title}</p>
      <h2 className="text-2xl font-bold mt-2">{value}</h2>
    </div>
  );
}