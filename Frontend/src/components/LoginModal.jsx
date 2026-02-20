import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [role, setRole] = useState("User");
  const [adminCode, setAdminCode] = useState("");

  const ADMIN_SECRET = "RATHOD_ADMIN_2026";
  const navigate = useNavigate();

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

      // New user
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

      // ⭐ Role mismatch check
      if (role !== userData.role) {
        showMismatch(`You are registered as ${userData.role}. Please login as ${userData.role}.`);
        await signOut(auth);
        return;
      }

      alert("Login Successful");

      navigate(userData.role === "Admin" ? "/admin" : "/");
      closeModal();

    } catch (error) {
      alert(error.message);
    }
  };

  // ================= REGISTER =================
  const registerUser = async () => {
    try {

      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await setDoc(doc(db, "users", userCred.user.uid), {
        name,
        email,
        role,
        createdAt: new Date()
      });

      alert("Account Created. Please login.");

      await signOut(auth);

      // Reset form
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

      // ⭐ Role mismatch
      if (role !== userData.role) {
        showMismatch(`You are registered as ${userData.role}. Please login as ${userData.role}.`);
        await signOut(auth);
        return;
      }

      // ⭐ Admin code check
      if (userData.role === "Admin") {
        if (adminCode !== ADMIN_SECRET) {
          alert("Invalid Admin Code");
          return;
        }
      }

      alert("Login Successful");

      navigate(userData.role === "Admin" ? "/admin" : "/");
      closeModal();

    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl w-[450px] p-8 relative">

        {/* ROLE SELECTOR */}
        <div className="flex gap-4 mb-4">
          <label>
            <input
              type="radio"
              value="User"
              checked={role === "User"}
              onChange={(e) => setRole(e.target.value)}
            />
            User
          </label>

          <label>
            <input
              type="radio"
              value="Admin"
              checked={role === "Admin"}
              onChange={(e) => setRole(e.target.value)}
            />
            Admin
          </label>
        </div>

        {/* GOOGLE BUTTON */}
        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 border py-3 rounded font-semibold hover:bg-gray-100 mb-4"
        >
          Continue with Google
        </button>

        <div className="text-center mb-4 text-gray-500">— OR —</div>

        {!isRegister ? (
          <>
            <h3 className="text-xl font-semibold mb-4">Login with Email</h3>

            <input
              type="email"
              placeholder="Email"
              className="w-full border p-3 rounded mb-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full border p-3 rounded mb-4"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {role === "Admin" && (
              <input
                type="password"
                placeholder="Enter Admin Code"
                className="w-full border p-3 rounded mb-4"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
              />
            )}

            <button
              onClick={loginUser}
              className="w-full bg-blue-900 text-white py-3 rounded font-semibold"
            >
              Login
            </button>

            <p className="mt-4 text-sm">
              New User?{" "}
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
            <h3 className="text-xl font-semibold mb-4">Create Account</h3>

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

            <input
              type="password"
              placeholder="Password"
              className="w-full border p-3 rounded mb-4"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              onClick={registerUser}
              className="w-full bg-green-600 text-white py-3 rounded font-semibold"
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
          className="absolute top-3 right-3 text-xl font-bold"
        >
          ✕
        </button>

      </div>
    </div>
  );
};

export default LoginModal;