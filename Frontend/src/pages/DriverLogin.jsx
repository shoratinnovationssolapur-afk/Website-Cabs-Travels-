import { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore"; // Import doc and getDoc
import { useNavigate } from "react-router-dom";

export default function DriverLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const login = async () => {
    if (!email || !password) return alert("Please fill in all fields.");
    
    setLoading(true);
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      // UPDATE: Check the "drivers" collection instead of "users"
      const driverDoc = await getDoc(doc(db, "drivers", user.uid));
      
      if (driverDoc.exists()) {
        // If the document exists in 'drivers', they are authorized
        navigate("/driver/dashboard");
      } else {
        // If not in 'drivers', log them out and deny access
        alert("Access Denied: No driver profile found for this account.");
        await signOut(auth);
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 w-full max-w-md">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Driver Console</h2>
          <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mt-2">Secure Access</p>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block">Fleet Email</label>
            <input
              type="email"
              placeholder="name@company.com"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
            />
          </div>

          <button
            onClick={login}
            disabled={loading}
            className="bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-800 transition-all disabled:bg-gray-200 mt-4 shadow-xl shadow-gray-200"
          >
            {loading ? "Authenticating..." : "Sign In to Drive"}
          </button>
          
          <p className="text-center text-xs text-gray-400 font-bold mt-4">
            Authorized Personnel Only
          </p>
        </div>
      </div>
    </div>
  );
}