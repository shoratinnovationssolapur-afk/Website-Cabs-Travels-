import { useState } from "react";
import AdminProfile from "./AdminProfile";
import AdminTours from "./AdminTours";
import AdminVehicles from "./AdminVehicles";
import AdminUsers from "./AdminUsers";
import AdminDashboard from "./AdminDashboard";

export default function AdminLayout() {

  const [active, setActive] = useState("dashboard");

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* ===== SIDEBAR ===== */}
      <aside className="w-64 bg-black text-white p-6">

        <h2 className="text-xl font-bold mb-8">
          Admin Panel
        </h2>

        <nav className="flex flex-col gap-4">
          <button className="hover:bg-white hover:text-black cursor-pointer" onClick={() => setActive("profile")}>
            Profile
          </button>

          <button className="hover:bg-white cursor-pointer hover:text-black" onClick={() => setActive("dashboard")}>
            Dashboard
          </button>

          <button className="hover:bg-white cursor-pointer hover:text-black" onClick={() => setActive("tours")}>
            Add Tours
          </button>

          <button className="hover:bg-white cursor-pointer hover:text-black" onClick={() => setActive("vehicles")}>
            Vehicles
          </button>

          <button className="hover:bg-white cursor-pointer hover:text-black" onClick={() => setActive("users")}>
            Users
          </button>

        </nav>

      </aside>


      {/* ===== CONTENT AREA ===== */}
      <main className="flex-1 p-8">

       {active === "dashboard" && <AdminDashboard />}
        {active === "profile" && <AdminProfile />}
        {active === "tours" && <AdminTours />}
        {active === "vehicles" && <AdminVehicles />}
        {active === "users" && <AdminUsers />}

      </main>

    </div>
  );
}