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
  IndianRupee,
  Info
} from "lucide-react";
import { getAuth } from "firebase/auth";
import LocationInputs from "../components/pickupanddrop";
import RouteFare from "../components/RouteFare"; 
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

  // DISTANCE DATA FROM ROUTEFARE
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

  // ================= DYNAMIC PRICING LOGIC =================
  const isVendorRental = vehicle?.vendorListingId !== undefined || (vehicle?.price !== undefined && vehicle?.pricePerKm === undefined);
  const dailyRate = isVendorRental ? parseInt(vehicle?.price || 0) : 0;
  const ratePerKm = !isVendorRental ? parseInt(vehicle?.pricePerKm || 0) : 0;
  const baseServiceFee = 20;

  // Total Calculation Logic
  const calculateTotal = () => {
    if (isVendorRental) {
      // RENTAL LOGIC: Flat Daily Rate * Days
      return dailyRate * days;
    } else {
      // TAXI LOGIC: (Distance * Rate) + Base
      const perDayTripFare = routeFare + baseServiceFee;
      return tripType === "outstation" ? perDayTripFare * days : perDayTripFare;
    }
  };

  const totalAmount = calculateTotal();

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
  const handleFareUpdate = ({ distance, fare }) => {
    setDistance(distance);
    setRouteFare(fare);
  };

  // ================= CREATE BOOKING =================
  const handleFinalBooking = async () => {
    try {
      if (pickup.trim().toLowerCase() === drop.trim().toLowerCase()) {
        alert("Pickup and Drop locations cannot be the same.");
        return;
      }

      if (!auth.currentUser) return alert("Please login first");
      if (!pickup || !drop) return alert("Please enter route");

      for (let i = 0; i < passengers.length; i++) {
        const p = passengers[i];
        if (!p.name.trim()) {
          alert(`Please enter a name for Passenger ${i + 1}`);
          return;
        }
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(p.phone)) {
          alert(`Passenger ${i + 1}: Please enter a valid 10-digit phone number.`);
          return;
        }
        if (!p.dateTime) {
          alert(`Passenger ${i + 1}: Please select a date and time.`);
          return;
        }
      }

      const primaryPassenger = passengers[0];
      const bookingData = {
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        pickup,
        drop,
        dateTime,
        name: primaryPassenger.name || "N/A",
        phone: primaryPassenger.phone || "N/A",
        passengers: passengers,
        bookingMethod: isVendorRental ? "vendor_rental" : "car_specific",
        status: "pending",
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        tripType,
        durationDays: days,
        distance,
        totalFare: totalAmount,
      };

      const bookingRef = await addDoc(collection(db, "bookings"), bookingData);
      setBookingId(bookingRef.id);

      alert("Booking Created Successfully");
      navigate("/user/booking-success", { state: { bookingId: bookingRef.id } });

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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* HERO */}
      <div className="relative h-[420px] bg-black">
        <img
          src={vehicle?.imageUrl}
          alt={vehicle?.name}
          className="w-full h-full object-cover opacity-80"
        />
        <button onClick={() => navigate(-1)} className="absolute top-6 left-6 bg-white/20 p-2 rounded-full text-white">
          <ChevronLeft size={28} />
        </button>
        <div className="absolute bottom-10 left-8 text-white">
          <h1 className="text-5xl font-black">{vehicle?.name}</h1>
          <p className="text-yellow-400 font-bold text-2xl">
            {isVendorRental ? `₹${dailyRate} / Day` : `₹${ratePerKm} / km`}
          </p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 grid lg:grid-cols-3 gap-8 -mt-10">
        <div className="lg:col-span-2 space-y-6">
          {/* ROUTE */}
          <div className="bg-white p-6 mt-20 rounded-2xl shadow">
            <h3 className="font-bold text-xl mb-4 flex gap-2">
              <MapPin className="text-yellow-500" /> Route
            </h3>
            <LocationInputs pickup={pickup} setPickup={setPickup} drop={drop} setDrop={setDrop} />
            <RouteFare pickup={pickup} drop={drop} dateTime={dateTime} onFareCalculated={handleFareUpdate} />
          </div>

          {/* TRIP TYPE (Only relevant for system cars) */}
          {!isVendorRental && (
            <div className="bg-white p-6 rounded-2xl shadow">
              <h3 className="font-bold mb-3">Trip Type</h3>
              <div className="flex gap-4">
                <button onClick={() => setTripType("city")} className={`px-6 py-3 rounded-xl border ${tripType === "city" ? "bg-yellow-400" : "bg-white border-gray-300"}`}>🏙️ City</button>
                <button onClick={() => setTripType("outstation")} className={`px-6 py-3 rounded-xl border ${tripType === "outstation" ? "bg-yellow-400" : "bg-white border-gray-300"}`}>🚗 Outstation</button>
              </div>
            </div>
          )}

          {/* DURATION */}
          {(tripType === "outstation" || isVendorRental) && (
            <div className="bg-white p-6 rounded-2xl shadow flex justify-between items-center">
              <div>
                <h3 className="font-bold">{isVendorRental ? "Rental Duration" : "Trip Duration"}</h3>
                <p>{days} Days</p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setDays(Math.max(1, days - 1))} className="p-2 bg-gray-100 rounded-lg"><Minus /></button>
                <button onClick={() => setDays(days + 1)} className="p-2 bg-gray-100 rounded-lg"><Plus /></button>
              </div>
            </div>
          )}

          {/* PASSENGERS */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h3 className="font-bold mb-3">Passenger List</h3>
            {passengers.map((p, i) => (
              <div key={i} className="grid md:grid-cols-4 gap-3 mb-4 border-b pb-4 last:border-0">
                <input placeholder="Name" value={p.name} onChange={(e) => updatePassenger(i, "name", e.target.value)} className="border p-2 rounded" />
                <input placeholder="Phone" value={p.phone} onChange={(e) => updatePassenger(i, "phone", e.target.value)} className="border p-2 rounded" />
                <input type="number" placeholder="Age" value={p.age} onChange={(e) => updatePassenger(i, "age", e.target.value)} className="border p-2 rounded" />
                <select value={p.type} onChange={(e) => updatePassenger(i, "type", e.target.value)} className="border p-2 rounded">
                  <option>Adult</option>
                  <option>Child</option>
                </select>
                <input type="datetime-local" value={p.dateTime} onChange={(e) => updatePassenger(i, "dateTime", e.target.value)} className="border p-2 rounded md:col-span-4" />
              </div>
            ))}
            <button onClick={addPassenger} className="bg-yellow-400 px-4 py-2 rounded mt-2 font-bold">+ Add Passenger</button>
          </div>
        </div>

        {/* RIGHT — DYNAMIC FARE SIDEBAR */}
        <div className="bg-white p-8 mt-20 rounded-3xl shadow sticky top-20 h-fit">
          <h3 className="text-2xl font-bold mb-6">Fare Details</h3>
          
          <div className="space-y-3">
            {isVendorRental ? (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Daily Rental Rate</span>
                  <span className="font-bold">₹{dailyRate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Days</span>
                  <span className="font-bold">x {days}</span>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-700 flex gap-2">
                  <Info size={14} className="flex-shrink-0" />
                  Flat rate rental. Distance ({distance.toFixed(1)} km) is for route info only.
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between text-gray-600">
                  <span>Distance</span>
                  <span>{distance ? distance.toFixed(1) : 0} km</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Rate per km</span>
                  <span>₹{ratePerKm}</span>
                </div>
<div className="flex justify-between items-center text-gray-600">
          <span>Rate per km + Base Service Fee</span>
          <span className="font-bold">₹{ratePerKm+baseServiceFee}</span>
        </div>
                <div className="flex justify-between text-gray-600">
                  <span>Distance Fare</span>
                  <span>₹{routeFare}</span>
                </div>
                <div className="flex justify-between text-gray-600 border-b pb-2">
                  <span>Base Service Fee</span>
                  <span>₹{baseServiceFee}</span>
                </div>
                {tripType === "outstation" && (
                  <div className="flex justify-between text-blue-600 font-bold">
                    <span>Outstation Multiplier</span>
                    <span>x {days} Days</span>
                  </div>
                )}
              </>
            )}

            <div className="border-t pt-4 flex justify-between text-3xl font-black text-slate-800">
              <span>Total</span>
              <span>₹{totalAmount}</span>
            </div>
          </div>

          <button onClick={handleFinalBooking} className="w-full bg-yellow-400 py-4 rounded-xl font-bold mt-6 hover:bg-yellow-500 transition">
            CONFIRM BOOKING
          </button>

          <div className="mt-6 flex gap-2 text-sm text-gray-600">
            <ShieldCheck className="text-green-500" /> Verified professional service
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookingDetails;