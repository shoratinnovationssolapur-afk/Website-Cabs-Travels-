import { useEffect, useState } from "react";
import { db, auth, rtdb } from "../firebase";
import {
  doc, updateDoc, onSnapshot, addDoc, collection,
  query, where, serverTimestamp, setDoc
} from "firebase/firestore";
import {
  ref, onValue, onDisconnect, set,
  serverTimestamp as rtdTimestamp
} from "firebase/database";

export default function DriverDashboard() {
  const [driverInfo, setDriverInfo] = useState(null);
  const [allRides, setAllRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 1. Clock Update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  // 2. Presence System (Handle Close Website)
  useEffect(() => {
    if (!auth.currentUser) return;
    const userStatusDatabaseRef = ref(rtdb, `/status/${auth.currentUser.uid}`);
    const connectedRef = ref(rtdb, ".info/connected");
    const driverDocRef = doc(db, "drivers", auth.currentUser.uid);

    const unsubPresence = onValue(connectedRef, (snapshot) => {
      if (snapshot.val() === false) return;
      onDisconnect(userStatusDatabaseRef)
        .set({ available: false, lastSeen: rtdTimestamp() })
        .then(() => {
          set(userStatusDatabaseRef, { available: true, lastSeen: rtdTimestamp() });
          if (driverInfo?.available) {
            updateDoc(driverDocRef, { available: true });
          }
        });
    });
    return () => unsubPresence();
  }, [auth.currentUser, driverInfo?.available]);




  useEffect(() => {
    // Use auth.currentUser directly
    if (!auth.currentUser || !driverInfo?.available) return;

    const driverId = auth.currentUser.uid;

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, speed } = position.coords;

        try {
          // Fetch the address
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();

          // Shorten the address (Nominatim gives a very long string)
          const addressString = data.display_name;

          // Update Firestore - using auth.currentUser.uid
          // Inside watchPosition try block
          await updateDoc(doc(db, "drivers", driverId), {
            address: addressString, // ADD THIS LINE HERE (top level)
            lastLocation: {
              lat: latitude,
              lng: longitude,
              speed: speed || 0,
              address: addressString, // Keeps it here for the map logic too
              timestamp: new Date()
            }
          });
        } catch (err) {
          console.error("Location update failed:", err);
        }
      },
      (err) => console.error("GPS Error:", err),
      { enableHighAccuracy: true, timeout: 10000 }
    );

    // CLEANUP: This stops the GPS when the component unmounts or driver goes offline
    return () => navigator.geolocation.clearWatch(watchId);

  }, [driverInfo?.available]); // Removed auth.currentUser from deps to avoid loops

  // 3. Monitor Driver Data (Firestore)
  useEffect(() => {
    if (!auth.currentUser) return;
    const driverRef = doc(db, "drivers", auth.currentUser.uid);
    const unsubDriver = onSnapshot(driverRef, (snap) => {
      if (snap.exists()) {
        setDriverInfo(snap.data());
      } else {
        const initialData = {
          name: auth.currentUser.displayName || "New Driver",
          email: auth.currentUser.email || "",
          available: false,
          onTrip: false,
          status: "active",
          createdAt: serverTimestamp()
        };
        setDoc(driverRef, initialData);
      }
      setLoading(false);
    });
    return () => unsubDriver();
  }, []);

  // 4. Monitor Rides (Firestore)
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

  // 5. Automatic "Busy/Available" Status Sync
  useEffect(() => {
    const syncBusyStatus = async () => {
      if (!driverInfo || loading) return;

      // A driver is BUSY if:
      // 1. They have a trip starting within 1 hour (the 'current' logic)
      // 2. OR they are currently 'on_the_way'
      const hasCurrentOrActiveTrip = allRides.some(ride => {
        const rideDate = new Date(ride.dateTime);
        const isWithinHour = rideDate <= oneHourFromNow;
        return ride.status === "on_the_way" || (isWithinHour && ride.status !== "completed");
      });

      // If they have a current trip but Firestore says they are free, mark as BUSY
      if (hasCurrentOrActiveTrip && !driverInfo.onTrip) {
        console.log("Trip detected in 'Current'. Marking driver as Busy for Admin.");
        await updateDoc(doc(db, "drivers", auth.currentUser.uid), {
          onTrip: true
        });
      }

      // If they have NO current trips but Firestore says they are busy, mark as FREE
      if (!hasCurrentOrActiveTrip && driverInfo.onTrip) {
        console.log("No trips in 'Current'. Marking driver as Available for Admin.");
        await updateDoc(doc(db, "drivers", auth.currentUser.uid), {
          onTrip: false,
          currentRideId: null
        });
      }
    };

    syncBusyStatus();
  }, [allRides, driverInfo?.onTrip, loading]);

  // 6. Ride Logic (Current vs Upcoming)
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

  // 7. Update Ride Status Handler
  const updateRideStatus = async (ride, status) => {
    // ... (keep validations for time and confirm)

    try {
      const bookingRef = doc(db, "bookings", ride.id);
      const driverRef = doc(db, "drivers", auth.currentUser.uid);

      if (status === "completed") {
        await addDoc(collection(db, "confirmed_bookings"), { ...ride, status: "completed", completedAt: serverTimestamp() });
        await updateDoc(bookingRef, { status: "completed" });
        // The useEffect will detect the change and set onTrip to false automatically
      }
      else if (status === "cancelled") {
        await updateDoc(bookingRef, { status: "pending", driverId: null });
      }
      else {
        await updateDoc(bookingRef, { status });
      }
    } catch (error) {
      console.error("Update Error:", error);
    }
  };

const handleDutyToggle = async () => {
  if (!auth.currentUser) return;
  const isGoingOnline = !driverInfo?.available;
  const driverDocRef = doc(db, "drivers", auth.currentUser.uid);
  try {
    await setDoc(driverDocRef, {
      available: isGoingOnline,
      updatedAt: serverTimestamp(),
      // Clear address when going offline
      ...(isGoingOnline ? {} : { lastLocation: null, address: "" }) 
    }, { merge: true });
  } catch (error) {
    alert("Toggle failed: check Firebase Rules.");
  }
};

  if (loading) return <div className="p-10 text-center text-gray-500 font-bold">Initializing Dashboard...</div>;
  if (loading) return <div className="p-6 md:p-10 text-center text-gray-500 font-bold">Initializing Dashboard...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4 bg-gray-50 min-h-screen">
      {/* Duty Card */}
      <div className={`p-4 md:p-6 rounded-2xl mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 shadow-sm transition-all ${driverInfo?.available ? 'bg-green-600 text-white' : 'bg-white text-gray-800 border'}`}>
        <div className="flex-1 overflow-hidden sm:mr-4">
          <h2 className="font-black uppercase tracking-tight text-xl">
            {driverInfo?.available ? "Online" : "Offline"}
          </h2>
          <p className="text-[11px] opacity-90 font-bold leading-tight">
            {driverInfo?.available
              ? (driverInfo?.address || "Locating...")
              : "Duty is currently OFF"}
          </p>
        </div>
        <button onClick={handleDutyToggle} className={`w-full sm:w-auto px-6 py-2 rounded-full font-bold shadow-md transition-all ${driverInfo?.available ? 'bg-white text-green-600' : 'bg-black text-white'}`}>
          {driverInfo?.available ? "Go Offline" : "Go Online"}
        </button>
      </div>

      <Section title="Current & Active Rides" data={current} emptyMsg="No active rides right now." onUpdate={updateRideStatus} isCurrent={true} />
      <Section title="Upcoming Schedule" data={upcoming} emptyMsg="No future bookings found." onUpdate={updateRideStatus} isCurrent={false} />
    </div>
  );
}

// Sub-components for cleaner code
function Section({ title, data, emptyMsg, onUpdate, isCurrent }) {
  return (
    <>
      <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 mt-8">{title}</h3>
      {data.length === 0 ? (
        <div className="bg-white p-6 md:p-10 text-center rounded-2xl border border-dashed text-gray-400 font-bold">{emptyMsg}</div>
      ) : (
        data.map(ride => <RideCard key={ride.id} ride={ride} onUpdate={onUpdate} isCurrent={isCurrent} />)
      )}
    </>
  );
}

function RideCard({ ride, onUpdate, isCurrent }) {
  const rideDate = new Date(ride.dateTime);
  return (
    <div className={`bg-white border rounded-[2rem] p-4 md:p-6 mb-4 shadow-sm transition-all ${!isCurrent && 'opacity-75 grayscale-[0.3]'}`}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-6">
        <div className="flex gap-3 items-center">
          <div className="bg-blue-100 text-blue-700 p-3 rounded-2xl font-black text-lg">
            {rideDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase">{rideDate.toLocaleDateString([], { day: '2-digit', month: 'short' })}</p>
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
          <div><p className="text-[9px] font-black text-gray-400 uppercase">Pickup</p><p className="text-sm font-bold text-gray-700 break-words">{ride.pickup}</p></div>
        </div>
        <div className="flex gap-3">
          <div className="w-1 bg-green-500 rounded-full"></div>
          <div><p className="text-[9px] font-black text-gray-400 uppercase">Dropoff</p><p className="text-sm font-bold text-gray-700 break-words">{ride.drop}</p></div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          {(ride.status === "assigned" || ride.status === "approved") && isCurrent && (
            <button onClick={() => onUpdate(ride, "on_the_way")} className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition">Start Trip</button>
          )}
          {ride.status === "on_the_way" && (
            <button onClick={() => onUpdate(ride, "completed")} className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-green-700 transition">Finish Trip</button>
          )}
        </div>
        {(ride.status === "assigned" || ride.status === "approved") && (
          <button onClick={() => onUpdate(ride, "cancelled")} className="w-full bg-red-50 text-red-500 py-3 rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-red-100 transition">Cancel Trip</button>
        )}
      </div>
    </div>
  );
}