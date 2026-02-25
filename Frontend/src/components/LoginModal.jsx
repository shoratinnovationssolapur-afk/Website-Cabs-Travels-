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
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

//Regex for validating form format3
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[6-9]\d{9}$/; // Indian numbers: starts with 6-9 and total 10 digits
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/; // Min 8 chars, 1 Upper, 1 Lower, 1 Number

const LoginModal = ({ closeModal, showMismatch }) => {
  const [showadminCode, setShowAdminCode] = useState(false);
  const [showPassword,setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  
  // Basic Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  // Driver Specific Fields
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [role, setRole] = useState("User");
  const [adminCode, setAdminCode] = useState("");

  const ADMIN_SECRET = "RATHOD_ADMIN_2026";
  const navigate = useNavigate();

  const redirectByRole = (userRole) => {
    if (userRole === "Admin") navigate("/admin/dashboard");
    else if (userRole === "Driver") navigate("/driver/dashboard");
    else navigate("/");
  };

  // ================= REGISTER =================
  const registerUser = async () => {
    if (!validateForm()) return;
        // Validation for Driver
    if (role === "Driver") {
      if (!phone || !address) {
        alert("Phone and Address are required for Drivers");
        return;
      }
    }

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      // 1. Always create entry in 'users' collection for Auth reference
      await setDoc(doc(db, "users", uid), {
        name,
        email,
        role,
        createdAt: serverTimestamp()
      });

      // 2. If Driver, create entry in 'drivers' collection with your specific schema
      if (role === "Driver") {
        await setDoc(doc(db, "drivers", uid), {
          name,
          email, // adding email for reference
          phone,
          address,
          available: false,
          currentRideId: "",
          rating: 5,
          status: "active",
          createdAt: serverTimestamp()
        });
      }

      alert("Account Created. Please login.");
      await signOut(auth);
      
      // Reset logic
      setIsRegister(false);
      setPhone("");
      setAddress("");
    } catch (error) {
      alert(error.message);
    }
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

  const validateForm = () => {
  if (isRegister && name.trim().length < 3) {
    alert("Please enter a valid full name (min 3 characters).");
    return false;
  }

  if (!EMAIL_REGEX.test(email)) {
    alert("Please enter a valid email address.");
    return false;
  }

  if (!PWD_REGEX.test(password)) {
    alert("Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, and a number.");
    return false;
  }

  if (isRegister && role === "Driver") {
    if (!PHONE_REGEX.test(phone)) {
      alert("Please enter a valid 10-digit Indian phone number.");
      return false;
    }
    if (address.trim().length < 10) {
      alert("Please enter a more detailed address.");
      return false;
    }
  }

  return true;
};


  // ================= LOGIN =================
  const loginUser = async () => {

    // Only validate email/password format for login
  if (!EMAIL_REGEX.test(email)) return alert("Invalid email format.");
  
  if (role === "Admin" && adminCode !== ADMIN_SECRET) {
    alert("Unauthorized: Incorrect Admin Code");
    return;
  }
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

      alert("Login Successful");
      redirectByRole(userData.role);
      closeModal();
    } catch (error) {
    // Check specific Firebase Error Codes
    switch (error.code) {
      case 'auth/user-not-found':
        alert("No account found with this email. Please register first.");
        break;
      case 'auth/wrong-password':
        alert("Incorrect password. Please try again.");
        break;
      case 'auth/invalid-email':
        alert("The email address is badly formatted.");
        break;
      default:
        alert(error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[450px] p-8 relative max-h-[90vh] overflow-y-auto">
        
        {/* ROLE SELECTOR */}
        <div className="flex justify-between mb-6 bg-gray-100 p-1 rounded-lg">
          {["User", "Driver", "Admin"].map((r) => (
            <button 
              key={r}
              onClick={() => { setRole(r); setIsRegister(false); }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${role === r ? "bg-white shadow text-blue-900" : "text-gray-500"}`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* GOOGLE BUTTON - Hidden for Drivers */}
        {role !== "Driver" && (
          <>
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
              Sign in with Google
            </button>

            <div className="text-center mb-4 text-gray-400 text-xs">— OR —</div>
          </>
        )}

        <h3 className="text-xl font-bold mb-4">{isRegister ? 'Create Account' : 'Login'}</h3>

        <div className="space-y-3">
          {isRegister && (
            <input
              placeholder="Full Name"
              className="w-full border p-3 rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}

          <input
            type="email"
            placeholder="Email Address"
            className="w-full border p-3 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full border p-3 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
           <div className="absolute right-15 top-80 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                   {showPassword ? <IoEyeOff /> : <IoEye />}
                </div>

          {/* DRIVER SPECIFIC FIELDS */}
          {isRegister && role === "Driver" && (
            <>
              <input
                placeholder="Phone Number"
                className="w-full border p-3 rounded"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <textarea
                placeholder="Home Address"
                className="w-full border p-3 rounded"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </>
          )}

          {role === "Admin" && !isRegister && (
             <div className="relative">
                <input
                  type={showadminCode ? "text" : "password"}
                  placeholder="Enter Admin Code"
                  className="w-full border p-3 rounded"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                />
                <div className="absolute right-3 top-4 cursor-pointer" onClick={() => setShowAdminCode(!showadminCode)}>
                   {showadminCode ? <IoEyeOff /> : <IoEye />}
                </div>
             </div>
          )}

          <button
            onClick={isRegister ? registerUser : loginUser}
            className={`w-full py-3 rounded font-bold text-white transition ${isRegister ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-900 hover:bg-blue-800'}`}
          >
            {isRegister ? "Register as " + role : "Login as " + role}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          {isRegister ? "Already have an account?" : `New to the platform?`} 
          <span
            onClick={() => setIsRegister(!isRegister)}
            className="text-blue-700 font-bold ml-1 cursor-pointer hover:underline"
          >
            {isRegister ? "Login" : "Register Now"}
          </span>
        </p>

        <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-black text-xl">✕</button>
      </div>
    </div>
  );
};
}
export default LoginModal;