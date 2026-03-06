import { Outlet, useNavigate } from "react-router-dom";
import React, { useEffect } from "react";
import { auth, db } from "../firebase";
import { onSnapshot, collection, query, where } from "firebase/firestore";

export default function AdminLayout() {
  const navigate = useNavigate();

  // useEffect(() => {
  //   // We listen for notifications where recipientId is "admin"
  //   // This ensures all admins see new booking alerts
  //   // const q = query(
  //   //   collection(db, "notifications"),
  //   //   where("recipientId", "==", "admin"), // ⭐ FIXED: Changed from auth.currentUser.uid
  //   //   where("read", "==", false)
  //   // );

  //   const unsub = onSnapshot(q, (snap) => {
  //     snap.docChanges().forEach((change) => {
  //       // Only alert on NEWLY added documents to avoid spamming old alerts
  //       if (change.type === "added") {
  //         const notif = change.doc.data();
          
  //         // Basic Browser Alert
  //         alert(`🔔 ${notif.title}: ${notif.message}`);

  //         // Recommended: Mark as read or use a more sophisticated toast 
  //         // system to prevent the same alert from firing repeatedly.
  //       }
  //     });
  //   }, (error) => {
  //     console.error("Notification listener error:", error);
  //   });

  //   return () => unsub();
  // }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* ===== SIDEBAR ===== */}
      <aside className="w-64 bg-black text-white p-6 shrink-0">
        <h2 className="text-xl font-bold mb-8 text-yellow-400">Admin Panel</h2>

        <nav className="flex flex-col gap-4">
          <button
            className="text-left hover:bg-white hover:text-black cursor-pointer p-2 transition rounded"
            onClick={() => navigate("/admin/dashboard")}
          >
            📊 Dashboard
          </button>

          <button
            className="text-left hover:bg-white hover:text-black cursor-pointer p-2 transition rounded"
            onClick={() => navigate("/admin/tours")}
          >
            🗺️ Add Tours
          </button>

          <button
            className="text-left hover:bg-white hover:text-black cursor-pointer p-2 transition rounded"
            onClick={() => navigate("/admin/vehicles")}
          >
            🚘 Vehicles
          </button>

          <button
            className="text-left hover:bg-white hover:text-black cursor-pointer p-2 transition rounded"
            onClick={() => navigate("/admin/users")}
          >
            👥 Users
          </button>

          <button
            className="text-left hover:bg-white hover:text-black cursor-pointer p-2 transition rounded"
            onClick={() => navigate("/admin/vendors")}
          >
            🤝 Vendors
          </button>

          <button
            className="text-left hover:bg-white hover:text-black cursor-pointer p-2 transition rounded"
            onClick={() => navigate("/admin/tourbookings")}
          >
            📅 Tour Bookings
          </button>

<button
  className="text-left hover:bg-white hover:text-black cursor-pointer p-2 transition rounded flex items-center gap-2"
  onClick={() => navigate("/admin/inquiries")}
>
  📩 Customer Inquiries
</button>

                    <button
            onClick={() => navigate("/contact-us")}
            className="block w-full text-left hover:text-yellow-400 font-medium p-2 transition rounded hover:bg-white/10"
          >
            📞 Contact Us
          </button>

                    <button
            onClick={() => navigate("/about-us")}
            className="block w-full text-left hover:text-yellow-400 font-medium p-2 transition rounded hover:bg-white/10"
          >
            ℹ️ About Us
          </button>

        </nav>
      </aside>

      {/* ===== CONTENT AREA ===== */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}