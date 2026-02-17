import { useState } from "react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

const LoginModal = ({ closeModal }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmation, setConfirmation] = useState(null);

  // Send OTP
  const sendOTP = async () => {
    try {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        { size: "invisible" }
      );

      const result = await signInWithPhoneNumber(
        auth,
        "+91" + phone,
        window.recaptchaVerifier
      );

      setConfirmation(result);
      alert("OTP Sent");
    } catch (error) {
      alert(error.message);
    }
  };

  // Verify OTP
  const verifyOTP = async () => {
    try {
      const userCred = await confirmation.confirm(otp);

      if (isRegister) {
        await setDoc(doc(db, "users", userCred.user.uid), {
          name,
          phone,
          createdAt: new Date()
        });
      }

      alert("Login Successful");
      closeModal();
    } catch {
      alert("Invalid OTP");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl w-[900px] flex overflow-hidden shadow-2xl relative">

        {/* LEFT PROMO PANEL */}
        <div className="w-2/5 bg-blue-900 text-white p-8 space-y-6">
          <h2 className="text-2xl font-bold">
            Sign up now to travel smarter
          </h2>

          <p>🚖 Flat 10% OFF on airport cabs</p>
          <p>⏰ Schedule in advance</p>
          <p>💳 Pay only 20% now</p>
        </div>

        {/* RIGHT FORM PANEL */}
        <div className="w-3/5 p-8 relative">

          {!isRegister ? (
            <>
              <h3 className="text-xl font-semibold mb-4">
                Login with Phone
              </h3>

              <input
                type="tel"
                placeholder="Enter Mobile Number"
                className="w-full border p-3 rounded mb-4"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              {!confirmation ? (
                <button
                  onClick={sendOTP}
                  className="w-full bg-blue-900 text-white py-3 rounded font-semibold"
                >
                  Continue
                </button>
              ) : (
                <>
                  <input
                    placeholder="Enter OTP"
                    className="w-full border p-3 rounded mt-3 mb-3"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />

                  <button
                    onClick={verifyOTP}
                    className="w-full bg-green-600 text-white py-3 rounded font-semibold"
                  >
                    Verify OTP
                  </button>
                </>
              )}

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
                type="tel"
                placeholder="Mobile Number"
                className="w-full border p-3 rounded mb-4"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              {!confirmation ? (
                <button
                  onClick={sendOTP}
                  className="w-full bg-blue-900 text-white py-3 rounded font-semibold"
                >
                  Send OTP
                </button>
              ) : (
                <>
                  <input
                    placeholder="Enter OTP"
                    className="w-full border p-3 rounded mt-3 mb-3"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />

                  <button
                    onClick={verifyOTP}
                    className="w-full bg-green-600 text-white py-3 rounded font-semibold"
                  >
                    Create Account
                  </button>
                </>
              )}

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

          <div id="recaptcha-container"></div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
