import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { doc, updateDoc, onSnapshot, addDoc, collection, query, where, serverTimestamp } from "firebase/firestore";

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
  useEffect(() => {
    if (!auth.currentUser) return;
    const unsubDriver = onSnapshot(doc(db, "drivers", auth.currentUser.uid), (snap) => {
      if (snap.exists()) setDriverInfo(snap.data());
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

  // 4. CATEGORIZATION LOGIC (Calculated during render)
  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

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

  // 5. SYNC TRIP STATUS WITH ADMIN
  useEffect(() => {
    const syncTripStatus = async () => {
      if (!auth.currentUser || loading) return;

      // If no current rides, set onTrip to false so Admin can assign more
      if (current.length === 0 && driverInfo?.onTrip === true) {
        await updateDoc(doc(db, "drivers", auth.currentUser.uid), {
          onTrip: false,
          currentRideId: ""
        });
      } 
      // If there is an active ride, ensure onTrip is true
      else if (current.length > 0 && driverInfo?.onTrip === false) {
        await updateDoc(doc(db, "drivers", auth.currentUser.uid), {
          onTrip: true
        });
      }
    };
    syncTripStatus();
  }, [current.length, driverInfo?.onTrip, loading]);

  const updateRideStatus = async (ride, status) => {
    const rideDate = new Date(ride.dateTime);
    const fiveMinsBefore = new Date(rideDate.getTime() - 5 * 60 * 1000);

    if (status === "on_the_way" && new Date() < fiveMinsBefore) {
      alert(`Too early! Start at ${fiveMinsBefore.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`);
      return;
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
      {/* Duty Toggle */}
      <div className={`p-6 rounded-2xl mb-8 flex justify-between items-center shadow-sm ${driverInfo?.available ? 'bg-green-600 text-white' : 'bg-white text-gray-800 border'}`}>
         <div>
            <h2 className="font-black uppercase tracking-tight text-xl">
               {driverInfo?.available ? "Online" : "Offline"}
            </h2>
            <p className="text-xs opacity-80 font-bold">Visibility to Customers</p>
         </div>
         <button 
            onClick={async () => await updateDoc(doc(db, "drivers", auth.currentUser.uid), { available: !driverInfo.available })} 
            className={`px-6 py-2 rounded-full font-bold transition-all ${driverInfo?.available ? 'bg-white text-green-600' : 'bg-black text-white'}`}
         >
            {driverInfo?.available ? "Go Offline" : "Go Online"}
         </button>
      </div>

      {/* --- CURRENT RIDES --- */}
      <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Current & Active Rides</h3>
      {current.length === 0 ? (
        <div className="bg-white p-10 text-center rounded-2xl border border-dashed mb-8">
           <p className="text-gray-400">No active rides. You are available for new assignments.</p>
        </div>
      ) : (
        current.map(ride => (
          <RideCard key={ride.id} ride={ride} onUpdate={updateRideStatus} isCurrent={true} />
        ))
      )}

      {/* --- UPCOMING RIDES --- */}
      <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mt-12 mb-4">Upcoming Schedule</h3>
      {upcoming.length === 0 ? (
        <p className="text-gray-400 italic">No future bookings found.</p>
      ) : (
        upcoming.map(ride => (
          <RideCard key={ride.id} ride={ride} onUpdate={updateRideStatus} isCurrent={false} />
        ))
      )}
    </div>
  );
}

// Sub-component remains the same as your previous working version
function RideCard({ ride, onUpdate, isCurrent }) {
  const rideDate = new Date(ride.dateTime);
  const timeStr = rideDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = rideDate.toLocaleDateString([], { day: '2-digit', month: 'short' });

  return (
    <div className={`bg-white border rounded-[2rem] p-6 mb-4 shadow-sm transition-all ${!isCurrent && 'opacity-75 grayscale-[0.5]'}`}>
      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-3 items-center">
          <div className="bg-blue-100 text-blue-700 p-3 rounded-2xl">
            <span className="font-black text-lg">{timeStr}</span>
          </div>
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
           <div>
              <p className="text-[9px] font-black text-gray-400 uppercase">Pickup</p>
              <p className="text-sm font-bold text-gray-700 leading-tight">{ride.pickup}</p>
           </div>
        </div>
        <div className="flex gap-3">
           <div className="w-1 bg-green-500 rounded-full"></div>
           <div>
              <p className="text-[9px] font-black text-gray-400 uppercase">Dropoff</p>
              <p className="text-sm font-bold text-gray-700 leading-tight">{ride.drop}</p>
           </div>
        </div>
      </div>

      <div className="flex gap-2">
        {(ride.status === "assigned" || ride.status === "approved") && isCurrent && (
          <button
            onClick={() => onUpdate(ride, "on_the_way")}
            className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition"
          >
            Start Trip
          </button>
        )}

        {ride.status === "on_the_way" && (
          <button
            onClick={() => onUpdate(ride, "completed")}
            className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-green-700 transition"
          >
            Finish Trip
          </button>
        )}
      </div>
    </div>
  );
}