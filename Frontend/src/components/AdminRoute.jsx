import { useAuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const { user, role, loading } = useAuthContext();

  if (loading) return <div>Loading...</div>;

  // CHANGE THIS: If no user, send them to the main homepage or public login
  if (!user) return <Navigate to="/" />; 

  // If they are logged in but NOT an admin, also send them away
  if (role !== "Admin") return <Navigate to="/" />;

  return children;
};

export default AdminRoute;
