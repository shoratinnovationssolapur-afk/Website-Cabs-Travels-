import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const DriverLayout = () => {
  const navigate = useNavigate();

  // useEffect(() => {
  //   // 1. Only set up the listener if we have a valid user
  //   if (!auth.currentUser?.uid) return;

  //   // const q = query(
  //   //   collection(db, "notifications"),
  //   //   where("recipientId", "==", auth.currentUser.uid),
  //   //   where("read", "==", false)
  //   // );

  //   const unsub = onSnapshot(q, (snap) => {
  //     snap.docChanges().forEach((change) => {
  //       // 2. Only trigger for NEW unread notifications added
  //       if (change.type === "added") {
  //         const notif = change.doc.data();
          
  //         alert(`🔔 ${notif.title}: ${notif.message}`);

  //         // 3. OPTIONAL: Automatically mark as read so it doesn't pop up again
  //         // const notifRef = doc(db, "notifications", change.doc.id);
  //         // updateDoc(notifRef, { read: true });
  //       }
  //     });
  //   }, (error) => {
  //     console.error("Notification listener failed:", error);
  //   });

  //   return () => unsub();
  //   // 4. Added auth.currentUser?.uid to dependencies for stability
  // }, [auth.currentUser?.uid]);

  const logout = async () => {
    try {
      // 5. Optional: Set driver to 'offline' in your drivers collection before logout
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-slate-900 text-white p-4 md:p-6 space-y-4 md:space-y-6 shadow-xl shrink-0">
        <div className="mb-4 md:mb-8">
          <h2 className="text-xl font-bold text-green-400">Driver Portal</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
            Console
          </p>
        </div>

        <nav className="flex md:flex-col gap-2 md:gap-4 overflow-x-auto md:overflow-visible pb-1 md:pb-0">
          <button
            onClick={() => navigate("/driver/dashboard")}
            className="block w-full text-left font-bold hover:text-green-400 transition-colors p-2 rounded hover:bg-slate-800 whitespace-nowrap"
          >
            🚖 Active Ride
          </button>

          <button
            onClick={() => navigate("/driver/history")}
            className="block w-full text-left font-bold hover:text-green-400 transition-colors p-2 rounded hover:bg-slate-800 whitespace-nowrap"
          >
            📋 Ride History
          </button>

          <button
            onClick={() => navigate("/driver/earnings")}
            className="block w-full text-left font-bold hover:text-green-400 transition-colors p-2 rounded hover:bg-slate-800 whitespace-nowrap"
          >
            💰 Earnings
          </button>
                    <button
            onClick={() => navigate("/contact-us")}
            className="block w-full text-left hover:text-yellow-400 font-medium p-2 transition rounded hover:bg-white/10 whitespace-nowrap"
          >
            📞 Contact Us
          </button>

                    <button
            onClick={() => navigate("/about-us")}
            className="block w-full text-left hover:text-yellow-400 font-medium p-2 transition rounded hover:bg-white/10 whitespace-nowrap"
          >
            ℹ️ About Us
          </button>

          <button
            onClick={() => navigate("/driver/profile")}
            className="block w-full text-left font-bold hover:text-green-400 transition-colors p-2 rounded hover:bg-slate-800 whitespace-nowrap"
          >
            👤 Profile
          </button>
        </nav>

        <div className="pt-4 md:pt-10 border-t border-slate-800">
          <button
            onClick={logout}
            className="block w-full text-left text-red-400 font-black hover:text-red-300 transition-colors uppercase text-sm tracking-tighter"
          >
            Log Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default DriverLayout;
