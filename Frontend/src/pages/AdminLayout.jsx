import { Outlet, useNavigate } from "react-router-dom";
import React from "react";

export default function AdminLayout() {
  const navigate = useNavigate();

  const navBtnClass =
    "text-left p-2 rounded transition whitespace-nowrap hover:bg-white hover:text-black";

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <aside className="w-full md:w-64 bg-black text-white p-4 md:p-6 shrink-0">
        <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-8 text-yellow-400">Admin Panel</h2>

        <nav className="flex md:flex-col gap-2 md:gap-3 overflow-x-auto md:overflow-visible pb-1 md:pb-0">
          <button className={navBtnClass} onClick={() => navigate("/admin/dashboard")}>Dashboard</button>
          <button className={navBtnClass} onClick={() => navigate("/admin/tours")}>Add Tours</button>
          <button className={navBtnClass} onClick={() => navigate("/admin/vehicles")}>Vehicles</button>
          <button className={navBtnClass} onClick={() => navigate("/admin/users")}>Users</button>
          <button className={navBtnClass} onClick={() => navigate("/admin/drivers")}>Drivers</button>
          <button className={navBtnClass} onClick={() => navigate("/admin/vendors")}>Vendors</button>
          <button className={navBtnClass} onClick={() => navigate("/admin/bookings")}>Bookings</button>
          <button className={navBtnClass} onClick={() => navigate("/admin/tourbookings")}>Tour Bookings</button>
          <button className={navBtnClass} onClick={() => navigate("/admin/inquiries")}>Customer Inquiries</button>
          <button className={navBtnClass} onClick={() => navigate("/contact-us")}>Contact Us</button>
          <button className={navBtnClass} onClick={() => navigate("/about-us")}>About Us</button>
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
