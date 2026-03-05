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
    } else if (role === "Driver") {
      navigate("/driver/dashboard");
    } else {
      navigate("/");
    }
  };
  

const toggleSB = () => {
  // 1. Handle Unauthenticated (Non-Logged) Users
  if (!user) {
    openLogin(); // Use the prop function instead of navigate("/login")
    return;
  }

  // 2. Admin Logic
  if (role === "Admin") {
    location.pathname.startsWith("/admin") ? navigate("/") : navigate("/admin/dashboard");
  } 
  
  // 3. Driver Logic
  else if (role === "Driver") {
    location.pathname.startsWith("/driver") ? navigate("/") : navigate("/driver/dashboard");
  } 
  
  // 4. User/Customer Logic
  else if (role === "User") {
    // This will now work because we added the route in App.jsx
    location.pathname.startsWith("/user") ? navigate("/") : navigate("/user/dashboard");
  } 
  
  else {
    navigate("/");
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

  // if (loading) return null;

  return (
    <nav className="text-white bg-black px-3 py-2 flex justify-between items-center">

      <div className="flex gap-3 items-center" >
        <FaBars className="relative top-0.5 cursor-pointer" onClick={toggleSB} />
<div 
  onClick={goHome} 
  className="flex items-center gap-3 cursor-pointer"
>
  {/* Circular Icon Container */}
  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-yellow-500 shadow-sm">
    <img 
      src="/src/assets/logo 1.png" 
      alt="Logo" 
      className="w-full h-full object-cover"
    />
  </div>

  {/* Text Title */}
  <h2 className="text-xl font-bold text-yellow-500">
    Rathod Express
  </h2>
</div>
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

        {/* ⭐ ADDED: DRIVER NAVBAR BUTTONS (Optional) */}
        {user && role === "Driver" && (
          <>
            <button
              onClick={() => navigate("/driver/dashboard")}
              className="bg-white text-black hover:bg-yellow-500 px-4 py-2 rounded font-semibold cursor-pointer"
            >
              Dashboard
            </button>
            <button
              onClick={openLogout}
              className="bg-white text-black hover:bg-yellow-500 px-4 py-2 rounded font-semibold cursor-pointer"
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
