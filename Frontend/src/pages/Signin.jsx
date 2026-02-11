import React, { useState } from "react";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../firebase/auth";

const Signin = () => {
  const [showpassword, setshowpassword] = useState(false);
  const [isNight, setIsNight] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSignin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      await loginUser(email, password);
      alert("Login Successful");
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid Credentials");
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
      <div className="absolute bottom-16 animate-drive flex flex-col items-center">
        <img
          src="https://cdn-icons-png.flaticon.com/512/3774/3774278.png"
          alt="SUV"
          className="w-28"
        />
       
      </div>

      {/* Road */}
      <div className="absolute bottom-10 w-full h-6 bg-gray-800"></div>
      <div className="absolute bottom-12 w-full border-t-4 border-dashed border-yellow-400"></div>

      {/* Signin Form */}
      <form
        onSubmit={handleSignin}
        className="relative z-10 w-[90%] max-w-[500px] bg-white/20 backdrop-blur-md shadow-xl shadow-blue-900/30 flex flex-col justify-center items-center gap-[20px] px-[20px] py-[40px] rounded-2xl"
      >
        <h1
          className={`${
            isNight ? "text-white" : "text-black"
          } text-[28px] font-semibold font-serif text-center`}
        >
          Welcome Back to{" "}
          <span className={isNight ? "text-yellow-300" : "text-blue-700"}>
            Rathod Cabs And Travels
          </span>
        </h1>

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`w-full h-[55px] outline-none border-2 border-white bg-transparent ${
            isNight ? "text-white placeholder-white" : "text-black placeholder-black"
          } px-[20px] rounded-full`}
        />

        {/* Password */}
        <div className="w-full h-[55px] relative">
          <input
            type={showpassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full h-full outline-none border-2 border-white bg-transparent ${
              isNight ? "text-white placeholder-white" : "text-black placeholder-black"
            } px-[20px] rounded-full`}
          />

          {showpassword ? (
            <IoEyeOff
              className="absolute top-[15px] right-[25px] text-white w-[22px] h-[22px] cursor-pointer"
              onClick={() => setshowpassword(false)}
            />
          ) : (
            <IoEye
              className="absolute top-[15px] right-[25px] text-white w-[22px] h-[22px] cursor-pointer"
              onClick={() => setshowpassword(true)}
            />
          )}
        </div>

        {/* Error */}
        {error && <p className="text-red-300 text-sm text-center">{error}</p>}

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="min-w-[140px] h-[50px] bg-white rounded-full text-[18px] font-bold hover:bg-blue-200 transition disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Sign In"}
        </button>

        {/* Redirect */}
        <p
          className={`${
            isNight ? "text-white" : "text-black"
          } cursor-pointer`}
          onClick={() => navigate("/signup")}
        >
          Don’t have an account?{" "}
          <span className="text-blue-800 font-semibold">Sign Up</span>
        </p>
      </form>
    </div>
  );
};

export default Signin;
