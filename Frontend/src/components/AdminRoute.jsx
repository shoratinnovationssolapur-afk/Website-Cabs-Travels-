import { useAuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const { user, role, loading } = useAuthContext();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/admin" />;

  if (role !== "Admin") return <Navigate to="/admin" />;

  return children;
};

export default AdminRoute;
