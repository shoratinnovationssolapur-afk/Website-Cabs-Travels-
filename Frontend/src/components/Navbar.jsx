import { useNavigate,useLocation } from "react-router-dom";
import { useState,useEffect } from "react";
import { useAuthContext } from "../context/AuthContext";
import { auth,db } from "../firebase";
import { FaBars } from "react-icons/fa6";
import {doc,getDoc} from "firebase/firestore";


const Navbar = ({ openLogin, openLogout, loading }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, role } = useAuthContext();   // ⭐ IMPORTANT

  const goHome = () => {
    if (role === "Admin") {
      navigate("/admin");
    } else {
      navigate("/");
    }
  };

  

  const toggleSB = () => {
  if (location.pathname === "/user") {
    navigate("/");      // close → go back
  } else {
    navigate("/user"); // open
  }
};

const [username, setUsername] = useState("");

useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged(async (user) => {
    if (!user) {
      setUsername("");
      return;
    }

    try {
      const snap = await getDoc(doc(db, "users", user.uid));

      if (snap.exists()) {
        setUsername(snap.data().name);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  });

  return () => unsubscribe();
}, []);
   
  


  const goRent = () => navigate("/rent-your-car");

  const goAdminVehicles = () => navigate("/admin/vehicles");
  const goAdminBookings = () => navigate("/admin/bookings");

  if (loading) return null;

  return (
    <nav className="text-white bg-black px-3 py-2 flex justify-between items-center">

      <div className="flex gap-3 items-center" >
        <FaBars className="relative top-0.5 cursor-pointer" onClick={toggleSB} />
        <h2
          onClick={goHome}
          className={`text-xl font-bold  text-yellow-500 cursor-pointer`}
        >
          Rathod Cabs & Travels
        </h2>
        {username && (
            <div className="  hidden md:block bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl text-yellow-400 font-semibold shadow-lg relative top-0.5">
              Welcome back, {username} 👋
            </div>
          )}
      </div>

      {/* RIGHT SIDE */}
      <div className="flex gap-4">

        {/* ===== ADMIN NAVBAR ===== */}
        {user && role === "Admin" && (
          <>
            <button
              onClick={() => navigate("/admin")}
              className="bg-white text-black hover:bg-yellow-500 px-4 py-2 rounded font-semibold cursor-pointer"
            >
              Home
            </button>

            <button
              onClick={() => navigate("/admin/vehicles")}
              className="bg-white text-black  hover:bg-yellow-500 px-4 py-2 rounded font-semibold cursor-pointer"
            >
              Manage Vehicles
            </button>

            <button
              onClick={() => navigate("/admin/bookings")}
              className="bg-white text-black  hover:bg-yellow-500 px-4 py-2 rounded font-semibold cursor-pointer"
            >
              Bookings
            </button>

            <button
              onClick={() => navigate("/admin/users")}
              className="bg-white text-black  hover:bg-yellow-500 px-4 py-2 rounded font-semibold cursor-pointer"
            >
              Users
            </button>

            <button
              onClick={() => navigate("/admin/drivers")}
              className="bg-white text-black hover:bg-yellow-500 px-4 py-2 rounded font-semibold"
            >
              Drivers
            </button>

            <button
              onClick={openLogout}
              className="bg-white text-black hover:bg-yellow-500 px-4 py-2 rounded font-semibold  cursor-pointer"
            >
              Logout
            </button>
          </>
        )}

        {/* ===== USER NAVBAR ===== */}
        {user && role === "User" && (
          <>
            <button
              onClick={() => navigate("/")}
              className="bg-white text-black hover:bg-yellow-500 px-4 py-2 rounded font-semibold cursor-pointer"
            >
              Home
            </button>

            <button
              onClick={() => navigate("/rent-your-car")}
              className="bg-white text-black hover:bg-yellow-500 px-4 py-2 rounded font-semibold cursor-pointer"
            >
              Rent Your Car
            </button>

            <button
              onClick={openLogout}
              className="bg-white text-black hover:bg-yellow-500 px-4 py-2 rounded font-semibold cursor-pointer"
            >
              Logout
            </button>


          </>
        )}

        {/* ===== GUEST NAVBAR ===== */}
        {!user && (
          <button
            onClick={openLogin}
            className="bg-white text-black hover:bg-yellow-500 px-4 py-2 rounded font-semibold cursor-pointer"
          >
            Login / Create Account
          </button>
        )}

      </div>

    </nav>
  );
};

export default Navbar;
