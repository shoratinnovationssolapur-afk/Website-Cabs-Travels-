import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { doc, updateDoc, onSnapshot, addDoc, collection, query, where, serverTimestamp } from "firebase/firestore";

export default function DriverDashboard() {
  const [driverInfo, setDriverInfo] = useState(null);
  const [allRides, setAllRides] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= 1. REVERSE GEOCODING LOGIC =================
  const fetchAddressFromCoords = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await res.json();

      if (!data) return { short: "Unknown Location", full: "Unknown" };

      // Formatting for "Solapur, Solapur District" style
      const city = data.address.city || data.address.town || data.address.village || data.address.suburb || "";
      const district = data.address.state_district || data.address.county || "";
      
      return {
        short: city && district ? `${city}, ${district}` : data.display_name.split(',').slice(0, 2).join(','),
        full: data.display_name
      };
    } catch (err) {
      console.error("Geocoding error:", err);
      return { short: "Location Error", full: "Error fetching address" };
    }
  };

  // ================= 2. DUTY TOGGLE (FIRESTORE SYNC) =================
  const handleDutyToggle = async () => {
    if (!auth.currentUser) return;
    const isGoingOnline = !driverInfo?.available;

    if (isGoingOnline) {
      if (!navigator.geolocation) {
        alert("Geolocation not supported");
        return;
      }

      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        const addrData = await fetchAddressFromCoords(latitude, longitude);

        // MATCHES YOUR EXACT FORMAT
        await updateDoc(doc(db, "drivers", auth.currentUser.uid), {
          available: true,
          address: addrData.short, // "Solapur, Solapur District"
          lastUpdated: serverTimestamp(),
          location: {
            address: addrData.full, // "Sakhar Peth, Solapur, ..., India"
            lat: latitude,
            lng: longitude
          }
        });
      }, () => alert("Please enable location to go online."));
    } else {
      await updateDoc(doc(db, "drivers", auth.currentUser.uid), {
        available: false,
        lastUpdated: serverTimestamp()
      });
    }
  };

  // ================= 3. FIREBASE MONITORING =================
  useEffect(() => {
    if (!auth.currentUser) return;
    
    // Monitor Driver Data
    const unsubDriver = onSnapshot(doc(db, "drivers", auth.currentUser.uid), (snap) => {
      if (snap.exists()) setDriverInfo(snap.data());
      setLoading(false);
    });

    // Monitor Active Rides
    const q = query(
      collection(db, "bookings"),
      where("driverId", "==", auth.currentUser.uid),
      where("status", "in", ["assigned", "approved", "on_the_way"])
    );
    const unsubRides = onSnapshot(q, (snap) => {
      const ridesArray = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllRides(ridesArray);
    });

    return () => { unsubDriver(); unsubRides(); };
  }, []);

  // Sync Trip Status with Current Rides
  useEffect(() => {
    const syncStatus = async () => {
      if (!auth.currentUser || loading || !driverInfo) return;
      const hasActive = allRides.some(r => r.status === "on_the_way");
      
      if (!hasActive && driverInfo.onTrip) {
        await updateDoc(doc(db, "drivers", auth.currentUser.uid), { onTrip: false, currentRideId: "" });
      } else if (hasActive && !driverInfo.onTrip) {
        await updateDoc(doc(db, "drivers", auth.currentUser.uid), { onTrip: true });
      }
    };
    syncStatus();
  }, [allRides, driverInfo, loading]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;

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
            className={`px-6 py-2 rounded-full font-bold transition-all shadow-md ${driverInfo?.available ? 'bg-white text-green-600' : 'bg-black text-white'}`}
         >
            {driverInfo?.available ? "Go Offline" : "Go Online"}
         </button>
      </div>

      {/* RIDE SECTIONS (Current/Upcoming) */}
      <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Active Jobs</h3>
      {allRides.length === 0 ? (
        <div className="bg-white p-10 text-center rounded-2xl border border-dashed text-gray-400">No current rides.</div>
      ) : (
        allRides.map(ride => (
          <RideCard key={ride.id} ride={ride} onUpdate={updateRideStatus} />
        ))
      )}
    </div>
  );
}

// ================= RIDE CARD COMPONENT =================
function RideCard({ ride, onUpdate }) {
  const rideDate = new Date(ride.dateTime);
  return (
    <div className="bg-white border rounded-[2rem] p-6 mb-4 shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-3 items-center">
          <div className="bg-blue-100 text-blue-700 p-3 rounded-2xl font-black">{rideDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase">{rideDate.toLocaleDateString([], { day: '2-digit', month: 'short' })}</p>
            <p className="text-[10px] font-bold text-blue-500 uppercase">{ride.status}</p>
          </div>
        </div>
        <div className="text-right">
           <p className="text-[10px] font-black text-gray-400 uppercase">Fare</p>
           <p className="font-black text-green-600">₹{ride.totalFare}</p>
        </div>
      </div>
      
      <div className="space-y-3 mb-6">
        <div className="flex gap-3"><div className="w-1 bg-blue-500 rounded-full"></div><div><p className="text-[9px] font-black text-gray-400">PICKUP</p><p className="text-sm font-bold text-gray-700">{ride.pickup}</p></div></div>
        <div className="flex gap-3"><div className="w-1 bg-green-500 rounded-full"></div><div><p className="text-[9px] font-black text-gray-400">DROPOFF</p><p className="text-sm font-bold text-gray-700">{ride.drop}</p></div></div>
      </div>

      {/* Logic for Buttons */}
      <div className="flex flex-col gap-2">
         {ride.status !== "on_the_way" ? (
            <button onClick={() => onUpdate(ride, "on_the_way")} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest">Start Trip</button>
         ) : (
            <button onClick={() => onUpdate(ride, "completed")} className="w-full bg-green-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest">Finish Trip</button>
         )}
      </div>
    </div>
  );
}

// Placeholder for update function logic
const updateRideStatus = async (ride, status) => {
    const rideDate = new Date(ride.dateTime);
    const fiveMinsBefore = new Date(rideDate.getTime() - 5 * 60 * 1000);

    if (status === "on_the_way" && new Date() < fiveMinsBefore) {
      alert(`Too early! Start at ${fiveMinsBefore.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
      return;
    }

    if (status === "cancelled") {
      const confirmCancel = window.confirm("Are you sure you want to cancel this trip?");
      if (!confirmCancel) return;
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
        await updateDoc(doc(db, "bookings", ride.id), { 
          status: "pending", 
          driverId: null, 
          driverName: null 
        });
        await updateDoc(doc(db, "drivers", auth.currentUser.uid), { onTrip: false });
      } else {
        await updateDoc(doc(db, "bookings", ride.id), { status });
      }
    } catch (error) {
      console.error("Update Error:", error);
      alert("Action failed.");
    }
  };