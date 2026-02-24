import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export const autoAssignDriver = async (bookingId) => {
  try {
    const driversSnap = await getDocs(collection(db, "drivers"));
    const availableDrivers = driversSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(d => d.available === true);

    if (availableDrivers.length === 0) {
      alert("No drivers are currently marked as available.");
      return;
    }

    const driver = availableDrivers[0];

    // 1. Update Booking
    await updateDoc(doc(db, "bookings", bookingId), {
      driverId: driver.id,
      driverName: driver.name || "Assigned Driver",
      status: "assigned"
    });

    // 2. Update Driver Availability
    await updateDoc(doc(db, "drivers", driver.id), {
      available: false,
      currentRideId: bookingId
    });

    alert(`Driver ${driver.name} assigned successfully!`);
  } catch (error) {
    console.error("Assignment Error:", error);
   
  }
};