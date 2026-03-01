import { Outlet, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";





// Add this to a Sidebar or Navbar in all three apps
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

const DriverLayout = () => {
  const navigate = useNavigate();

  const logout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <div className="w-64 bg-slate-900 text-white p-6 space-y-6 shadow-xl">
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