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
<<<<<<< HEAD
import RouteFare from "../components/RouteFare"; 
=======
import RouteFare from "../components/RouteFare";
import { autoAssignDriver } from "../utils/autoAssignDriver";
>>>>>>> 218fedb6142d602802f65e8e2c19ebb163f1e669

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
<<<<<<< HEAD
  const baseFare = 50; 
  const totalAmount = routeFare + baseFare;
=======
  const baseFare = 50; // Standard base fare for city rides
  const travelfare= Math.round(routeFare )
  const totalAmount = Math.round(routeFare + baseFare);

  // const handleFinalBooking = async () => {
  //   try {
  //     if (pickup.trim().toLowerCase() === drop.trim().toLowerCase()) {
  //       alert("Pickup and Drop locations cannot be the same.");
  //       return;
  //     }

  //     if (!auth.currentUser) return alert("Please login first");
  //     if (!pickup || !drop) return alert("Please enter route");

  //     // VALIDATION LOGIC
  //     for (let i = 0; i < passengers.length; i++) {
  //       const p = passengers[i];
  //       const passengerNum = i + 1;

  //       if (!p.name.trim()) {
  //         alert(`Please enter a name for Passenger ${passengerNum}`);
  //         return;
  //       }

  //       const phoneRegex = /^[6-9]\d{9}$/;
  //       if (!phoneRegex.test(p.phone)) {
  //         alert(`Passenger ${passengerNum}: Valid 10-digit phone required.`);
  //         return;
  //       }

  //       const ageNum = parseInt(p.age);
  //       if (isNaN(ageNum) || ageNum <= 0 || ageNum > 110) {
  //         alert(`Passenger ${passengerNum}: Valid age required.`);
  //         return;
  //       }

  //       if (!p.dateTime) {
  //         alert(`Passenger ${passengerNum}: Select date/time.`);
  //         return;
  //       }
  //     }



  //     // Notify Admin
  //     await addDoc(collection(db, "notifications"), {
  //       recipientId: "admin",
  //       role: "admin",
  //       title: "New Booking Received",
  //       message: `New ride from ${pickup} to ${drop}`,
  //       createdAt: serverTimestamp(),
  //       read: false
  //     });

  //     // Notify Driver (If auto-assigned)
  //     if (availableDriverId) {
  //       await addDoc(collection(db, "notifications"), {
  //         recipientId: availableDriverId,
  //         role: "driver",
  //         title: "New Ride Assigned",
  //         message: "Check your dashboard for a new active ride.",
  //         bookingId: id,
  //         createdAt: serverTimestamp(),
  //         read: false
  //       });
  //     }

  //     const primaryPassenger = passengers[0];
  //     const bookingData = {
  //       pickup,
  //       drop,
  //       dateTime,
  //       name: primaryPassenger.name || "N/A",
  //       phone: primaryPassenger.phone || "N/A",
  //       passengers: passengers,
  //       bookingMethod: "quick_booking",
  //       status: "pending",
  //       userId: auth.currentUser.uid,
  //       userEmail: auth.currentUser.email || "N/A", // Added for admin reference
  //       createdAt: serverTimestamp(),
  //       tripType,
  //       distance,
  //       totalFare: totalAmount,
  //       // EXPLICIT NULLS so your driver logic doesn't crash
  //       driverId: null,
  //       driverName: null,
  //       vehicleId: "city_ride" // Generic ID for city rides
  //     };

  //     // 1. Create the booking
  //     const bookingRef = await addDoc(collection(db, "bookings"), bookingData);
  //     const id = bookingRef.id;
  //     setBookingId(id);

  //     // 2. REMOVED autoAssignDriver(id);
  //     // Now it stays 'pending' until the admin assigns it.

  //     alert("Booking Request Sent! An admin will assign a driver soon.");
  //     navigate("/user/booking-success", { state: { bookingId: id } });

  //   } catch (err) {
  //     console.error("Booking Error:", err);
  //     alert(err.message);
  //   }
  // };


