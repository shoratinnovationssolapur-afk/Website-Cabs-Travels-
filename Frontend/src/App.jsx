import { useState } from "react";
import Navbar from "./components/Navbar";
import LoginModal from "./components/LoginModal";
import UserHome from "./pages/UserHome";
import RentCarPage from "./components/RentCarPage";
import BookingDetails from "./pages/BookingDetails";
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


import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
} from "react-router-dom";


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

      // ================= USER ROUTES =================
      { path: "/", element: <UserHome /> },
      { path: "/rent-your-car", element: <RentCarPage /> },
      { path: "/booking", element: <BookingDetails /> },

      // ================= ADMIN ROUTES =================
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
  path: "/admin",
  element: (
    <AdminRoute>
      <AdminLayout />
    </AdminRoute>
  )
}

    ],
  },
  { path: "/profile", element: <UserProfile /> },

  {
      
        path : "/booking-details",
        element : <BookingDetails />
      
  }

 ,
 
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
