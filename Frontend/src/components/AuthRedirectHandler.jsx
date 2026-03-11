import { Navigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

const AuthRedirectHandler = ({ children }) => {
  const { user, role, loading } = useAuthContext();

  // 1. Wait for Firebase to tell us who this is
  if (loading) return null; // Or a splash screen

  // 2. If it's an Admin, they are NOT allowed here. Push to Admin panel.
  if (user && role === "Admin") {
    return <Navigate to="/admin" replace />;
  }

  // 3. If it's a regular user or guest, show them the homepage
  return children;
};
export default AuthRedirectHandler