import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs,onSnapshot } from "firebase/firestore";

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
    tourRevenue: 0,
    totalRevenue:0,
  });

  const [monthlyData, setMonthlyData] = useState([]);
  const [statusData, setStatusData] = useState([]);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     const bookingsSnap = await getDocs(collection(db, "bookings"));
  //     const bookings = bookingsSnap.docs.map(d => d.data());

  //     const usersSnap = await getDocs(collection(db, "users"));
  //     const vehiclesSnap = await getDocs(collection(db, "vehicles"));

  //     setStats({
  //       bookings: bookings.length,
  //       users: usersSnap.size,
  //       vehicles: vehiclesSnap.size,
  //       revenue: bookings.length * 1200,
  //     });

  //     const monthMap = {};
  //     bookings.forEach(b => {
  //       if (!b.createdAt) return;
  //       const date = b.createdAt.toDate();
  //       const m = date.toLocaleString("default", { month: "short" });
  //       monthMap[m] = (monthMap[m] || 0) + 1;
  //     });

  //     setMonthlyData(
  //       Object.keys(monthMap).map(m => ({
  //         name: m,
  //         bookings: monthMap[m],
  //       }))
  //     );

  //     const statusMap = {};
  //     bookings.forEach(b => {
  //       const s = b.status || "pending";
  //       statusMap[s] = (statusMap[s] || 0) + 1;
  //     });

  //     setStatusData(
  //       Object.keys(statusMap).map(k => ({
  //         name: k,
  //         value: statusMap[k],
  //       }))
  //     );
  //   };

  //   fetchData();
  // }, []);
// useEffect(() => {
//   // 1. Listen to Bookings (Real-time)
//   const unsubBookings = onSnapshot(collection(db, "bookings"), (snapshot) => {
//   const bookings = snapshot.docs.map(d => d.data());

//   // Calculate Total Revenue based on all fares
//   const totalRev = bookings.reduce((acc, curr) => acc + (Number(curr.totalFare) || 0), 0);

//   // Calculate Tour Revenue (filtering for car_specific bookings)
//   const tourRev = bookings
//     .filter(b => b.bookingMethod === "car_specific")
//     .reduce((acc, curr) => acc + (Number(curr.totalFare) || 0), 0);

//     const otherRev = tourRev - totalRev

//   setStats(prev => ({
//     ...prev,
//     bookings: bookings.length,
//     revenue: totalRev,
//     tourRevenue: tourRev,
//     totalRevenue:otherRev, // Set the new stat
//   }));

//     // Process Monthly Data for Charts
//     const monthMap = {};
//     bookings.forEach(b => {
//       if (!b.createdAt) return;
//       const date = b.createdAt.toDate();
//       const m = date.toLocaleString("default", { month: "short" });
//       monthMap[m] = (monthMap[m] || 0) + 1;
//     });

//     setMonthlyData(
//       Object.keys(monthMap).map(m => ({
//         name: m,
//         bookings: monthMap[m],
//       }))
//     );

//     // Process Status Data for Pie Chart
//     const statusMap = {};
//     bookings.forEach(b => {
//       const s = b.status || "pending";
//       statusMap[s] = (statusMap[s] || 0) + 1;
//     });

//     setStatusData(
//       Object.keys(statusMap).map(k => ({
//         name: k,
//         value: statusMap[k],
//       }))
//     );
//   });

//   // 2. Listen to Users (Real-time)
//   const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
//     setStats(prev => ({ ...prev, users: snapshot.size }));
//   });

//   // 3. Listen to Vehicles (Real-time)
//   const unsubVehicles = onSnapshot(collection(db, "vehicles"), (snapshot) => {
//     setStats(prev => ({ ...prev, vehicles: snapshot.size }));
//   });

//   // Cleanup all listeners on unmount
//   return () => {
//     unsubBookings();
//     unsubUsers();
//     unsubVehicles();
//   };
// }, []);

