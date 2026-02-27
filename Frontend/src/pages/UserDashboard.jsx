import React,{useState,useEffect} from 'react';
import { useAuthContext } from "../context/AuthContext";
import { Navigate,useNavigate } from 'react-router-dom';
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const UserDashboard = () => {
  const { user } = useAuthContext();
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchName = async () => {
      if (user?.uid) {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          setUserName(snap.data().name); // Get name from your 'users' collection
        }
      }
    };
    fetchName();
  }, [user]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Dashboard</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold">Hi, {userName || user?.displayName || "Traveler"}!</h2>
        <p className="text-gray-600 mt-2">Manage your bookings and profile from here.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="border p-4 rounded hover:bg-gray-50 cursor-pointer">
            <h3 className="font-bold" onClick={() => navigate("/bookings")}>My Bookings</h3>
            <p className="text-sm text-gray-500">View and manage your cab requests.</p>
          </div>
          <div className="border p-4 rounded hover:bg-gray-50 cursor-pointer">
            <h3 className="font-bold">Account Settings</h3>
            <p className="text-sm text-gray-500">Update your personal information.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;