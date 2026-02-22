import { useAuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const UserRoute = ({ children }) => {
  const { user, role, loading } = useAuthContext();

  if (loading) return <div>Loading...</div>;

  if (!admin) return <Navigate to="/" />;

  if (role !== "admin") return <Navigate to="/" />;

  return children;
};

export default UserRoute;
