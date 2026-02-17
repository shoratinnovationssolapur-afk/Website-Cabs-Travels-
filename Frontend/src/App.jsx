import { useState } from "react";
import Navbar from "./components/Navbar";
import LoginModal from "./components/LoginModal";
import HomePage from "./pages/Homepage";
import RentCarPage from "./components/RentCarPage";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
} from "react-router-dom";


// Layout wrapper (Navbar + Modal on all pages)
function Layout() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <Navbar openLogin={() => setShowLogin(true)} />

      {showLogin && (
        <LoginModal closeModal={() => setShowLogin(false)} />
      )}

      <Outlet /> {/* Page content renders here */}
    </>
  );
}


// Router
const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/rent-your-car", element: <RentCarPage /> },
    ],
  },
 
 
]);


function App() {
  return <RouterProvider router={router} />;
}

export default App;
