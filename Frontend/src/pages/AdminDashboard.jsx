import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

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
    revenue: 0,
  });

  const [monthlyData, setMonthlyData] = useState([]);
  const [statusData, setStatusData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const bookingsSnap = await getDocs(collection(db, "bookings"));
      const bookings = bookingsSnap.docs.map(d => d.data());

      const usersSnap = await getDocs(collection(db, "users"));
      const vehiclesSnap = await getDocs(collection(db, "vehicles"));

      setStats({
        bookings: bookings.length,
        users: usersSnap.size,
        vehicles: vehiclesSnap.size,
        revenue: bookings.length * 1200,
      });

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
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-8">

      {/* ===== TITLE ===== */}
      <h1 className="text-4xl font-bold mb-8 text-yellow-400">
        Admin Dashboard
      </h1>

      {/* ===== KPI CARDS ===== */}
      <div className="grid md:grid-cols-4 gap-6 mb-10">

        <Card title="Bookings" value={stats.bookings} color="from-indigo-500 to-purple-600" />
        <Card title="Revenue" value={`₹ ${stats.revenue}`} color="from-green-500 to-emerald-600" />
        <Card title="Users" value={stats.users} color="from-blue-500 to-cyan-600" />
        <Card title="Vehicles" value={stats.vehicles} color="from-orange-500 to-red-600" />

      </div>

      {/* ===== CHARTS ===== */}
      <div className="grid md:grid-cols-2 gap-8">

        {/* MONTHLY BOOKINGS */}
        <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-xl hover:scale-[1.01] transition">

          <h2 className="font-semibold mb-4 text-xl">
            Monthly Bookings
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <XAxis dataKey="name" stroke="#ddd" />
              <YAxis stroke="#ddd" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="bookings"
                stroke="#FACC15"
                strokeWidth={3}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>

        </div>

        {/* STATUS PIE */}
        <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-xl hover:scale-[1.01] transition">

          <h2 className="font-semibold mb-4 text-xl">
            Booking Status
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                outerRadius={110}
                label
              >
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
    <div
      className={`bg-gradient-to-br ${color} p-6 rounded-2xl shadow-xl hover:scale-105 transition cursor-pointer`}
    >
      <p className="text-white/80">{title}</p>
      <h2 className="text-3xl font-bold mt-2">{value}</h2>
    </div>
  );
}