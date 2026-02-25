import { useState } from "react";
import DriverLayout from "./pages/DriverLayout";
import Navbar from "./components/Navbar";
import DriverProfile from "./pages/DriverProfile";
import LoginModal from "./components/LoginModal";
import RentCarPage from "./components/RentCarPage";
import BookingDetails from "./pages/BookingDetails";
import DriverDashboard from "./pages/DriverDashboard"; // Create this file from previous code
import DriverLogin from "./pages/DriverLogin";         // Create this file from previous code
import DriverRoute from "./components/DriverRoute";   // Add this helper
import UserDashboard from "./pages/UserDashboard";
import "leaflet/dist/leaflet.css";


import AdminVehicles from "./pages/AdminVehicles";
import AdminBookings from "./pages/AdminBookings";
import AdminUsers from "./pages/AdminUsers";
import AdminDashboard from "./pages/AdminDashboard";
import AdminDrivers from "./pages/AdminDrivers";

import AdminRoute from "./components/AdminRoute";
import { AuthProvider } from "./context/AuthContext";
import LogoutModal from "./components/LogoutModal";
import RoleMismatchModal from "./components/RoleMismatchModal";
import UserProfile from "./pages/UserProfile";
import AdminLayout from "./pages/AdminLayout";
import TourDetails from "./utils/TourDetails";
import AdminTours from "./pages/AdminTours";
import HomePage from "./pages/HomePage";
import UserBookings from "./pages/UserBookings";
import ToursSection from "./utils/ToursSection";




import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
} from "react-router-dom";
import UserLayout from "./pages/UserLayout";
import UserRoute from "./components/UserRoute";
import DriverHistory from "./pages/DriverHistory";
import DriverEarnings from "./pages/DriverEarnings";
import BookingSuccess from "./pages/BookingSuccess";

// ================= LAYOUT =================
function Layout() {
  const [showLogin, setShowLogin] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
    const [showMismatch, setShowMismatch] = useState(false);
    const [mismatchMsg, setMismatchMsg] = useState("");

  return (
    <>
      <Navbar
        openLogin={() => setShowLogin(true)}
        openLogout={() => setShowLogout(true)}
      />

      {showLogin && (
  <LoginModal
    closeModal={() => setShowLogin(false)}
    showMismatch={(msg) => {
      setMismatchMsg(msg);
      setShowMismatch(true);
    }}
  />
)}

      {showLogout && (
        <LogoutModal closeModal={() => setShowLogout(false)} />
      )}
      {showMismatch && (
        <RoleMismatchModal
          message={mismatchMsg}
          close={() => setShowMismatch(false)}
        />
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
      { path: "/", element: <HomePage /> },
      { path: "booking", element: <BookingDetails /> },
      { path: "profile", element: <UserProfile /> },
      { path: "rent-your-car", element: <RentCarPage /> },
      { path: "bookings", element: <UserBookings /> },
      { path: "tour/:id", element: <TourDetails /> },
      { path: "tours", element: <ToursSection /> },

      // ================= USER DASHBOARD =================
      {
        path: "/user",
        element: (
          <UserRoute>
            <UserLayout />
          </UserRoute>
        ),
 
      children: [
    { index: true, element: <UserDashboard /> }, // matches "/user"
    { path: "dashboard", element: <UserDashboard /> }, // matches "/user/dashboard"
    { path: "profile", element: <UserProfile /> },
  ],},

      // ================= DRIVER SECTION =================
      {
        path: "/driver-login",
        element: <DriverLogin />,
      },
   {
  path: "/driver",
  element: (
    <DriverRoute>
      <DriverLayout />
    </DriverRoute>
  ),
  children: [
    { path: "dashboard", element: <DriverDashboard /> },
    { path: "profile", element: <DriverProfile /> }, // This is where you use it
    { path: "history", element: <DriverHistory /> },
    { path: "earnings", element: <DriverEarnings /> },
  ]
},

      // ================= ADMIN DASHBOARD =================
      {
        path: "/admin",
        element: (
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        ),
        // If your AdminLayout also has an <Outlet />, you can move admin pages here as children
      },
      {
        path: "/admin/dashboard",
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
      {
        path: "/admin/drivers",
        element: (
          <AdminRoute>
            <AdminDrivers />
          </AdminRoute>
        ),
      },
      {
        path: "/admin/tours",
        element: (
          <AdminRoute>
            <AdminTours />
          </AdminRoute>
        ),
      },

      // ================= PUBLIC TOUR PAGE =================
      {
        path: "/tour/:id",
        element: <TourDetails />,
      },
      {
        path: "/tours",
        element: <ToursSection />,
      },
      {
      path: "/booking-success",
      element:<BookingSuccess />
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
