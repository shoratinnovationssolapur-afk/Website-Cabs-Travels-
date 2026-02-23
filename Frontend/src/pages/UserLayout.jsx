import { Outlet, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

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
        <h2 className="text-xl font-bold text-yellow-400">
          User Panel
        </h2>


        <button onClick={() => navigate("/bookings")}
          className="block w-full text-left hover:text-yellow-400">
          My Bookings
        </button>

        <button onClick={() => navigate("/profile")}
          className="block w-full text-left hover:text-yellow-400">
          Profile
        </button>

        <button onClick={logout}
          className="block w-full text-left text-red-400">
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