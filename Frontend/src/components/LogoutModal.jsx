import React from "react";
import { useNavigate } from 'react-router-dom'; // 1. Import the hook
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

const LogoutModal = ({ closeModal }) => {

  const navigate = useNavigate(); // 2. Initialize the navigate function

const handleLogout = async () => {
  try {
    await signOut(auth);
    closeModal();
    navigate('/'); // 3. Redirect to the homepage
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl p-6 w-[90%] max-w-sm text-center shadow-xl">

        <h2 className="text-xl font-bold mb-3">
          Confirm Logout
        </h2>

        <p className="text-gray-600 mb-6">
          Are you sure you want to logout?
        </p>

        <div className="flex gap-3 justify-center">

          <button
            onClick={closeModal}
            className="px-5 py-2 rounded bg-gray-300 hover:bg-gray-400"
          >
            Cancel
          </button>

          <button
            onClick={handleLogout}
            className="px-5 py-2 rounded bg-red-600 text-white hover:bg-red-700"
          >
            Logout
          </button>

        </div>

      </div>
    </div>
  );
};

export default LogoutModal;
