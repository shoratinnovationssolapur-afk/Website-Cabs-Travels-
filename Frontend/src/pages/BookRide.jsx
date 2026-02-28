import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  ShieldCheck,
  ChevronLeft,
  MapPin,
} from "lucide-react";
import { getAuth } from "firebase/auth";
import LocationInputs from "../components/pickupanddrop";
import RouteFare from "../components/RouteFare"; 
import { autoAssignDriver } from "../utils/autoAssignDriver";

const auth = getAuth();

const BookRide = () => {
  const navigate = useNavigate();

  // ROUTE
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [dateTime, setDateTime] = useState("");

  // LOADING STATE
  const [loading, setLoading] = useState(false);

  // TRIP (Strictly within city)
  const tripType = "city";

  // PASSENGERS
  const [passengers, setPassengers] = useState([
    { name: "", age: "", phone: "", dateTime: "", type: "Adult" },
  ]);

  // BOOKING STATUS
  const [bookingId, setBookingId] = useState(null);
  const [rideStatus, setRideStatus] = useState(null);

  // DISTANCE & FARE
  const [routeFare, setRouteFare] = useState(0);
  const [distance, setDistance] = useState(0);

  // PASSENGER LOGIC
  const updatePassenger = (i, field, value) => {
    const updated = [...passengers];
    updated[i][field] = value;
    setPassengers(updated);

    if (i === 0 && field === "dateTime") {
      setDateTime(value);
    }
  };

  const addPassenger = () => {
    setPassengers([
      ...passengers,
      { name: "", age: "", phone: "", dateTime: "", type: "Adult" },
    ]);
  };

  const handleFareUpdate = ({ distance, fare }) => {
    setDistance(distance);
    setRouteFare(fare);
  };

  // TOTAL COST LOGIC (Using a fixed base rate for City rides)
  const baseFare = 50; // Standard base fare for city rides
  const totalAmount = routeFare + baseFare;

const handleFinalBooking = async () => {
    try {
      if (pickup.trim().toLowerCase() === drop.trim().toLowerCase()) {
        alert("Pickup and Drop locations cannot be the same.");
        return;
      }

      if (!auth.currentUser) return alert("Please login first");
      if (!pickup || !drop) return alert("Please enter route");

      // VALIDATION LOGIC
      for (let i = 0; i < passengers.length; i++) {
        const p = passengers[i];
        const passengerNum = i + 1;

        if (!p.name.trim()) {
          alert(`Please enter a name for Passenger ${passengerNum}`);
          return;
        }

        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(p.phone)) {
          alert(`Passenger ${passengerNum}: Valid 10-digit phone required.`);
          return;
        }

        const ageNum = parseInt(p.age);
        if (isNaN(ageNum) || ageNum <= 0 || ageNum > 110) {
          alert(`Passenger ${passengerNum}: Valid age required.`);
          return;
        }
        
        if (!p.dateTime) {
          alert(`Passenger ${passengerNum}: Select date/time.`);
          return;
        }
      }

      const primaryPassenger = passengers[0];
      const bookingData = {
        pickup,
        drop,
        dateTime,
        name: primaryPassenger.name || "N/A",
        phone: primaryPassenger.phone || "N/A",
        passengers: passengers,
        bookingMethod: "quick_booking", 
        status: "pending",
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email || "N/A", // Added for admin reference
        createdAt: serverTimestamp(),
        tripType,
        distance,
        totalFare: totalAmount,
        // EXPLICIT NULLS so your driver logic doesn't crash
        driverId: null,      
        driverName: null,    
        vehicleId: "city_ride" // Generic ID for city rides
      };

      // 1. Create the booking
      const bookingRef = await addDoc(collection(db, "bookings"), bookingData);
      const id = bookingRef.id;
      setBookingId(id);

      // 2. REMOVED autoAssignDriver(id);
      // Now it stays 'pending' until the admin assigns it.

      alert("Booking Request Sent! An admin will assign a driver soon.");
      navigate("/user/booking-success", { state: { bookingId: id } });

    } catch (err) {
      console.error("Booking Error:", err);
      alert(err.message);
    }
  };

  useEffect(() => {
    if (!bookingId) return;
    const unsub = onSnapshot(doc(db, "bookings", bookingId), (snap) => {
      if (snap.exists()) setRideStatus(snap.data().status);
    });
    return () => unsub();
  }, [bookingId]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* HEADER (No Vehicle Image) */}
      <div className="relative h-[200px] bg-blue-900 flex items-center px-8">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 bg-white/20 p-2 rounded-full text-white"
        >
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-4xl font-black text-white">Book Your City Ride</h1>
      </div>

      <main className="max-w-6xl mx-auto px-6 grid lg:grid-cols-3 gap-8 -mt-10">
        <div className="lg:col-span-2 space-y-6">
          {/* ROUTE */}
          <div className="bg-white p-6 rounded-2xl shadow mt-19">
            <h3 className="font-bold text-xl mb-4 flex gap-2">
              <MapPin className="text-yellow-500" /> Route
            </h3>
            <LocationInputs
              pickup={pickup}
              setPickup={setPickup}
              drop={drop}
              setDrop={setDrop}
            />
            <RouteFare
              pickup={pickup}
              drop={drop}
              dateTime={dateTime}
              onFareCalculated={handleFareUpdate}
            />
          </div>

          {/* PASSENGERS */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h3 className="font-bold mb-3">Passenger List</h3>
            {passengers.map((p, i) => (
              <div key={i} className="grid md:grid-cols-4 gap-3 mb-2 border-b pb-4 last:border-0">
                <input
                  placeholder="Name"
                  value={p.name}
                  onChange={(e) => updatePassenger(i, "name", e.target.value)}
                  className="border p-2 rounded"
                />
                <input
                  placeholder="Phone"
                  value={p.phone}
                  onChange={(e) => updatePassenger(i, "phone", e.target.value)}
                  className="border p-2 rounded"
                />
                <input
                  type="number"
                  placeholder="Age"
                  value={p.age}
                  onChange={(e) => updatePassenger(i, "age", e.target.value)}
                  className="border p-2 rounded"
                />
                <select
                  value={p.type}
                  onChange={(e) => updatePassenger(i, "type", e.target.value)}
                  className="border p-2 rounded"
                >
                  <option>Adult</option>
                  <option>Child</option>
                </select>
                <input
                  type="datetime-local"
                  value={p.dateTime}
                  onChange={(e) => updatePassenger(i, "dateTime", e.target.value)}
                  className="border p-3 rounded-lg md:col-span-4 mt-2"
                />
              </div>
            ))}
            <button
              onClick={addPassenger}
              className="bg-yellow-400 px-4 py-2 rounded mt-2 font-bold"
            >
              + Add Passenger
            </button>
          </div>
        </div>

        {/* FARE DETAILS */}
        <div className="bg-white p-8 rounded-3xl shadow mt-20 h-fit">
          <h3 className="text-2xl font-bold mb-6">Fare Details</h3>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span>Distance</span>
              <span className="font-semibold">{distance.toFixed(1)} km</span>
            </div>
            <div className="flex justify-between">
              <span>Travel Fare</span>
              <span className="font-semibold">₹{routeFare}</span>
            </div>
            <div className="flex justify-between">
              <span>Booking Fee</span>
              <span className="font-semibold">₹{baseFare}</span>
            </div>
            <div className="border-t pt-4 flex justify-between text-2xl font-bold text-blue-900">
              <span>Total</span>
              <span>₹{totalAmount}</span>
            </div>
          </div>

          <button
            onClick={handleFinalBooking}
            className="w-full bg-yellow-400 py-4 rounded-xl font-bold shadow-lg active:scale-95 transition-transform"
          >
            CONFIRM BOOKING
          </button>

          <div className="mt-6 flex gap-2 text-sm text-gray-600">
            <ShieldCheck className="text-green-500" />
            Within-city verified travel
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookRide;