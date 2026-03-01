import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { doc, updateDoc, onSnapshot, addDoc, collection, query, where, serverTimestamp, setDoc } from "firebase/firestore";

export default function DriverDashboard() {
  const [driverInfo, setDriverInfo] = useState(null);
  const [allRides, setAllRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 1. Update clock every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  // 2. Monitor Driver Info
  // useEffect(() => {
  //   if (!auth.currentUser) return;
  //   const unsubDriver = onSnapshot(doc(db, "drivers", auth.currentUser.uid), (snap) => {
  //     if (snap.exists()) setDriverInfo(snap.data());
  //     setLoading(false);
  //   });
  //   return () => unsubDriver();
  // }, []);

  // Inside DriverDashboard useEffect
  useEffect(() => {
    if (!auth.currentUser) return;

    const driverRef = doc(db, "drivers", auth.currentUser.uid);

    const unsubDriver = onSnapshot(driverRef, (snap) => {
      if (snap.exists()) {
        setDriverInfo(snap.data());
      } else {
        // ⭐ THE FIX: If the document doesn't exist, create it using Auth data
        const initialData = {
          name: auth.currentUser.displayName || "New Driver",
          email: auth.currentUser.email || "",
          phone: auth.currentUser.phoneNumber || "",
          available: false,
          status: "active",
          createdAt: serverTimestamp()
        };
        setDoc(driverRef, initialData); // This uses the UID as the ID
      }
      setLoading(false);
    });

    return () => unsubDriver();
  }, []);



  // 3. Monitor All Rides for this Driver
  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, "bookings"),
      where("driverId", "==", auth.currentUser.uid),
      where("status", "in", ["assigned", "approved", "on_the_way"])
    );
    const unsubRides = onSnapshot(q, (snap) => {
      const ridesArray = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllRides(ridesArray);
    });
    return () => unsubRides();
  }, []);

  // 4. Live Location Tracking
  // useEffect(() => {
  //   let watchId = null;

  //   const startTracking = () => {
  //     if ("geolocation" in navigator && auth.currentUser) {
  //       watchId = navigator.geolocation.watchPosition(
  //         async (position) => {
  //           const { latitude, longitude, heading, speed } = position.coords;
  //           try {
  //             const response = await fetch(
  //               `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
  //             );
  //             const data = await response.json();
  //             const liveAddress = data.display_name || "Address not found";

  //             await updateDoc(doc(db, "drivers", auth.currentUser.uid), {
  //               lastLocation: {
  //                 lat: latitude,
  //                 lng: longitude,
  //                 address: liveAddress,
  //                 heading: heading || 0,
  //                 speed: speed || 0,
  //                 timestamp: serverTimestamp()
  //               },
  //               // Also update top-level address for easy dashboard viewing
  //               address: liveAddress 
  //             });
  //           } catch (err) {
  //             console.error("Location/Address Update Error:", err);
  //           }
  //         },
  //         (error) => console.error("Geolocation Error:", error),
  //         { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
  //       );
  //     }
  //   };

  //   const stopTracking = () => {
  //     if (watchId !== null) {
  //       navigator.geolocation.clearWatch(watchId);
  //       watchId = null;
  //     }
  //   };

  //   if (driverInfo?.available && !loading) {
  //     startTracking();
  //   } else {
  //     stopTracking();
  //   }

  //   return () => stopTracking();
  // }, [driverInfo?.available, loading]);



  useEffect(() => {
    let watchId = null;

    const startTracking = () => {
      // Only start if a user is logged in AND they are marked as 'available'
      if ("geolocation" in navigator && auth.currentUser && driverInfo?.available) {
        watchId = navigator.geolocation.watchPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
              );
              const data = await response.json();
              const liveAddress = data.display_name || "Address not found";

              await updateDoc(doc(db, "drivers", auth.currentUser.uid), {
                lastLocation: {
                  lat: latitude,
                  lng: longitude,
                  address: liveAddress,
                  timestamp: serverTimestamp()
                },
                address: liveAddress
              });
            } catch (err) {
              console.error("Tracking error:", err);
            }
          },
          (error) => console.error("GPS Error:", error),
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );
      }
    };

    const stopTracking = () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
        console.log("GPS tracking stopped.");
      }
    };

    // Logic Controller
    if (auth.currentUser && driverInfo?.available && !loading) {
      startTracking();
    } else {
      stopTracking();
    }

    // CRITICAL: Cleanup function runs on unmount OR when auth/availability changes
    return () => stopTracking();
  }, [auth.currentUser, driverInfo?.available, loading]);

  // 5. Duty Toggle Handler


  const handleDutyToggle = async () => {
    if (!auth.currentUser) return;

    // 1. Determine new status (Default to true if driverInfo is null)
    const isGoingOnline = !driverInfo?.available;
    const driverDocRef = doc(db, "drivers", auth.currentUser.uid);

    try {
      const updateData = {
        available: isGoingOnline,
        updatedAt: serverTimestamp()
      };

      if (!isGoingOnline) {
        updateData.lastLocation = null;
        updateData.address = "";
      }

      // 2. Use setDoc with { merge: true } instead of updateDoc
      // This creates the document if it's missing, or updates it if it exists.
      await setDoc(driverDocRef, updateData, { merge: true });

      console.log("Firestore sync successful for status:", isGoingOnline);
    } catch (error) {
      console.error("Critical Toggle Error:", error.message);
      alert("Database connection failed. Check your Firebase Rules.");
    }
  };

  // 6. Ride Logic & Categorization
  const nowTime = new Date();
  const oneHourFromNow = new Date(nowTime.getTime() + 60 * 60 * 1000);

  const current = allRides
    .filter(ride => {
      const rideDate = new Date(ride.dateTime);
      return ride.status === "on_the_way" || (rideDate <= oneHourFromNow && ride.status !== "completed");
    })
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

  const upcoming = allRides
    .filter(ride => {
      const rideDate = new Date(ride.dateTime);
      return ride.status !== "on_the_way" && rideDate > oneHourFromNow;
    })
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

  const updateRideStatus = async (ride, status) => {

    // Inside updateRideStatus
    const notifyUser = async (title, message) => {
      await addDoc(collection(db, "notifications"), {
        recipientId: ride.userId,
        role: "user",
        title: title,
        message: message,
        bookingId: ride.id,
        createdAt: serverTimestamp(),
        read: false
      });
    };

    if (status === "on_the_way") {
      await notifyUser("Driver is Coming!", "Your driver has started the trip and is moving toward you.");
    } else if (status === "completed") {
      await notifyUser("Trip Completed", "Hope you had a safe journey! Please rate your experience.");
    }

    const rideDate = new Date(ride.dateTime);
    const fiveMinsBefore = new Date(rideDate.getTime() - 5 * 60 * 1000);

    if (status === "on_the_way" && new Date() < fiveMinsBefore) {
      alert(`Too early! Start at ${fiveMinsBefore.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
      return;
    }

    if (status === "cancelled") {
      if (!window.confirm("Are you sure you want to cancel this trip?")) return;
    }

    try {
      if (status === "completed") {
        await addDoc(collection(db, "confirmed_bookings"), {
          driverId: auth.currentUser.uid,
          rideId: ride.id,
          pickup: ride.pickup,
          drop: ride.drop,
          totalFare: ride.totalFare || 0,
          createdAt: serverTimestamp(),
          status: "completed"
        });
        await updateDoc(doc(db, "bookings", ride.id), { status: "completed" });
      } else if (status === "cancelled") {
        await updateDoc(doc(db, "bookings", ride.id), { status: "pending", driverId: null, driverName: null });
        await updateDoc(doc(db, "drivers", auth.currentUser.uid), { onTrip: false });
      } else {
        await updateDoc(doc(db, "bookings", ride.id), { status });
      }
    } catch (error) {
      console.error("Update Error:", error);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Console...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4 bg-gray-50 min-h-screen">
      {/* Duty Toggle Card */}
      <div className={`p-6 rounded-2xl mb-8 flex justify-between items-center shadow-sm transition-colors ${driverInfo?.available ? 'bg-green-600 text-white' : 'bg-white text-gray-800 border'}`}>
        <div className="flex-1 overflow-hidden mr-4">
          <h2 className="font-black uppercase tracking-tight text-xl">
            {driverInfo?.available ? "Online" : "Offline"}
          </h2>
          <p className="text-xs opacity-90 font-bold truncate">
            {driverInfo?.available ? (driverInfo?.address || "Updating Location...") : "Visibility to Customers"}
          </p>
        </div>
        <button
          onClick={handleDutyToggle}
          className={`px-6 py-2 rounded-full font-bold transition-all shadow-md ${driverInfo?.available ? 'bg-white text-green-600' : 'bg-black text-white'} cursor-pointer`}
        >
          {driverInfo?.available ? "Go Offline" : "Go Online"}
        </button>
      </div>

      <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Current & Active Rides</h3>
      {current.length === 0 ? (
        <div className="bg-white p-10 text-center rounded-2xl border border-dashed mb-8 text-gray-400">
          No active rides.
        </div>
      ) : (
        current.map(ride => <RideCard key={ride.id} ride={ride} onUpdate={updateRideStatus} isCurrent={true} />)
      )}

      <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mt-12 mb-4">Upcoming Schedule</h3>
      {upcoming.length === 0 ? (
        <p className="text-gray-400 italic">No future bookings found.</p>
      ) : (
        upcoming.map(ride => <RideCard key={ride.id} ride={ride} onUpdate={updateRideStatus} isCurrent={false} />)
      )}
    </div>
  );
}

function RideCard({ ride, onUpdate, isCurrent }) {
  const rideDate = new Date(ride.dateTime);
  const timeStr = rideDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = rideDate.toLocaleDateString([], { day: '2-digit', month: 'short' });

  return (
    <div className={`bg-white border rounded-[2rem] p-6 mb-4 shadow-sm transition-all ${!isCurrent && 'opacity-75 grayscale-[0.5]'}`}>
      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-3 items-center">
          <div className="bg-blue-100 text-blue-700 p-3 rounded-2xl font-black text-lg">{timeStr}</div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase">{dateStr}</p>
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{ride.status}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-gray-400 uppercase">Fare</p>
          <p className="font-black text-green-600">₹{ride.totalFare?.toFixed(2)}</p>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex gap-3">
          <div className="w-1 bg-blue-500 rounded-full"></div>
          <div><p className="text-[9px] font-black text-gray-400 uppercase">Pickup</p><p className="text-sm font-bold text-gray-700">{ride.pickup}</p></div>
        </div>
        <div className="flex gap-3">
          <div className="w-1 bg-green-500 rounded-full"></div>
          <div><p className="text-[9px] font-black text-gray-400 uppercase">Dropoff</p><p className="text-sm font-bold text-gray-700">{ride.drop}</p></div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          {(ride.status === "assigned" || ride.status === "approved") && isCurrent && (
            <button onClick={() => onUpdate(ride, "on_the_way")} className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest">Start Trip</button>
          )}
          {ride.status === "on_the_way" && (
            <button onClick={() => onUpdate(ride, "completed")} className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest">Finish Trip</button>
          )}
        </div>
        {(ride.status === "assigned" || ride.status === "approved") && (
          <button onClick={() => onUpdate(ride, "cancelled")} className="w-full bg-red-50 text-red-500 py-3 rounded-2xl font-bold uppercase text-xs tracking-widest">Cancel Trip</button>
        )}
      </div>
    </div>
  );
}