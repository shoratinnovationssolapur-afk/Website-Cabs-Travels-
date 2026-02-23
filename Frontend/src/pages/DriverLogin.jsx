import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function DriverLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const login = async () => {
    await signInWithEmailAndPassword(auth, email, password);
    navigate("/driver");
  };

  return (
    <div className="p-10 flex flex-col gap-3 max-w-sm mx-auto">
      <h2 className="text-2xl font-bold">Driver Login</h2>

      <input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2"
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2"
      />

      <button
        onClick={login}
        className="bg-blue-600 text-white py-2 rounded"
      >
        Login
      </button>
    </div>
  );
}