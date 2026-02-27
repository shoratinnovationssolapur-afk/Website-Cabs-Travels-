import { Outlet, useNavigate } from "react-router-dom";
// Remove local imports of the pages here if they are already 
// handled by the router in App.jsx

export default function AdminLayout() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* ===== SIDEBAR ===== */}
      <aside className="w-64 bg-black text-white p-6">
        <h2 className="text-xl font-bold mb-8">Admin Panel</h2>

        <nav className="flex flex-col gap-4">
          <button 
            className="text-left hover:bg-white hover:text-black cursor-pointer p-2 transition" 
            onClick={() => navigate("/admin/dashboard")}
          >
            Dashboard
          </button>

          <button 
            className="text-left hover:bg-white hover:text-black cursor-pointer p-2 transition" 
            onClick={() => navigate("/admin/tours")}
          >
            Add Tours
          </button>

          <button 
            className="text-left hover:bg-white hover:text-black cursor-pointer p-2 transition" 
            onClick={() => navigate("/admin/vehicles")}
          >
            Vehicles
          </button>

          <button 
            className="text-left hover:bg-white hover:text-black cursor-pointer p-2 transition" 
            onClick={() => navigate("/admin/users")}
          >
            Users
          </button>

          <button 
            className="text-left hover:bg-white hover:text-black cursor-pointer p-2 transition" 
            onClick={() => navigate("/admin/vendors")}
          >
            Vendors
          </button>

          <button 
            className="text-left hover:bg-white hover:text-black cursor-pointer p-2 transition" 
            onClick={() => navigate("/admin/tourbookings")}
          >
            Tour Bookings
          </button>
        </nav>
      </aside>

      {/* ===== CONTENT AREA ===== */}
      <main className="flex-1 p-8">
        {/* The Outlet renders whichever child route is active 
            based on the URL in the address bar.
        */}
        <Outlet />
      </main>
    </div>
  );
}