import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  doc,
  updateDoc,
  onSnapshot
} from "firebase/firestore";

export default function DriverDashboard() {
  const [ride, setRide] = useState(null);
  const [driverInfo, setDriverInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Monitor Driver Status & Current Ride ID
// 1. Monitor Driver Info
useEffect(() => {
  if (!auth.currentUser) return;

  const unsubDriver = onSnapshot(
    doc(db, "drivers", auth.currentUser.uid),
    (snap) => {
      if (snap.exists()) {
        setDriverInfo(snap.data());
      } else {
        console.warn("No driver profile found for this user.");
      }
      // Always stop loading once the driver doc is checked
      setLoading(false);
    },
    (err) => {
      console.error("Driver Watch Error:", err);
      setLoading(false);
    }
  );

  return () => unsubDriver();
}, []);

// 2. Monitor Ride Info (Depends on driverInfo.currentRideId)
useEffect(() => {
  if (!driverInfo?.currentRideId) {
    setRide(null);
    return;
  }

  const unsubRide = onSnapshot(
    doc(db, "bookings", driverInfo.currentRideId),
    (rideSnap) => {
      if (rideSnap.exists()) {
        setRide({ id: rideSnap.id, ...rideSnap.data() });
      } else {
        setRide(null);
      }
    },
    (err) => console.error("Ride Watch Error:", err)
  );

  return () => unsubRide();
}, [driverInfo?.currentRideId]); // Only restarts if the ID changes

  // 2. Real-time Location Tracking (Updates Firestore as driver moves)
  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        if (auth.currentUser) {
          await updateDoc(doc(db, "drivers", auth.currentUser.uid), {
            location: { lat: latitude, lng: longitude },
            lastUpdated: new Date()
          });
        }
      },
      (err) => console.error("Location Error:", err),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Toggle Availability Status
  const toggleDuty = async () => {
    const newStatus = !driverInfo.available;
    await updateDoc(doc(db, "drivers", auth.currentUser.uid), {
      available: newStatus
    });
  };

  const updateRideStatus = async (status) => {
    await updateDoc(doc(db, "bookings", ride.id), { status });
    
    if (status === "completed") {
      await updateDoc(doc(db, "drivers", auth.currentUser.uid), {
        currentRideId: "",
        available: true // Set back to available after finishing a ride
      });
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Driver Console...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Duty Status Header */}
      <div className={`p-6 rounded-xl mb-6 flex justify-between items-center ${driverInfo?.available ? 'bg-green-100 border border-green-200' : 'bg-gray-100 border border-gray-200'}`}>
        <div>
          <h2 className="text-lg font-bold">Duty Status</h2>
          <p className="text-sm">{driverInfo?.available ? "You are Online and visible to customers" : "You are currently Offline"}</p>
        </div>
        <button 
          onClick={toggleDuty}
          className={`px-6 py-2 rounded-full font-bold text-white transition-all ${driverInfo?.available ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {driverInfo?.available ? "Go Offline" : "Go Online"}
        </button>
      </div>

      {(!ride || !driverInfo?.available) ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="text-5xl mb-4">🚕</div>
          <h3 className="text-xl font-bold text-gray-700">Waiting for Ride Requests</h3>
          <p className="text-gray-400">Keep the app open to receive new bookings.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-blue-50 overflow-hidden">
          <div className="bg-blue-900 text-white p-4 flex justify-between items-center">
            <span className="font-bold">NEW RIDE ASSIGNED</span>
            <span className="bg-yellow-400 text-blue-900 px-3 py-1 rounded-md text-xs font-black uppercase">
              {ride.status}
            </span>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <div className="w-0.5 h-10 bg-gray-200 my-1"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="flex-1 space-y-5">
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Pickup</p>
                  <p className="font-semibold text-gray-800">{ride.pickup}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Dropoff</p>
                  <p className="font-semibold text-gray-800">{ride.drop}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 grid grid-cols-2 gap-4">
              {ride.status === "assigned" && (
                <button 
                  onClick={() => updateRideStatus("on_the_way")}
                  className="bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg col-span-2"
                >
                  Start Trip
                </button>
              )}
              
              {ride.status === "on_the_way" && (
                <button 
                  onClick={() => updateRideStatus("completed")}
                  className="bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition shadow-lg col-span-2"
                >
                  Finish Trip
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}