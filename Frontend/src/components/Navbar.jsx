import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { auth } from "../firebase";


const Navbar = ({ openLogin, openLogout, loading }) => {
  const navigate = useNavigate();

  const { user, role } = useAuthContext();   // ⭐ IMPORTANT

  const goHome = () => {
    if (role === "Admin") {
      navigate("/admin");
    } else {
      navigate("/");
    }
  };
  const goRent = () => navigate("/rent-your-car");

  const goAdminVehicles = () => navigate("/admin/vehicles");
  const goAdminBookings = () => navigate("/admin/bookings");

  if (loading) return null;

  return (
    <nav className="text-white bg-black px-3 py-2 flex justify-between items-center">

      {/* LOGO */}
      <h2
        onClick={goHome}
        className="text-xl font-bold text-yellow-500 cursor-pointer"
      >
        Rathod Cabs & Travels
      </h2>

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

            <button
              onClick={() => navigate("/profile")}
              className="bg-white text-black hover:bg-yellow-500 px-4 py-2 rounded font-semibold cursor-pointer"
            >
              Profile
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
