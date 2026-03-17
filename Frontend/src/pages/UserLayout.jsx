import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const UserLayout = () => {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navBtnClass =
    "block w-full text-left font-medium p-2 transition rounded hover:bg-white/10 whitespace-nowrap";

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <aside className="w-full md:w-64 bg-black text-white p-4 md:p-6 space-y-4 md:space-y-6 shrink-0">
        <h2 className="text-lg md:text-xl font-bold text-yellow-400">User Panel</h2>

        <nav className="flex md:flex-col gap-2 md:gap-3 overflow-x-auto md:overflow-visible pb-1 md:pb-0">
          <button onClick={() => navigate("/user/bookings")} className={`${navBtnClass} hover:text-yellow-400`}>
            My Bookings
          </button>
          <button onClick={() => navigate("/user/tours")} className={`${navBtnClass} hover:text-yellow-400`}>
            Tours
          </button>
          <button onClick={() => navigate("/contact-us")} className={`${navBtnClass} hover:text-yellow-400`}>
            Contact Us
          </button>
          <button onClick={() => navigate("/about-us")} className={`${navBtnClass} hover:text-yellow-400`}>
            About Us
          </button>
          <button onClick={() => navigate("/user/profile")} className={`${navBtnClass} hover:text-yellow-400`}>
            Profile
          </button>
          <button onClick={() => navigate("/user/galleries")} className={`${navBtnClass} hover:text-yellow-400`}>
            Gallery
          </button>
          <button onClick={logout} className="block w-full text-left text-red-400 font-bold p-2 transition rounded hover:bg-red-900/20 whitespace-nowrap">
            Logout
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;
