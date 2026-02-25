import { useLocation, useNavigate } from "react-router-dom";

const BookingSuccess = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-10 rounded-3xl shadow-xl text-center">

        <h1 className="text-3xl font-bold text-green-600 mb-4">
          ✅ Booking Confirmed
        </h1>

        <p className="mb-2">
          Booking ID: <b>{state?.bookingId}</b>
        </p>

        <p className="mb-6">
          Driver will contact you shortly.
        </p>

        <button
          onClick={() => navigate("/")}
          className="bg-yellow-400 px-6 py-3 rounded font-bold"
        >
          Go Home
        </button>

      </div>

    </div>
  );
};

export default BookingSuccess;