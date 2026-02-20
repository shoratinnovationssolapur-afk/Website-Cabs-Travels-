import { useAuthContext } from "../context/AuthContext";
import AdminDashboard from "./AdminDashboard";
import UserHome from "./UserHome";

const HomePage = () => {
  const { role } = useAuthContext();

  if (role === "Admin") {
    return <AdminDashboard />;
  }

  return <UserHome />;
};

export default HomePage;
