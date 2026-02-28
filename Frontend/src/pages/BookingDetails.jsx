import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Loader2,
  Minus,
  Plus,
  ShieldCheck,
  ChevronLeft,
  MapPin,
} from "lucide-react";
import { getAuth } from "firebase/auth";
import LocationInputs from "../components/pickupanddrop";
import RouteFare from "../components/RouteFare";
import { autoAssignDriver } from "../utils/autoAssignDriver";

const auth = getAuth();

const BookingDetails = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // ROUTE & VEHICLE STATE
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  // TRIP SETTINGS
  const [tripType, setTripType] = useState("city");
  const [days, setDays] = useState(1);
  const [passengers, setPassengers] = useState([
    { name: "", age: "", phone: "", dateTime: "", type: "Adult" },
  ]);

  // BOOKING & FARE
  const [bookingId, setBookingId] = useState(null);
  const [rideStatus, setRideStatus] = useState(null);
  const [routeFare, setRouteFare] = useState(0);
  const [distance, setDistance] = useState(0);

  const vehicleId = searchParams.get("vehicle_id");

  // Fetch Vehicle Details
  useEffect(() => {
    const fetchVehicle = async () => {
      if (!vehicleId) return;
      try {
        const snap = await getDoc(doc(db, "vehicles", vehicleId));
        if (snap.exists()) {
          setVehicle({ id: snap.id, ...snap.data() });
        }
      } catch (error) {
        console.error("Error fetching vehicle:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [vehicleId]);

  // Real-time Booking Status Listener
  useEffect(() => {
    if (!bookingId) return;
    const unsub = onSnapshot(doc(db, "bookings", bookingId), (snap) => {
      if (snap.exists()) setRideStatus(snap.data().status);
    });
    return () => unsub();
  }, [bookingId]);

  // Passenger Handlers
  const updatePassenger = (i, field, value) => {
    const updated = [...passengers];
    updated[i][field] = value;
    setPassengers(updated);

    // Sync primary passenger's time to global state
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

  // Pricing Logic
  const pricePerKm = vehicle?.pricePerKm || 0;
  const baseCharge = 20;
  const baseFare = vehicle?.pricePerKm ? parseInt(vehicle.pricePerKm) + baseCharge : baseCharge;

  const totalAmount = tripType === "outstation" 
    ? (routeFare + baseFare) * days 
    : routeFare + baseFare;

  // Final Booking Logic
  const handleFinalBooking = async () => {
    try {
      if (!auth.currentUser) return alert("Please login first");
      if (!pickup || !drop) return alert("Please enter route");
      if (distance === 0) return alert("Please wait for the route distance to be calculated.");
      
      if (pickup.trim().toLowerCase() === drop.trim().toLowerCase()) {
        return alert("Pickup and Drop locations cannot be the same.");
      }

      // Passenger Validations
      for (let i = 0; i < passengers.length; i++) {
        const p = passengers[i];
        if (!p.name.trim()) return alert(`Enter name for Passenger ${i + 1}`);
        if (!/^[6-9]\d{9}$/.test(p.phone)) return alert(`Enter valid phone for Passenger ${i + 1}`);
        if (!p.dateTime) return alert(`Select date/time for Passenger ${i + 1}`);
      }

      // 1. Find Available Driver
      const driversRef = collection(db, "drivers");
      const q = query(
        driversRef,
        where("available", "==", true),
        where("onTrip", "==", false),
        where("status", "==", "active")
      );

      const driverSnap = await getDocs(q);
      if (driverSnap.empty) {
        return alert("No drivers available. Please try again shortly.");
      }
      const availableDriverId = driverSnap.docs[0].id;

      // 2. Prepare Data
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
        bookingMethod: "car_specific",
        status: "pending",
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        tripType,
        durationDays: tripType === "outstation" ? days : 1,
        distance: Number(distance),
        totalFare: Number(totalAmount),
      };

      // 3. Create Booking & Assign Driver
      const bookingRef = await addDoc(collection(db, "bookings"), bookingData);
      const newId = bookingRef.id;
      setBookingId(newId);

      await autoAssignDriver(newId, availableDriverId);

      alert("Booking Created Successfully");
      navigate("/user/booking-success", { state: { bookingId: newId } });

    } catch (err) {
      console.error("Booking Error:", err);
      alert(err.message);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-yellow-500" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="relative h-[420px] bg-black">
        <img src={vehicle?.imageUrl} alt={vehicle?.name} className="w-full h-full object-cover opacity-80" />
        <button onClick={() => navigate(-1)} className="absolute top-6 left-6 bg-white/20 p-2 rounded-full text-white">
          <ChevronLeft size={28} />
        </button>
        <div className="absolute bottom-10 left-8 text-white">
          <h1 className="text-5xl font-black">{vehicle?.name}</h1>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 grid lg:grid-cols-3 gap-8 -mt-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 mt-20 rounded-2xl shadow">
            <h3 className="font-bold text-xl mb-4 flex gap-2"><MapPin className="text-yellow-500" /> Route</h3>
            <LocationInputs pickup={pickup} setPickup={setPickup} drop={drop} setDrop={setDrop} />
            <RouteFare pickup={pickup} drop={drop} dateTime={dateTime} onFareCalculated={handleFareUpdate} />
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <h3 className="font-bold mb-3">Trip Type</h3>
            <div className="flex gap-4">
              <button onClick={() => setTripType("city")} className={`px-6 py-3 rounded-xl border ${tripType === "city" ? "bg-yellow-400" : "bg-white border-gray-300"}`}>🏙️ City</button>
              <button onClick={() => setTripType("outstation")} className={`px-6 py-3 rounded-xl border ${tripType === "outstation" ? "bg-yellow-400" : "bg-white border-gray-300"}`}>🚗 Outstation</button>
            </div>
          </div>

          {tripType === "outstation" && (
            <div className="bg-white p-6 rounded-2xl shadow flex justify-between">
              <div><h3 className="font-bold">Trip Duration</h3><p>{days} Days</p></div>
              <div className="flex gap-4">
                <button onClick={() => setDays(Math.max(1, days - 1))}><Minus /></button>
                <button onClick={() => setDays(days + 1)}><Plus /></button>
              </div>
            </div>
          )}

          <div className="bg-white p-6 rounded-2xl shadow">
            <h3 className="font-bold mb-3">Passenger List</h3>
            {passengers.map((p, i) => (
              <div key={i} className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 p-4 border rounded-xl">
                <input placeholder="Name" value={p.name} onChange={(e) => updatePassenger(i, "name", e.target.value)} className="border p-2 rounded" />
                <input placeholder="Phone" value={p.phone} onChange={(e) => updatePassenger(i, "phone", e.target.value)} className="border p-2 rounded" />
                <input type="number" placeholder="Age" value={p.age} onChange={(e) => updatePassenger(i, "age", e.target.value)} className="border p-2 rounded" />
                <select value={p.type} onChange={(e) => updatePassenger(i, "type", e.target.value)} className="border p-2 rounded">
                  <option>Adult</option><option>Child</option>
                </select>
                <input type="datetime-local" value={p.dateTime} onChange={(e) => updatePassenger(i, "dateTime", e.target.value)} className="border p-2 rounded md:col-span-2 lg:col-span-4" />
              </div>
            ))}
            <button onClick={addPassenger} className="bg-yellow-400 px-4 py-2 rounded mt-2">+ Add Passenger</button>
          </div>
        </div>

        <div className="bg-white p-8 mt-20 rounded-3xl shadow sticky top-20 h-fit">
          <h3 className="text-2xl font-bold mb-6">Fare Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between"><span>Distance</span><span>{distance ? distance.toFixed(1) : 0} km</span></div>
            <div className="flex justify-between"><span>Distance Fare</span><span>₹{routeFare}</span></div>
            <div className="flex justify-between"><span>Price Per Km</span><span>₹{pricePerKm}</span></div>
            <div className="flex justify-between border-t pt-3 font-bold text-xl"><span>Total</span><span>₹{totalAmount}</span></div>
          </div>
          <button onClick={handleFinalBooking} className="w-full bg-yellow-400 py-4 rounded-xl font-bold mt-6 hover:bg-yellow-500 transition-colors">CONFIRM BOOKING</button>
          <div className="mt-6 flex gap-2 text-sm text-gray-600"><ShieldCheck className="text-green-500" /> Verified drivers & safe travel</div>
          {rideStatus && <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-center font-semibold">Status: {rideStatus}</div>}
        </div>
      </main>
    </div>
  );
};

export default BookingDetails;