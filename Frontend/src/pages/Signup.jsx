import React, { useState } from "react";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

// ✅ Firebase Signup Function
import { signupUser } from "../firebase/auth";

const Signup = () => {
  const [showpassword, setshowpassword] = useState(false);
  const [isNight, setIsNight] = useState(false);

  // ✅ Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ✅ Loading + Error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // ✅ Signup Handler
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("Please fill all fields ❌");
      return;
    }

    try {
      setLoading(true);

      // Firebase Auth Signup
      await signupUser(email, password);

      alert("Account Created Successfully ✅");

      navigate("/signin");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`w-full h-screen relative overflow-hidden flex justify-center items-center transition-colors duration-700 ${
        isNight
          ? "bg-gradient-to-b from-indigo-950 via-slate-900 to-black"
          : "bg-gradient-to-b from-sky-300 via-sky-200 to-sky-100"
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsNight(!isNight)}
        className="absolute top-6 right-6 z-20 bg-white/30 backdrop-blur px-4 py-2 rounded-full text-sm font-semibold"
      >
        {isNight ? "Day Mode" : "Night Mode"}
      </button>

      {/* Car Animation */}
      <div className="absolute bottom-4 left-70 right-10 animate-drive flex ">
        <img
          src="https://cdn-icons-png.flaticon.com/512/3774/3774278.png"
          alt="SUV"
          className="w-28"
        />
        
      </div>

      {/* Road */}
      <div className="absolute bottom-1 h-[30px] w-full h-6 bg-gray-800"></div>
      <div className="absolute bottom-3 w-full border-t-4 border-dashed border-yellow-400"></div>

      {/* Signup Form */}
      <form
        onSubmit={handleSignup}
        className="relative z-10 w-[90%] h-[520px]  max-w-[500px] bg-white/20  shadow-xl shadow-blue-900/30 flex flex-col justify-center items-center gap-[20px] px-[20px] rounded-2xl"
      >
        <h1 className={`${isNight?"text-white":"text-black"} text-[28px] font-semibold font-serif mb-[20px] text-center`}>
          Register to{" "}
          <span className={`${isNight?"text-yellow-300":"text-blue-700"}`}>Rathod Cabs And Travels</span>
        </h1>

        {/* Name */}
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`w-full h-[60px] outline-0 border-2 border-white bg-transparent ${isNight ? "text-white placeholder-white" : "text-black placeholder-black"}  px-[20px] rounded-full`}
        />

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`w-full h-[60px] outline-0 border-2 border-white bg-transparent ${isNight ? "text-white placeholder-white" : "text-black placeholder-black"}  px-[20px] rounded-full`}
        />

        {/* Password */}
        <div className="w-full h-[60px] relative">
          <input
            type={showpassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full h-full outline-0 border-2 border-white bg-transparent ${isNight ? "text-white placeholder-white" : "text-black placeholder-black"}  px-[20px] rounded-full`}
          />

          {showpassword ? (
            <IoEyeOff
              className="absolute top-[18px] right-[40px] text-white w-[25px] h-[25px] cursor-pointer"
              onClick={() => setshowpassword(false)}
            />
          ) : (
            <IoEye
              className="absolute top-[18px] right-[40px] text-white w-[25px] h-[25px] cursor-pointer"
              onClick={() => setshowpassword(true)}
            />
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        {/* Signup Button */}
        <button
          type="submit"
          disabled={loading}
          className="min-w-[130px] h-[50px] bg-white rounded-full text-[18px] font-bold hover:bg-blue-200 transition disabled:opacity-60"
        >
          {loading ? "Creating..." : "Sign Up"}
        </button>

        {/* Redirect */}
        <p
          className={`${isNight?"text-white":"text-black"} cursor-pointer`}
          onClick={() => navigate("/signin")}
        >
          Already have an account?{" "}
          <span className={`${isNight?"text-yellow-300":"text-blue-700"} font-semibold cursor-pointer`}>Sign In</span>
        </p>
      </form>
    </div>
  );
};

export default Signup;