>>>>>>> 218fedb6142d602802f65e8e2c19ebb163f1e669

  const handleFinalBooking = async () => {
    try {
      // 1. Basic Route Validation
      if (pickup.trim().toLowerCase() === drop.trim().toLowerCase()) {
        alert("Pickup and Drop locations cannot be the same.");
        return;
      }

      if (!auth.currentUser) return alert("Please login first");
      if (!pickup || !drop) return alert("Please enter route");

      // 2. Passenger Validation Logic
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

<<<<<<< HEAD
      setLoading(true);

=======
      // 3. Prepare Booking Data
>>>>>>> 218fedb6142d602802f65e8e2c19ebb163f1e669
      const primaryPassenger = passengers[0];
      const bookingData = {
        pickup,
        drop,
        dateTime,
        name: primaryPassenger.name,
        phone: primaryPassenger.phone,
        passengers: passengers,
<<<<<<< HEAD
        bookingMethod: "quick_booking", 
        status: "pending", // Stays pending for Admin
=======
        bookingMethod: "quick_booking",
        status: "pending", // Admin will change this later
>>>>>>> 218fedb6142d602802f65e8e2c19ebb163f1e669
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email || "N/A",
        createdAt: serverTimestamp(),
        tripType,
<<<<<<< HEAD
        distance: Number(distance.toFixed(2)),
        totalFare: Math.round(totalAmount),
        
        // MANUAL ASSIGNMENT FIELDS
        driverId: null,      // Explicitly null
        driverName: null,    // Explicitly null
=======
        distance,
        totalFare: totalAmount,
        driverId: null,      // Stays null until admin manually assigns
        driverName: null,    // Stays null until admin manually assigns
>>>>>>> 218fedb6142d602802f65e8e2c19ebb163f1e669
        vehicleId: "city_ride" 
      };

      // 4. Create the booking in Firestore
      const bookingRef = await addDoc(collection(db, "bookings"), bookingData);
      const id = bookingRef.id;
      setBookingId(id);

<<<<<<< HEAD
      alert("Booking Request Sent! An admin will review and assign a driver shortly.");
=======
      // 5. Notify Admin Only (Since no driver is assigned yet)
      await addDoc(collection(db, "notifications"), {
        recipientId: "admin",
        role: "admin",
        title: "New Booking Received",
        message: `New city ride request from ${pickup} to ${drop}`,
        bookingId: id, // Link the notification to the booking
        createdAt: serverTimestamp(),
        read: false
      });

      alert("Booking Request Sent! An admin will assign a driver soon.");
>>>>>>> 218fedb6142d602802f65e8e2c19ebb163f1e669
      navigate("/user/booking-success", { state: { bookingId: id } });

    } catch (err) {
      console.error("Booking Error:", err);
      alert("Booking failed: " + err.message);
    } finally {
      setLoading(false);
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
      <div className="relative h-[200px] bg-blue-900 flex items-center px-8">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 bg-white/20 p-2 rounded-full text-white hover:bg-white/40 transition"
        >
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-4xl font-black text-white">Book Your City Ride</h1>
      </div>

      <main className="max-w-6xl mx-auto px-6 grid lg:grid-cols-3 gap-8 -mt-10">
        <div className="lg:col-span-2 space-y-6">
          {/* ROUTE */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-20">
            <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
              <MapPin className="text-yellow-500" /> Route Details
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
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold mb-4">Passenger Details</h3>
            {passengers.map((p, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-xl mb-4 space-y-3">
                <div className="grid md:grid-cols-2 gap-3">
                  <input
                    placeholder="Full Name"
                    value={p.name}
                    onChange={(e) => updatePassenger(i, "name", e.target.value)}
                    className="border p-2 rounded-lg"
                  />
                  <input
                    placeholder="Phone Number"
                    value={p.phone}
                    onChange={(e) => updatePassenger(i, "phone", e.target.value)}
                    className="border p-2 rounded-lg"
                  />
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                  <input
                    type="number"
                    placeholder="Age"
                    value={p.age}
                    onChange={(e) => updatePassenger(i, "age", e.target.value)}
                    className="border p-2 rounded-lg"
                  />
                  <select
                    value={p.type}
                    onChange={(e) => updatePassenger(i, "type", e.target.value)}
                    className="border p-2 rounded-lg"
                  >
                    <option>Adult</option>
                    <option>Child</option>
                  </select>
                  <input
                    type="datetime-local"
                    value={p.dateTime}
                    onChange={(e) => updatePassenger(i, "dateTime", e.target.value)}
                    className="border p-2 rounded-lg"
                  />
                </div>
              </div>
            ))}
            <button
              onClick={addPassenger}
              className="text-blue-700 font-bold flex items-center gap-1 hover:underline"
            >
              + Add Another Passenger
            </button>
          </div>
        </div>

        {/* FARE DETAILS */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 mt-20 sticky top-24">
            <h3 className="text-2xl font-bold mb-6">Fare Summary</h3>
            <div className="space-y-4 text-gray-600">
              <div className="flex justify-between">
                <span>Distance</span>
                <span className="text-black font-semibold">{distance.toFixed(1)} km</span>
              </div>
              <div className="flex justify-between">
                <span>Distance Fare</span>
                <span className="text-black font-semibold">₹{routeFare}</span>
              </div>
              <div className="flex justify-between border-b pb-4">
                <span>Booking Fee</span>
                <span className="text-black font-semibold">₹{baseFare}</span>
              </div>
              <div className="flex justify-between text-2xl font-black text-blue-900 pt-2">
                <span>Total</span>
                <span>₹{Math.round(totalAmount)}</span>
              </div>
            </div>
<<<<<<< HEAD
=======
            <div className="flex justify-between">
              <span>Travel Fare</span>
              <span className="font-semibold">₹{travelfare}</span>
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
>>>>>>> 218fedb6142d602802f65e8e2c19ebb163f1e669

            <button
              onClick={handleFinalBooking}
              disabled={loading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-4 rounded-xl font-bold shadow-md mt-8 transition-all active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin mx-auto" /> : "CONFIRM BOOKING"}
            </button>

            {rideStatus && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-center font-bold">
                Booking Status: {rideStatus.toUpperCase()}
              </div>
            )}

            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
              <ShieldCheck className="text-green-500" size={18} />
              Verified City Travel Request
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookRide;