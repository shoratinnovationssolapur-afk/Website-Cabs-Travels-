import { useState } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
const LoginModal = ({ closeModal }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // ================= GOOGLE LOGIN =================
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Save user if new
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        await setDoc(userRef, {
          name: user.displayName,
          email: user.email,
          photo: user.photoURL,
          createdAt: new Date()
        });
      }

      alert("Login Successful");
      closeModal();

    } catch (error) {
      alert(error.message);
    }
  };

  // ================= EMAIL REGISTER =================
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
        createdAt: new Date()
      });

      alert("Account Created");
      closeModal();

    } catch (error) {
      alert(error.message);
    }
  };

  // ================= EMAIL LOGIN =================
  const loginUser = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);

      alert("Login Successful");
      closeModal();

    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl w-[450px] p-8 relative">

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

        <div className="text-center mb-4 text-gray-500">
          — OR —
        </div>

        {!isRegister ? (
          <>
            <h3 className="text-xl font-semibold mb-4">
              Login with Email
            </h3>

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
            <h3 className="text-xl font-semibold mb-4">
              Create Account
            </h3>

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
