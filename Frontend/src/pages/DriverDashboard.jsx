import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";

export default function DriverDashboard() {

  const [ride, setRide] = useState(null);

  useEffect(() => {
  const watchId = navigator.geolocation.watchPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;

      await updateDoc(
        doc(db, "drivers", auth.currentUser.uid),
        {
          location: {
            lat: latitude,
            lng: longitude
          }
        }
      );
    }
  );

  return () => navigator.geolocation.clearWatch(watchId);
}, []);

  useEffect(() => {
    const fetchRide = async () => {
      const driverId = auth.currentUser.uid;

      const driverSnap = await getDoc(doc(db, "drivers", driverId));
      const driverData = driverSnap.data();

      if (driverData.currentRideId) {
        const rideSnap = await getDoc(
          doc(db, "bookings", driverData.currentRideId)
        );
        setRide({ id: rideSnap.id, ...rideSnap.data() });
      }
    };

    fetchRide();
  }, []);

  if (!ride) return <h2 className="p-10">No Ride Assigned</h2>;

  return (
    <div className="p-10">

      <h2 className="text-2xl font-bold mb-4">
        Current Ride
      </h2>

      <p>Pickup: {ride.pickup}</p>
      <p>Drop: {ride.drop}</p>
      <p>Status: {ride.status}</p>

    </div>
  );
}