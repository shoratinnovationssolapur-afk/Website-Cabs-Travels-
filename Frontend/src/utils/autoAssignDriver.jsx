import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export const autoAssignDriver = async (bookingId) => {

  if (!bookingId) {
    alert("Booking ID is missing");
    return;
  }

  const driversSnap = await getDocs(collection(db, "drivers"));

  const availableDrivers = driversSnap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(d => d.available);

  if (!availableDrivers.length) {
    alert("No drivers available");
    return;
  }

  const driver = availableDrivers[0];

  await updateDoc(doc(db, "bookings", bookingId), {
    driverId: driver.id,
    driverName: driver.name,
    status: "assigned"
  });

  await updateDoc(doc(db, "drivers", driver.id), {
    available: false,
    currentRideId: bookingId
  });
};