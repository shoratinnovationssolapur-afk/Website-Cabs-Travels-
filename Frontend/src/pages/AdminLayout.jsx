import { Outlet, useNavigate } from "react-router-dom";
import React, { useEffect } from "react";
import { auth, db } from "../firebase";
import { onSnapshot, collection, query, where } from "firebase/firestore";
// Remove local imports of the pages here if they are already 
// handled by the router in App.jsx






// Add this to a Sidebar or Navbar in all three apps


export default function AdminLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "notifications"),
      where("recipientId", "==", auth.currentUser.uid), // Or "admin" for Admin app
      where("read", "==", false)
    );

    const unsub = onSnapshot(q, (snap) => {
      snap.docChanges().forEach((change) => {
        if (change.type === "added") {
          const notif = change.doc.data();
          // Use a library like 'react-hot-toast' or 'browser notifications'
          alert(`${notif.title}: ${notif.message}`);

          // Optional: Mark as read immediately
          // updateDoc(doc(db, "notifications", change.doc.id), { read: true });
        }
      });
    });

    return () => unsub();
  }, []);




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