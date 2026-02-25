import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Loader2,
  Minus,
  Plus,
  CheckCircle,
  ShieldCheck,
  ChevronLeft,
  MapPin,
} from "lucide-react";
import { getAuth } from "firebase/auth";
import LocationInputs from "../components/pickupanddrop";
import RouteFare from "../components/RouteFare";   // ⭐ ADD
import { autoAssignDriver } from "../utils/autoAssignDriver";

const auth = getAuth();

const BookingDetails = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // ROUTE
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [dateTime, setDateTime] = useState("");

  // VEHICLE
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  // TRIP
  const [tripType, setTripType] = useState("city");
  const [days, setDays] = useState(1);

  // PASSENGERS
  const [passengers, setPassengers] = useState([
    { name: "", age: "", phone: "", dateTime: "", type: "Adult" },
  ]);

  // BOOKING STATUS
  const [bookingId, setBookingId] = useState(null);
  const [rideStatus, setRideStatus] = useState(null);

  // ⭐ DISTANCE DATA FROM ROUTEFARE
  const [routeFare, setRouteFare] = useState(0);
  const [distance, setDistance] = useState(0);

  const vehicleId = searchParams.get("vehicle_id");

  // ================= FETCH VEHICLE =================
  useEffect(() => {
    const fetchVehicle = async () => {
      if (!vehicleId) return;

      const snap = await getDoc(doc(db, "vehicles", vehicleId));
      if (snap.exists()) {
        setVehicle({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    };

    fetchVehicle();
  }, [vehicleId]);

  // ================= PASSENGERS =================
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

  // ================= RECEIVE DISTANCE FROM ROUTEFARE =================
  const handleFareUpdate = ({ distance, fare,dateTime }) => {
    setDistance(distance);
    setRouteFare(fare);
    setDateTime(dateTime);
   
  };

  // ================= TOTAL COST =================
  const baseFare = 200; // minimum charge

  const totalAmount =
    tripType === "outstation"
      ? (routeFare + baseFare) * days
      : routeFare + baseFare;

  // ================= CREATE BOOKING =================
  const handleFinalBooking = async () => {
    try {
      if (!auth.currentUser) return alert("Please login first");

      if (!pickup || !drop) {
        alert("Please enter route");
        return;
      }

      const bookingRef = await addDoc(collection(db, "bookings"), {
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        pickup,
        drop,
        dateTime,
        tripType,
        durationDays: tripType === "outstation" ? days : 1,
        distance,
        totalFare: totalAmount,
        passengers,
        status: "pending",
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });

      const id = bookingRef.id;
      setBookingId(id);

      await autoAssignDriver(id);

      alert("Booking Created Successfully");

      navigate("/booking-success", {
        state: { bookingId: id },
      });

    } catch (err) {
      alert(err.message);
    }
  };

  // ================= REALTIME STATUS =================
  useEffect(() => {
    if (!bookingId) return;

    const unsub = onSnapshot(doc(db, "bookings", bookingId), (snap) => {
      if (snap.exists()) setRideStatus(snap.data().status);
    });

    return () => unsub();
  }, [bookingId]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-yellow-500" size={48} />
      </div>
    );

  // ================= UI =================
  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* HERO */}
      <div className="relative h-[420px] bg-black">
        <img
          src={vehicle?.imageUrl}
          alt={vehicle?.name}
          className="w-full h-full object-cover opacity-80"
        />

        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 bg-white/20 p-2 rounded-full text-white"
        >
          <ChevronLeft size={28} />
        </button>

        <div className="absolute bottom-10 left-8 text-white">
          <h1 className="text-5xl font-black">{vehicle?.name}</h1>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 grid lg:grid-cols-3 gap-8 -mt-10">

        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">

          {/* ROUTE */}
          <div className="bg-white p-6 mt-20 rounded-2xl shadow">
            <h3 className="font-bold text-xl mb-4 flex gap-2">
              <MapPin className="text-yellow-500" /> Route
            </h3>

            <LocationInputs
              pickup={pickup}
              setPickup={setPickup}
              drop={drop}
              setDrop={setDrop}
            />

            {/* ⭐ ROUTE FARE COMPONENT */}
            <RouteFare
              pickup={pickup}
              drop={drop}
              dateTime={dateTime}
              onFareCalculated={handleFareUpdate}
            />
          </div>

          {/* TRIP TYPE */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h3 className="font-bold mb-3">Trip Type</h3>

            <div className="flex gap-4">
              <button
                onClick={() => setTripType("city")}
                className={`px-6 py-3 rounded-xl border ${tripType === "city"
                  ? "bg-yellow-400"
                  : "bg-white border-gray-300"
                  }`}
              >
                🏙️ City
              </button>

              <button
                onClick={() => setTripType("outstation")}
                className={`px-6 py-3 rounded-xl border ${tripType === "outstation"
                  ? "bg-yellow-400"
                  : "bg-white border-gray-300"
                  }`}
              >
                🚗 Outstation
              </button>
            </div>
          </div>

          {/* DURATION */}
          {tripType === "outstation" && (
            <div className="bg-white p-6 rounded-2xl shadow flex justify-between">
              <div>
                <h3 className="font-bold">Trip Duration</h3>
                <p>{days} Days</p>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setDays(Math.max(1, days - 1))}>
                  <Minus />
                </button>
                <button onClick={() => setDays(days + 1)}>
                  <Plus />
                </button>
              </div>
            </div>
          )}

          {/* PASSENGERS */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h3 className="font-bold mb-3">Passenger List</h3>

            {passengers.map((p, i) => (
              <div key={i} className="grid md:grid-cols-4 gap-3 mb-2">
                <input
                  placeholder="Name"
                  value={p.name}
                  onChange={(e) =>
                    updatePassenger(i, "name", e.target.value)
                  }
                  className="border p-2 rounded"
                />

                <input
                  placeholder="Phone"
                  value={p.phone}
                  onChange={(e) =>
                    updatePassenger(i, "phone", e.target.value)
                  }
                  className="border p-2 rounded"
                />

                <input
                  type="number"
                  placeholder="Age"
                  value={p.age}
                  onChange={(e) =>
                    updatePassenger(i, "age", e.target.value)
                  }
                  className="border p-2 rounded"
                />


                <select
                  value={p.type}
                  onChange={(e) =>
                    updatePassenger(i, "type", e.target.value)
                  }
                  className="border p-2 rounded"
                >
                  <option>Adult</option>
                  <option>Child</option>
                </select>

                <input
                  type="datetime-local"
                  value={p.dateTime}
                  onChange={(e) => updatePassenger(i, "dateTime", e.target.value)}
                  className="border p-3 rounded-lg md:col-span-4"
                />

              </div>
            ))}

            <button
              onClick={addPassenger}
              className="bg-yellow-400 px-4 py-2 rounded mt-2"
            >
              + Add Passenger
            </button>
          </div>
        </div>

        {/* RIGHT — FARE */}
        <div className="bg-white p-8 mt-20 rounded-3xl shadow sticky top-20">

          <h3 className="text-2xl font-bold mb-6">Fare Details</h3>

          <div className="flex justify-between mb-3">
            <span>Distance</span>
            <span>{distance ? distance.toFixed(1) : 0} km</span>
          </div>

          <div className="flex justify-between mb-3">
            <span>Distance Fare</span>
            <span>₹{routeFare}</span>
          </div>

          <div className="flex justify-between mb-3">
            <span>Base Fare</span>
            <span>₹{baseFare}</span>
          </div>

          {tripType === "outstation" && (
            <div className="flex justify-between mb-3">
              <span>Days</span>
              <span>x {days}</span>
            </div>
          )}

          <div className="border-t pt-4 flex justify-between text-2xl font-bold">
            <span>Total</span>
            <span>₹{totalAmount}</span>
          </div>

          <div className="flex justify-between mb-3">
            <span>Trip</span>
            <span>{tripType}</span>
          </div>

          {/* <div className="border-t pt-4 flex justify-between text-2xl font-bold">
            <span>Total</span>
            <span>₹{totalAmount.toFixed(0)}</span>
          </div> */}

          {rideStatus && (
            <div className="mt-4 p-3 bg-blue-50 rounded">
              Status: {rideStatus}
            </div>
          )}

          <button
            onClick={handleFinalBooking}
            className="w-full bg-yellow-400 py-4 rounded-xl font-bold mt-6"
          >
            CONFIRM BOOKING
          </button>

          <div className="mt-6 flex gap-2 text-sm text-gray-600">
            <ShieldCheck className="text-green-500" />
            Verified drivers & safe travel
          </div>
        </div>

      </main>
    </div>
  );
};

export default BookingDetails;