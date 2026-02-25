import React from 'react';
import { useAuthContext } from "../context/AuthContext";

const UserDashboard = () => {
  const { user } = useAuthContext();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Dashboard</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold">Hi, {user?.displayName || "Traveler"}!</h2>
        <p className="text-gray-600 mt-2">Manage your bookings and profile from here.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="border p-4 rounded hover:bg-gray-50 cursor-pointer">
            <h3 className="font-bold">My Bookings</h3>
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