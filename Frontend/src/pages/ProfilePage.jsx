import React from "react";
import { auth } from "../firebase/firebase";
import { logoutUser } from "../firebase/auth";
import { useNavigate, Link } from "react-router-dom";

import {
  User,
  LogOut,
  CarTaxiFront,
  Info,
  BadgeCheck,
  Wallet,
} from "lucide-react";

function ProfilePage() {
  const navigate = useNavigate();

  const user = auth.currentUser;
  const userName = user?.displayName || "Guest User";
  const userEmail = user?.email || "Not Available";

  const handleLogout = async () => {
    await logoutUser();
    navigate("/signin");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800/50 border-r border-slate-700 p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-10 text-blue-400">
          Rathod Control Center
        </h2>

        <nav className="flex-1 space-y-4">
          {/* Profile */}
          <Link
            to="/profile"
            className="flex items-center gap-3 p-3 bg-blue-600/20 text-blue-400 rounded-lg"
          >
            <User size={20} /> Profile
          </Link>

          {/* Pricing */}
          <Link
            to="/pricing"
            className="flex items-center gap-3 p-3 text-slate-400 hover:bg-slate-700/50 hover:text-white rounded-lg transition"
          >
            <Wallet size={20} /> Pricing
          </Link>

          <Link
            to="/services"
            className="flex items-center gap-3 p-3 text-slate-400 hover:bg-slate-700/50 hover:text-white rounded-lg transition"
>
            🚖 Services
            </Link>

            <Link
             to="/tours"
            className="flex items-center gap-3 p-3 text-slate-400 hover:bg-slate-700/50 hover:text-white rounded-lg transition"
>
            🏝️ Tour Packages
            </Link>



          {/* About */}
          <Link
            to="/aboutus"
            className="flex items-center gap-3 p-3 text-slate-400 hover:bg-slate-700/50 hover:text-white rounded-lg transition"
          >
            <Info size={20} /> About Us
          </Link>

          <Link
            to="/booking-details"
            className="flex items-center gap-3 p-3 text-slate-400 hover:bg-slate-700/50 hover:text-white rounded-lg transition"
          >
            <Info size={20} /> Rent Your Car
          </Link>

        </nav>
        

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 text-red-400 hover:bg-red-500/10 rounded-lg"
        >
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold">
            Welcome, {userName} 🚖
          </h1>

          <div className="bg-slate-800 p-3 rounded-full border border-slate-700">
            <User size={28} className="text-blue-400" />
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 mb-10">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
            <BadgeCheck className="text-green-400" />
            Profile Details
          </h2>

          <p className="text-slate-300 mt-2">
            👤 Name: <span className="text-white">{userName}</span>
          </p>

          <p className="text-slate-300 mt-1">
            📧 Email: <span className="text-white">{userEmail}</span>
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Book Ride */}
          <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 hover:scale-105 transition">
            <CarTaxiFront className="text-yellow-400 mb-4" size={32} />
            <h3 className="text-lg font-bold">Book a Ride</h3>
            <p className="text-slate-400 text-sm mt-2">
              Reserve your cab instantly for city or outstation trips.
            </p>
            <button className="mt-4 w-full bg-yellow-500 hover:bg-yellow-600 py-2 rounded-xl font-semibold">
              Book Now
            </button>
          </div>

          {/* Pricing */}
          <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 hover:scale-105 transition">
            <Wallet className="text-blue-400 mb-4" size={32} />
            <h3 className="text-lg font-bold">View Pricing</h3>
            <p className="text-slate-400 text-sm mt-2">
              Check our affordable travel plans and packages.
            </p>
            <Link
              to="/pricing"
              className="block mt-4 text-center w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-xl font-semibold"
            >
              Explore Plans
            </Link>
          </div>

          {/* Support */}
          <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 hover:scale-105 transition">
            <Info className="text-green-400 mb-4" size={32} />
            <h3 className="text-lg font-bold">Support</h3>
            <p className="text-slate-400 text-sm mt-2">
              Need help? Contact us anytime for bookings & queries.
            </p>
            <button className="mt-4 w-full bg-green-600 hover:bg-green-700 py-2 rounded-xl font-semibold">
              Contact Now
            </button>
          </div>
        </div>

        {/* Upcoming Trips */}
        <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">
            Upcoming Trips 🚘
          </h2>
          <p className="text-slate-400">
            You have no upcoming rides booked yet.
          </p>
          <p className="text-slate-500 text-sm mt-2">
            Book your first trip now and travel with comfort!
          </p>
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;
