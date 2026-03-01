import { Outlet, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
// import { useState } from "react";


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

const UserLayout = () => {
  const navigate = useNavigate();

  const logout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SIDEBAR */}
      <div className="w-64 bg-black text-white p-6 space-y-6">
        <h2 className="text-xl font-bold text-yellow-400">User Panel</h2>

        {/* ADD THE LEADING SLASH (/) BELOW */}
        <button
          onClick={() => navigate("/user/bookings")}
          className="block w-full text-left hover:text-yellow-400"
        >
          My Bookings
        </button>

        <button
          onClick={() => navigate("/tours")}
          className="block w-full text-left hover:text-yellow-400"
        >
          Tours
        </button>

        <button
          onClick={() => navigate("/user/profile")}
          className="block w-full text-left hover:text-yellow-400"
        >
          Profile
        </button>

        <button
          onClick={logout}
          className="block w-full text-left text-red-400"
        >
          Logout
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default UserLayout;
