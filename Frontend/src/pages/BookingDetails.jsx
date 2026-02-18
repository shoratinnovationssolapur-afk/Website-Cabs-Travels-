import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useSearchParams } from "react-router-dom";

const BookingDetails = () => {
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  const [searchParams] = useSearchParams();
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

  // 🔹 Loading state
  if (loading) {
    return (
      <div className="p-10 text-center text-xl">
        Loading vehicle details...
      </div>
    );
  }

  // 🔹 No vehicle found
  if (!vehicle) {
    return (
      <div className="p-10 text-center text-xl text-red-600">
        Vehicle not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center items-center">

      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-2xl w-full">

        {/* Vehicle Image */}
        <img
          src={vehicle.imageUrl}
          alt={vehicle.name}
          className="w-full h-72 object-cover rounded-lg mb-6"
        />

        {/* Vehicle Info */}
        <h2 className="text-3xl font-bold mb-2">
          {vehicle.name}
        </h2>

        <p className="text-gray-600 mb-4">
          {vehicle.desc}
        </p>

        <div className="flex justify-between items-center text-lg font-semibold mb-4">

          <span>🚗 Type: {vehicle.type}</span>

          {vehicle.pricePerKm && (
            <span className="text-green-600">
              ₹ {vehicle.pricePerKm}/km
            </span>
          )}

        </div>

        {/* Availability */}
        <div className="mb-6">
          {vehicle.available === false ? (
            <span className="text-red-600 font-bold">
              ❌ Not Available
            </span>
          ) : (
            <span className="text-green-600 font-bold">
              ✅ Available Now
            </span>
          )}
        </div>

        {/* Book Button */}
        <button
          onClick={() =>
            window.location.href = `/ ?vehicle_id=${vehicle.id}#booking`
          }
          className="w-full bg-yellow-500 text-white py-3 rounded-lg font-bold hover:bg-yellow-600 transition"
        >
          Proceed to Booking
        </button>

      </div>

    </div>
  );
};

export default BookingDetails;
