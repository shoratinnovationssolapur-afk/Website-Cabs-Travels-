import { doc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export const autoAssignDriver = async (bookingId, driverId) => {
  if (!bookingId || !driverId) return alert("Error: Missing IDs");

  try {
    const driverRef = doc(db, "drivers", driverId);
    const driverSnap = await getDoc(driverRef);
    const driverData = driverSnap.data();

    // 1. Safety Checks
    if (driverData.status !== "active") {
      alert("Driver account is not active.");
      return;
    }
    // 2. NEW CHECK: Check if already on a trip instead of just 'available'
    if (driverData.onTrip === true) {
      alert("This driver is already busy with another ride!");
      return;
    }

    // 3. Update the Booking
    await updateDoc(doc(db, "bookings", bookingId), {
      driverId: driverId,
      driverName: driverData.name,
      status: "assigned",
      assignedAt: serverTimestamp(),
    });

    // 4. Update Driver: Keep 'available' as true so they stay "Online"
    // but set 'onTrip' to true so Admin cannot pick them again.
    await updateDoc(driverRef, {
      onTrip: true, 
      currentRideId: bookingId,
      lastUpdated: serverTimestamp()
    });

    alert(`Successfully assigned to ${driverData.name}`);
    
  } catch (error) {
    console.error("Assignment Error:", error);
  }
};