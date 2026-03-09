import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuthContext } from "../context/AuthContext";
import { auth, db } from "../firebase";
import { FaBars, FaXmark } from "react-icons/fa6";
import { doc, getDoc } from "firebase/firestore";

const Navbar = ({ openLogin, openLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role } = useAuthContext();

  const [username, setUsername] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    if (!user) {
      openLogin();
      return;
    }

    if (role === "Admin") {
      navigate("/admin/dashboard");
    } else if (role === "Driver") {
      navigate("/driver/dashboard");
    } else if (role === "User") {
      location.pathname.startsWith("/user") ? navigate("/") : navigate("/user/dashboard");
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (!authUser) {
        setUsername("");
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", authUser.uid));
        if (snap.exists()) {
          setUsername(snap.data().name || "");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className="text-white bg-black px-3 py-2 relative">
      <div className="flex justify-between items-center">
        <div className="flex gap-3 items-center min-w-0">
          <FaBars className="relative top-0.5 cursor-pointer shrink-0" onClick={toggleSB} />

          <div onClick={goHome} className="flex items-center gap-3 cursor-pointer min-w-0">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-yellow-500 shadow-sm shrink-0">
              <img src="https://res.cloudinary.com/dx8vqwqxq/image/upload/v1773059045/logo_1_ioobkr.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-xl font-bold text-yellow-500 truncate">Rathod Express</h2>
          </div>

          {username && (
            <div className="hidden md:block bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl text-yellow-400 font-semibold shadow-lg relative top-0.5">
              Welcome back, {username}
            </div>
          )}
        </div>

        <div className="hidden md:flex gap-4">
          {user && role === "Admin" && (
            <>
              <button onClick={() => navigate("/admin")} className="bg-white text-black hover:bg-yellow-500 px-4 py-2 rounded font-semibold cursor-pointer">Home</button>
              <button onClick={() => navigate("/admin/vehicles")} className="bg-white text-black hover:bg-yellow-500 px-4 py-2 rounded font-semibold cursor-pointer">Manage Vehicles</button>
              <button onClick={() => navigate("/admin/bookings")} className="bg-white text-black hover:bg-yellow-500 px-4 py-2 rounded font-semibold cursor-pointer">Bookings</button>
              <button onClick={() => navigate("/admin/users")} className="bg-white text-black hover:bg-yellow-500 px-4 py-2 rounded font-semibold cursor-pointer">Users</button>
              <button onClick={() => navigate("/admin/drivers")} className="bg-white text-black hover:bg-yellow-500 px-4 py-2 rounded font-semibold cursor-pointer">Drivers</button>
              <button onClick={openLogout} className="bg-white text-black hover:bg-yellow-500 px-4 py-2 rounded font-semibold cursor-pointer">Logout</button>
            </>
          )}

          {user && role === "Driver" && (
            <>
              <button onClick={() => navigate("/driver/dashboard")} className="bg-white text-black hover:bg-yellow-500 px-4 py-2 rounded font-semibold cursor-pointer">Dashboard</button>
              <button onClick={openLogout} className="bg-white text-black hover:bg-yellow-500 px-4 py-2 rounded font-semibold cursor-pointer">Logout</button>
            </>
          )}

          {user && role === "User" && (
            <>
              <button onClick={() => navigate("/")} className="bg-white text-black hover:bg-yellow-500 px-4 py-2 rounded font-semibold cursor-pointer">Home</button>
              <button onClick={() => navigate("/rent-your-car")} className="bg-white text-black hover:bg-yellow-500 px-4 py-2 rounded font-semibold cursor-pointer">Rent Your Car</button>
              <button onClick={openLogout} className="bg-white text-black hover:bg-yellow-500 px-4 py-2 rounded font-semibold cursor-pointer">Logout</button>
            </>
          )}

          {!user && (
            <button onClick={openLogin} className="bg-white text-black hover:bg-yellow-500 px-4 py-2 rounded font-semibold cursor-pointer">
              Login / Create Account
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="md:hidden p-2 rounded border border-white/20"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <FaXmark /> : <FaBars />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden mt-3 flex flex-col gap-2 bg-zinc-900 border border-white/10 rounded-xl p-3">
          {user && role === "Admin" && (
            <>
              <button onClick={() => navigate("/admin")} className="bg-white text-black hover:bg-yellow-500 px-4 py-2 rounded font-semibold cursor-pointer text-left">Home</button>
              <button onClick={() => navigate("/admin/vehicles")} className="bg-white text-black hover:bg-yellow-500 px-4 py-2 rounded font-semibold cursor-pointer text-left">Manage Vehicles</button>
              <button onClick={() => navigate("/admin/bookings")} className="bg-white text-black hover:bg-yellow-500 px-4 py-2 rounded font-semibold cursor-pointer text-left">Bookings</button>
              <button onClick={() => navigate("/admin/users")} className="bg-white text-black hover:bg-yellow-500 px-4 py-2 rounded font-semibold cursor-pointer text-left">Users</button>
              <button onClick={() => navigate("/admin/drivers")} className="bg-white text-black hover:bg-yellow-500 px-4 py-2 rounded font-semibold cursor-pointer text-left">Drivers</button>
              <button onClick={openLogout} className="bg-white text-black hover:bg-yellow-500 px-4 py-2 rounded font-semibold cursor-pointer text-left">Logout</button>
            </>
          )}

          {user && role === "Driver" && (
            <>
              <button onClick={() => navigate("/driver/dashboard")} className="bg-white text-black hover:bg-yellow-500 px-4 py-2 rounded font-semibold cursor-pointer text-left">Dashboard</button>
              <button onClick={openLogout} className="bg-white text-black hover:bg-yellow-500 px-4 py-2 rounded font-semibold cursor-pointer text-left">Logout</button>
            </>
          )}

          {user && role === "User" && (
            <>
              <button onClick={() => navigate("/")} className="bg-white text-black hover:bg-yellow-500 px-4 py-2 rounded font-semibold cursor-pointer text-left">Home</button>
              <button onClick={() => navigate("/rent-your-car")} className="bg-white text-black hover:bg-yellow-500 px-4 py-2 rounded font-semibold cursor-pointer text-left">Rent Your Car</button>
              <button onClick={openLogout} className="bg-white text-black hover:bg-yellow-500 px-4 py-2 rounded font-semibold cursor-pointer text-left">Logout</button>
            </>
          )}

          {!user && (
            <button onClick={openLogin} className="bg-white text-black hover:bg-yellow-500 px-4 py-2 rounded font-semibold cursor-pointer text-left">
              Login / Create Account
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
