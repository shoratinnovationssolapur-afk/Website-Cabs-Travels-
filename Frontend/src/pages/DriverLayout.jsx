import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase"; // Ensure db is exported from your firebase config
import { 
  collection, 
  query, 
  where, 
  onSnapshot 
} from "firebase/firestore";

const DriverLayout = () => {
  const navigate = useNavigate();

  // ⭐ FIXED: useEffect moved INSIDE the component
  useEffect(() => {
    if (!auth.currentUser) return;

    // Create the query for unread notifications for the current driver
    const q = query(
      collection(db, "notifications"),
      where("recipientId", "==", auth.currentUser.uid),
      where("read", "==", false)
    );

    // Listen for real-time updates
    const unsub = onSnapshot(q, (snap) => {
      snap.docChanges().forEach((change) => {
        if (change.type === "added") {
          const notif = change.doc.data();
          
          // Browser Alert (You can replace this with a Toast library)
          alert(`🔔 ${notif.title}: ${notif.message}`);

          // Note: You might want to update the doc to 'read: true' here 
          // to prevent the alert from showing again on every page refresh.
        }
      });
    });

    // Cleanup listener on unmount
    return () => unsub();
  }, []);

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
      <div className="w-64 bg-slate-900 text-white p-6 space-y-6 shadow-xl shrink-0">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-green-400">Driver Portal</h2>
          <p className="text-xs text-slate-400">Professional Console</p>
        </div>

        <nav className="space-y-4">
          <button
            onClick={() => navigate("/driver/dashboard")}
            className="block w-full text-left font-medium hover:text-green-400 transition"
          >
            🚖 Active Ride
          </button>

          <button
            onClick={() => navigate("/driver/history")}
            className="block w-full text-left font-medium hover:text-green-400 transition"
          >
            📋 Ride History
          </button>

          <button
            onClick={() => navigate("/driver/earnings")}
            className="block w-full text-left font-medium hover:text-green-400 transition"
          >
            💰 Earnings
          </button>

          <button
            onClick={() => navigate("/driver/profile")}
            className="block w-full text-left font-medium hover:text-green-400 transition"
          >
            👤 Profile Settings
          </button>
        </nav>

        <div className="pt-10">
          <button
            onClick={logout}
            className="block w-full text-left text-red-400 font-bold hover:text-red-300 transition"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default DriverLayout;