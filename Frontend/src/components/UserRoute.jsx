import { useAuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const UserRoute = ({ children }) => {
  const { user, role, loading } = useAuthContext();

  // 🔄 Wait for auth to load
  if (loading) return <div>Loading...</div>;

  // ❌ Not logged in
  // if (!user) return <Navigate to="/" />;

  // ❌ Admin trying to access user panel
  if (role === "Admin") return <Navigate to="/admin" />;

  // ✅ Normal user allowed
  return children;
};

export default UserRoute;