import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoEye, IoEyeOff } from "react-icons/io5";
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

const LoginModal = ({ closeModal, showMismatch }) => {
  const [showadminCode, setShowAdminCode] = useState(false);
  const [showPassword,setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // Role can now be "User", "Admin", or "Driver"
  const [role, setRole] = useState("User"); 
  const [adminCode, setAdminCode] = useState("");

  const ADMIN_SECRET = "RATHOD_ADMIN_2026";
  const navigate = useNavigate();

  // Helper to handle navigation based on role
  const redirectByRole = (userRole) => {
    if (userRole === "Admin") navigate("/admin/dashboard");
    else if (userRole === "Driver") navigate("/driver/dashboard");
    else navigate("/");
  };

  // ================= GOOGLE LOGIN =================
  const signInWithGoogle = async () => {
    try {
      if (role === "Admin" && adminCode !== ADMIN_SECRET) {
        alert("Invalid Admin Code");
        return;
      }

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        await setDoc(userRef, {
          name: user.displayName,
          email: user.email,
          photo: user.photoURL,
          role,
          createdAt: new Date()
        });
      }

      const userData = (await getDoc(userRef)).data();

      if (role !== userData.role) {
        showMismatch(`You are registered as ${userData.role}. Please login as ${userData.role}.`);
        await signOut(auth);
        return;
      }

      alert("Login Successful");
      redirectByRole(userData.role);
      closeModal();
    } catch (error) {
      alert(error.message);
    }
  };

  // ================= REGISTER =================
  const registerUser = async () => {
    try {
      // Logic for Driver registration: 
      // If you need specific driver codes, you can add a check here similar to Admin.
      
      const userCred = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", userCred.user.uid), {
        name,
        email,
        role,
        createdAt: new Date()
      });

      alert("Account Created. Please login.");
      await signOut(auth);

      setEmail("");
      setPassword("");
      setName("");
      setIsRegister(false);
    } catch (error) {
      alert(error.message);
    }
  };

  // ================= LOGIN =================
  const loginUser = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);

      const user = auth.currentUser;
      const snap = await getDoc(doc(db, "users", user.uid));

      if (!snap.exists()) {
        alert("User profile not found");
        return;
      }

      const userData = snap.data();

      if (role !== userData.role) {
        showMismatch(`You are registered as ${userData.role}. Please login as ${userData.role}.`);
        await signOut(auth);
        return;
      }

      if (userData.role === "Admin" && adminCode !== ADMIN_SECRET) {
        alert("Invalid Admin Code");
        await signOut(auth);
        return;
      }

      alert("Login Successful");
      redirectByRole(userData.role);
      closeModal();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[450px] p-8 relative">
        
        {/* ROLE SELECTOR */}
        <div className="flex justify-between mb-6 bg-gray-100 p-2 rounded-lg">
          {["User", "Driver", "Admin"].map((r) => (
            <label key={r} className={`flex-1 text-center py-2 rounded-md cursor-pointer transition-all ${role === r ? "bg-blue-900 text-white" : "text-gray-600"}`}>
              <input
                type="radio"
                className="hidden"
                value={r}
                checked={role === r}
                onChange={(e) => setRole(e.target.value)}
              />
              {r}
            </label>
          ))}
        </div>

        {/* GOOGLE BUTTON */}
        <button
          onClick={signInWithGoogle}
         className="w-full flex items-center justify-center gap-3 border py-3 rounded font-semibold hover:bg-gray-100 mb-4"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5"
          />
        
          Continue with Google
        </button>

        <div className="text-center mb-4 text-gray-500">— OR —</div>

        {!isRegister ? (
          <>
            <h3 className="text-xl font-semibold mb-4">Login as {role}</h3>
            <input
              type="email"
              placeholder="Email"
              className="w-full border p-3 rounded mb-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="relative mb-4">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full border p-3 rounded"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div 
                className="absolute top-[18px] right-[12px] cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <IoEyeOff className="text-gray-500" /> : <IoEye className="text-gray-500" />}
              </div>
            </div>

            {role === "Admin" && (
              <div className="relative mb-4">
                <input
                  type={showadminCode ? "text" : "password"}
                  placeholder="Enter Admin Code"
                  className="w-full border p-3 rounded"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                />
                <div 
                  className="absolute top-[17px] right-[12px] cursor-pointer"
                  onClick={() => setShowAdminCode(!showadminCode)}
                >
                  {showadminCode ? <IoEyeOff className="text-gray-500" /> : <IoEye className="text-gray-500" />}
                </div>
              </div>
            )}

            <button
              onClick={loginUser}
              className="w-full bg-blue-900 text-white py-3 rounded font-semibold hover:bg-blue-800"
            >
              Login
            </button>

            <p className="mt-4 text-sm">
              New {role}?{" "}
              <span
                onClick={() => setIsRegister(true)}
                className="text-blue-700 font-semibold cursor-pointer"
              >
                Register Now
              </span>
            </p>
          </>
        ) : (
          <>
            <h3 className="text-xl font-semibold mb-4">Create {role} Account</h3>
            <input
              placeholder="Full Name"
              className="w-full border p-3 rounded mb-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full border p-3 rounded mb-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="relative mb-4">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full border p-3 rounded"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div 
                className="absolute top-[18px] right-[12px] cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <IoEyeOff className="text-gray-500" /> : <IoEye className="text-gray-500" />}
              </div>
            </div>
            

            <button
              onClick={registerUser}
              className="w-full bg-green-600 text-white py-3 rounded font-semibold hover:bg-green-700"
            >
              Create Account
            </button>

            <p className="mt-4 text-sm">
              Already have an account?{" "}
              <span
                onClick={() => setIsRegister(false)}
                className="text-blue-700 font-semibold cursor-pointer"
              >
                Login
              </span>
            </p>
          </>
        )}

        {/* CLOSE BUTTON */}
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 text-xl font-bold text-gray-400 hover:text-black"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default LoginModal;