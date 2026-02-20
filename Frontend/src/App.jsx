import { useState } from "react";
import Navbar from "./components/Navbar";
import LoginModal from "./components/LoginModal";
import UserHome from "./pages/UserHome";
import RentCarPage from "./components/RentCarPage";
import BookingDetails from "./pages/BookingDetails";

import AdminVehicles from "./pages/AdminVehicles";
import AdminBookings from "./pages/AdminBookings";
import AdminUsers from "./pages/AdminUsers";
import AdminDashboard from "./pages/AdminDashboard";

import AdminRoute from "./components/AdminRoute";
import { AuthProvider } from "./context/AuthContext";
import LogoutModal from "./components/LogoutModal";

import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
} from "react-router-dom";


// ================= LAYOUT =================
function Layout() {
  const [showLogin, setShowLogin] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  return (
    <>
      <Navbar
        openLogin={() => setShowLogin(true)}
        openLogout={() => setShowLogout(true)}
      />

      {showLogin && (
        <LoginModal closeModal={() => setShowLogin(false)} />
      )}

      {showLogout && (
        <LogoutModal closeModal={() => setShowLogout(false)} />
      )}

      <Outlet />
    </>
  );
}


// ================= ROUTER =================
const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [

      // ================= USER ROUTES =================
      { path: "/", element: <UserHome /> },
      { path: "/rent-your-car", element: <RentCarPage /> },
      { path: "/booking", element: <BookingDetails /> },

      // ================= ADMIN ROUTES =================
      {
        path: "/admin",
        element: (
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        ),
      },
      {
        path: "/admin/vehicles",
        element: (
          <AdminRoute>
            <AdminVehicles />
          </AdminRoute>
        ),
      },
      {
        path: "/admin/bookings",
        element: (
          <AdminRoute>
            <AdminBookings />
          </AdminRoute>
        ),
      },
      {
        path: "/admin/users",
        element: (
          <AdminRoute>
            <AdminUsers />
          </AdminRoute>
        ),
      },

    ],
  },
]);



// ================= APP =================
function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
