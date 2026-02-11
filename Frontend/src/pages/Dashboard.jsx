import { logoutUser } from "../firebase/auth";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    alert("Logged Out ✅");

    navigate("/signin");
  };

  return (
    <div>
      <h1>Welcome Samarth 🚖🔥</h1>

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Dashboard;