useEffect(() => {
  // 1. Listen to Bookings (Real-time)
  const unsubBookings = onSnapshot(collection(db, "bookings"), (snapshot) => {
    const bookings = snapshot.docs.map(d => d.data());

    // Calculate Total Revenue (Sum of ALL bookings)
    const totalRev = bookings.reduce((acc, curr) => acc + (Number(curr.totalFare) || 0), 0);

    // Calculate Tour Revenue (Only car_specific bookings)
    const CabsnQuick = bookings
      .filter(b => b.bookingMethod === "car_specific" || "quick_booking")
      .reduce((acc, curr) => acc + (Number(curr.totalFare) || 0), 0);

    // Calculate Quick/Other Revenue (Optional: Total minus Tour)
    const tourRev = CabsnQuick - totalRev;

    setStats(prev => ({
      ...prev,
      bookings: bookings.length,
      revenue: CabsnQuick,    // Revenue from quick/standard bookings
      tourRevenue: tourRev, // Revenue from tour bookings
      totalRevenue: totalRev, // Grand total
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

  // 2. Listen to Users (Real-time)
  const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
    setStats(prev => ({ ...prev, users: snapshot.size }));
  });

  // 3. Listen to Vehicles (Real-time)
  const unsubVehicles = onSnapshot(collection(db, "vehicles"), (snapshot) => {
    setStats(prev => ({ ...prev, vehicles: snapshot.size }));
  });

  return () => {
    unsubBookings();
    unsubUsers();
    unsubVehicles();
  };
}, []);

return (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-8">
    <h1 className="text-4xl font-bold mb-8 text-yellow-400">Admin Dashboard</h1>

    {/* Updated Responsive Grid to prevent the overlapping seen in your screenshot */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-10">
      <Card title="Total Bookings" value={stats.bookings} color="from-indigo-500 to-purple-600" />
      <Card title="Booking Revenue" value={`₹ ${stats.revenue}`} color="from-green-500 to-emerald-600" />
      <Card title="Tour Revenue" value={`₹ ${stats.tourRevenue}`} color="from-yellow-500 to-orange-600" />
      <Card title="Total Revenue" value={`₹ ${stats.totalRevenue}`} color="from-pink-500 to-rose-600" />
      <Card title="Users" value={stats.users} color="from-blue-500 to-cyan-600" />
      <Card title="Vehicles" value={stats.vehicles} color="from-gray-500 to-slate-600" />
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
  



//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-8">

//       {/* ===== TITLE ===== */}
//       <h1 className="text-4xl font-bold mb-8 text-yellow-400">
//         Admin Dashboard
//       </h1>

//       {/* ===== KPI CARDS ===== */}
//       <div className="grid md:grid-cols-4 gap-6 mb-10">

//         {/* ===== KPI CARDS ===== */}
// <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-10">
//   <Card title="Total Bookings" value={stats.bookings} color="from-indigo-500 to-purple-600" />
//   <Card title="Booking Revenue" value={`₹ ${stats.revenue}`} color="from-green-500 to-emerald-600" />
//   <Card title="Tour Revenue" value={`₹ ${stats.tourRevenue}`} color="from-yellow-500 to-orange-600" />
//   <card title="Total Revenue" value={`₹ ${stats.totalRevenue}`} color="from-purple-500 to-orange-600"/>
//   <Card title="Users" value={stats.users} color="from-blue-500 to-cyan-600" />
//   <Card title="Vehicles" value={stats.vehicles} color="from-pink-500 to-red-600" />
// </div>

//       </div>

//       ===== CHARTS =====
//       <div className="grid md:grid-cols-2 gap-8">

//         {/* MONTHLY BOOKINGS */}
//         <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-xl hover:scale-[1.01] transition">

//           <h2 className="font-semibold mb-4 text-xl">
//             Monthly Bookings
//           </h2>

//           <ResponsiveContainer width="100%" height={300}>
//             <LineChart data={monthlyData}>
//               <XAxis dataKey="name" stroke="#ddd" />
//               <YAxis stroke="#ddd" />
//               <Tooltip />
//               <Line
//                 type="monotone"
//                 dataKey="bookings"
//                 stroke="#FACC15"
//                 strokeWidth={3}
//                 dot={{ r: 5 }}
//               />
//             </LineChart>
//           </ResponsiveContainer>

//         </div>

//         {/* STATUS PIE */}
//         <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-xl hover:scale-[1.01] transition">

//           <h2 className="font-semibold mb-4 text-xl">
//             Booking Status
//           </h2>

//           <ResponsiveContainer width="100%" height={300}>
//             <PieChart>
//               <Pie
//                 data={statusData}
//                 dataKey="value"
//                 nameKey="name"
//                 outerRadius={110}
//                 label
//               >
//                 {statusData.map((entry, i) => (
//                   <Cell key={i} fill={COLORS[i % COLORS.length]} />
//                 ))}
//               </Pie>
//               <Tooltip />
//             </PieChart>
//           </ResponsiveContainer>

//         </div>

//       </div>
//     </div>
//   );
