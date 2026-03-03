import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { 
  query, 
  where, 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc 
} from "firebase/firestore";

const UserLayout = () => {
  const navigate = useNavigate();

  // 1. Notification Listener Logic
  // useEffect(() => {
  //   // Only proceed if a user is authenticated
  //   if (!auth.currentUser?.uid) return;

  //   // const q = query(
  //   //   collection(db, "notifications"),
  //   //   where("recipientId", "==", auth.currentUser.uid),
  //   //   where("read", "==", false)
  //   // );

  //   const unsub = onSnapshot(q, (snap) => {
  //     snap.docChanges().forEach((change) => {
  //       // Only trigger for newly added unread notifications
  //       if (change.type === "added") {
  //         const notif = change.doc.data();
          
  //         // Browser Alert
  //         alert(`🔔 ${notif.title}: ${notif.message}`);

  //         // Recommended: Mark as read to prevent repeat alerts
  //         // const notifRef = doc(db, "notifications", change.doc.id);
  //         // updateDoc(notifRef, { read: true });
  //       }
  //     });
  //   }, (error) => {
  //     console.error("User notification error:", error);
  //   });

  //   return () => unsub();
  //   // Re-run if the user ID changes or becomes available
  // }, [auth.currentUser?.uid]);

  const logout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SIDEBAR */}
      <aside className="w-64 bg-black text-white p-6 space-y-6 shrink-0">
        <h2 className="text-xl font-bold text-yellow-400 mb-8">User Panel</h2>

        <nav className="flex flex-col gap-4">
          <button
            onClick={() => navigate("/user/bookings")}
            className="block w-full text-left hover:text-yellow-400 font-medium p-2 transition rounded hover:bg-white/10"
          >
            📋 My Bookings
          </button>

          <button
            onClick={() => navigate("/user/tours")}
            className="block w-full text-left hover:text-yellow-400 font-medium p-2 transition rounded hover:bg-white/10"
          >
            🗺️ Tours
          </button>

          <button
            onClick={() => navigate("/user/profile")}
            className="block w-full text-left hover:text-yellow-400 font-medium p-2 transition rounded hover:bg-white/10"
          >
            👤 Profile
          </button>

          <button
            onClick={logout}
            className="block w-full text-left text-red-400 font-bold p-2 transition rounded hover:bg-red-900/20 "
          >
            🚪 Logout
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;