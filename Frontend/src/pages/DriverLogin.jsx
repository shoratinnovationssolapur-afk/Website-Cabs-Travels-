import { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function DriverLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const login = async () => {
    setLoading(true);
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      // Check role in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (userDoc.exists() && userDoc.data().role === "Driver") {
        navigate("/driver/dashboard");
      } else {
        alert("Access Denied: You are not registered as a Driver.");
        await signOut(auth);
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-blue-900 mb-6 text-center">Driver Portal</h2>
        <div className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            onClick={login}
            disabled={loading}
            className="bg-blue-900 text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition disabled:bg-gray-400"
          >
            {loading ? "Verifying..." : "Login to Dashboard"}
          </button>
        </div>
      </div>
    </div>
  );
}