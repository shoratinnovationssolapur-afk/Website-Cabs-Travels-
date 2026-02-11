import React, { useState } from "react";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const Signin = () => {
  const [showpassword, setshowpassword] = useState(false);
  const [isNight, setIsNight] = useState(false);

  const navigate = useNavigate();

  return (
    <div
      className={`w-full h-screen relative  overflow-hidden flex justify-center items-center transition-colors duration-700 ${
        isNight
          ? "bg-gradient-to-b from-indigo-950 via-slate-900 to-black"
          : "bg-gradient-to-b from-sky-300 via-sky-200 to-sky-100"
      }`}
    >
      
      <button
        onClick={() => setIsNight(!isNight)}
        className="absolute top-6 right-6 z-20 bg-white/30 backdrop-blur px-4 py-2 rounded-full text-sm font-semibold"
      >
        {isNight ? "Day Mode" : "Night Mode"}
      </button>

      
      <div className="absolute bottom-16 left-45 right-0  animate-[var(--animate-drive)]">
        <img
          src="https://cdn-icons-png.flaticon.com/512/3774/3774278.png"
          alt="SUV"
          className="w-28"
        />
        {/* <div className="flex justify-between w-20 -mt-3">
          <div className=" w-6 h-6 bg-black rounded-full border-4 border-gray-700 animate-[var(--animate-wheel)]"></div>
          <div className="w-6 h-6 bg-black rounded-full border-4 border-gray-700 animate-[var(--animate-wheel)]"></div>
          <div className="w-6 h-6 bg-black rounded-full border-4 border-gray-700 animate-[var(--animate-wheel)]"></div>
          
        </div> */}
      </div>

     
      <div className="absolute bottom-10 w-full h-6 bg-gray-800"></div>
      <div className="absolute bottom-12 w-full border-t-4 border-dashed border-yellow-400"></div>

     
      <form className="relative z-10 w-[90%] h-[500px] max-w-[500px] bg-white/20  shadow-xl shadow-blue-900/30 flex flex-col justify-center items-center gap-[20px] px-[20px] rounded-2xl">
        <h1 className={`${isNight?"text-white":"text-black"} text-[30px] font-semibold font-serif  text-center`}>
          Sign In To{" "}
          <span className={`${isNight ? "text-yellow-300" : "text-blue-600"}`}>Rathod Cabs And Travels</span>
        </h1>

        <input
          type="email"
          placeholder="Email"
          className={`w-full h-[60px] outline-0 border-2 border-white bg-transparent text-black ${isNight?"placeholder-white":"placeholder-black"} px-[20px] py-[10px] rounded-full text-[15px]`}
        />

        <div className="w-full h-[60px] relative">
          <input
            type={showpassword ? "text" : "password"}
            placeholder="Password"
            className={`w-full h-full outline-0 border-2 border-white bg-transparent text-black ${isNight?"placeholder-white":"placeholder-black"} px-[20px] py-[10px] rounded-full text-[15px]`}
          />

          {showpassword ? (
            <IoEyeOff
              className="absolute bottom-[16px] right-[40px] text-white w-[25px] h-[25px] cursor-pointer"
              onClick={() => setshowpassword(false)}
            />
          ) : (
            <IoEye
              className="absolute bottom-[16px] right-[40px] text-white w-[25px] h-[25px] cursor-pointer"
              onClick={() => setshowpassword(true)}
            />
          )}
        </div>

        <button
          type="button"
          className=" absolute bottom-[10px] min-w-[130px] h-[50px] bg-white rounded-full mt-[20px] text-[19px] font-bold "
        >
          Sign In
        </button>

        <p
          className={`${isNight?"text-white":"text-black"} cursor-pointer`}
          onClick={() => navigate("/signup")}
        >
          Want to create a new account?{" "}
          <span className={`${isNight?"text-yellow-300":"text-blue-600"} font-semibold`}>Sign Up</span>
        </p>
      </form>
    </div>
  );
};

export default Signin;
