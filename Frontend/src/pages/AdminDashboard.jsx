import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">

      {/* ===== SIDEBAR ===== */}
      <aside className="w-64 bg-black border-r border-gray-800 p-5">

        <h2 className="text-2xl font-bold text-yellow-400 mb-8">
          Rathod Admin
        </h2>

        <nav className="space-y-3">

          <button
            onClick={() => navigate("/admin/vehicles")}
            className="w-full text-left px-4 py-2 rounded hover:bg-gray-800"
          >
            🚗 Vehicles
          </button>

          <button
            onClick={() => navigate("/admin/bookings")}
            className="w-full text-left px-4 py-2 rounded hover:bg-gray-800"
          >
            📦 Bookings
          </button>

          <button
            onClick={() => navigate("/admin/users")}
            className="w-full text-left px-4 py-2 rounded hover:bg-gray-800"
          >
            👤 Users
          </button>

          <button
            className="w-full text-left px-4 py-2 rounded hover:bg-gray-800"
          >
            📊 Analytics
          </button>

        </nav>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 p-8">

        <h1 className="text-3xl font-bold mb-8">
          Admin Dashboard
        </h1>

        {/* ===== STATS CARDS ===== */}
        <div className="grid md:grid-cols-4 gap-6 mb-10">

          <StatCard title="Total Bookings" value="324" color="blue" />
          <StatCard title="Revenue" value="₹1.2L" color="green" />
          <StatCard title="Vehicles" value="18" color="yellow" />
          <StatCard title="Active Users" value="240" color="pink" />

        </div>

        {/* ===== ANALYTICS + BOOKINGS ===== */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Analytics */}
          <div className="bg-gray-900 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-4">
              Booking Analytics
            </h3>

            <div className="h-40 flex items-center justify-center text-gray-400">
              Chart Placeholder
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-gray-900 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-4">
              Recent Bookings
            </h3>

            <ul className="space-y-2 text-sm">
              <li>🚗 Innova → Pune</li>
              <li>🚙 XUV700 → Mumbai</li>
              <li>👑 Mercedes → Goa</li>
              <li>🚗 Verna → Solapur</li>
            </ul>
          </div>

        </div>

      </main>
    </div>
  );
};


const StatCard = ({ title, value, color }) => {

  const colors = {
    blue: "bg-blue-600",
    green: "bg-green-600",
    yellow: "bg-yellow-500 text-black",
    pink: "bg-pink-600"
  };

  return (
    <div className={`p-6 rounded-xl ${colors[color]} shadow`}>
      <h4 className="text-sm">{title}</h4>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
};

export default AdminDashboard;