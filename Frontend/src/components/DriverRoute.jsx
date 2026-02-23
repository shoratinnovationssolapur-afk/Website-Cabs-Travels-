import { Navigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext"; // Use the correct name here

const DriverRoute = ({ children }) => {
  const { user, role, loading } = useAuthContext(); // Match the hook name

  if (loading) return <div className="p-10">Loading...</div>;

  if (!user || role !== "Driver") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default DriverRoute;