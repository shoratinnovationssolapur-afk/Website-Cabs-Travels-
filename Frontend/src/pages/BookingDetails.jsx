import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useSearchParams, useNavigate } from "react-router-dom"; // Added useNavigate

const BookingDetails = () => {
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate(); // Initialize navigate
  const vehicleId = searchParams.get("vehicle_id");

  useEffect(() => {
    const fetchVehicle = async () => {
      if (!vehicleId) {
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, "vehicles", vehicleId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setVehicle({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log("Vehicle not found");
        }
      } catch (error) {
        console.error("Error fetching vehicle:", error);
      }
      setLoading(false);
    };

    fetchVehicle();
  }, [vehicleId]);

  const handleProceed = () => {
    // Navigates back to home with the ID, and the #booking hash handles the scroll
    navigate(`/?vehicle_id=${vehicle.id}#booking`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl font-semibold animate-pulse text-gray-600">
          Loading vehicle details...
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-2xl shadow-md text-center">
          <p className="text-red-600 text-xl font-bold mb-4">Vehicle not found</p>
          <button 
            onClick={() => navigate('/')}
            className="text-blue-500 hover:underline"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center items-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-2xl w-full">
        
        {/* Vehicle Image */}
        <div className="overflow-hidden rounded-lg mb-6">
          <img
            src={vehicle.imageUrl}
            alt={vehicle.name}
            className="w-full h-72 object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Vehicle Info */}
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-3xl font-bold text-gray-800">{vehicle.name}</h2>
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded uppercase">
            {vehicle.type}
          </span>
        </div>

        <p className="text-gray-600 mb-6 leading-relaxed">
          {vehicle.desc}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6 border-y border-gray-100 py-4">
          <div>
            <p className="text-sm text-gray-500">Pricing</p>
            <p className="text-lg font-bold text-green-600">
              {vehicle.pricePerKm ? `₹ ${vehicle.pricePerKm}/km` : "Contact for Price"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Status</p>
            {vehicle.available === false ? (
              <p className="text-red-600 font-bold">❌ Not Available</p>
            ) : (
              <p className="text-green-600 font-bold">✅ Available Now</p>
            )}
          </div>
        </div>

        {/* Book Button */}
        <button
          onClick={handleProceed}
          className="w-full bg-yellow-500 text-black py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-yellow-400 hover:shadow-yellow-200/50 transition-all active:scale-95"
        >
          Proceed to Booking
        </button>

        <button 
          onClick={() => navigate(-1)}
          className="w-full mt-4 text-gray-500 font-medium hover:text-gray-800 transition"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default BookingDetails;