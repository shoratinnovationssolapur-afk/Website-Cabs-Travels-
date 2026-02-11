import { Navigate } from "react-router-dom";
import { useAuth } from "../firebase/useAuth";

function ProtectedRoute({ children }) {
  const user = useAuth();

  // ✅ Wait for Firebase session check
  if (user === undefined) {
    return <h2 className="text-center mt-10">Loading...</h2>;
  }

  if (!user) {
    return <Navigate to="/signin" />;
  }

  return children;
}

export default ProtectedRoute;
