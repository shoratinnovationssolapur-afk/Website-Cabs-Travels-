import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import ProfilePage from "./pages/ProfilePage";
import AboutUs from "./pages/AboutUs";
import PricingPage from "./pages/PricingPage";
import ProtectedRoute from "./pages/ProtectedRoute";

// ✅ New Pages
import TripHistory from "./pages/TripHistory";
import Invoice from "./pages/Invoice";
import Services from "./pages/Services";
import TourPackagesPage from "./pages/TourPackagesPage";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Signin />,
    },
    {
      path: "/signin",
      element: <Signin />,
    },
    {
      path: "/signup",
      element: <Signup />,
    },

    // ✅ Protected Profile Page
    {
      path: "/profile",
      element: (
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      ),
    },

    // ✅ Protected Trip History Page
    {
      path: "/history",
      element: (
        <ProtectedRoute>
          <TripHistory />
        </ProtectedRoute>
      ),
    },

    // ✅ Protected Invoice Page (Dynamic ID)
    {
      path: "/invoice/:id",
      element: (
        <ProtectedRoute>
          <Invoice />
        </ProtectedRoute>
      ),
    },
    {
      path: "/services",
      element:(<Services/>)
    },

    // ✅ Public About Page
    {
      path: "/aboutus",
      element: <AboutUs />,
    },

    // ✅ Public Pricing Page
    {
      path: "/pricing",
      element: <PricingPage />,
    },
    {
      path:"/tours",
      element:<TourPackagesPage />
    }
  ]);

  return <RouterProvider router={router} />;
}

export default App;
