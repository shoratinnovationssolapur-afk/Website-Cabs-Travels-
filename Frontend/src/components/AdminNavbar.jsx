import { useNavigate } from "react-router-dom";

const AdminNavbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="bg-gray-900 text-white px-6 py-3 flex justify-between">

      <h2 className="text-xl font-bold">
        Admin Panel
      </h2>

      <div className="flex gap-4">

        <button onClick={() => navigate("/admin")}>
          Dashboard
        </button>

        <button onClick={() => navigate("/admin/vehicles")}>
          Vehicles
        </button>

        <button onClick={() => navigate("/admin/bookings")}>
          Bookings
        </button>

        <button onClick={() => navigate("/admin/drivers")}>
          Drivers
        </button>

      </div>

    </nav>
  );
};

export default AdminNavbar;
