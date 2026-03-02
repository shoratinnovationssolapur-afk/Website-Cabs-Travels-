import { doc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export const autoAssignDriver = async (bookingId, driverId) => {
  if (!bookingId || !driverId) return alert("Error: Missing IDs");

  try {
    const driverRef = doc(db, "drivers", driverId);
    const driverSnap = await getDoc(driverRef);
    
    if (!driverSnap.exists()) {
      alert("Error: Driver not found in database.");
      return;
    }

    const driverData = driverSnap.data();

    // 1. Safety Check: Accept both "active" and "approved"
    if (driverData.status !== "active" && driverData.status !== "approved") {
      alert("Driver account is not verified or active.");
      return;
    }

    // 2. Availability Check: Ensure they aren't already busy
    if (driverData.onTrip === true) {
      alert("This driver is currently on another trip!");
      return;
    }

    // 3. Update the Booking Document
    await updateDoc(doc(db, "bookings", bookingId), {
      driverId: driverId,
      driverName: driverData.name,
      status: "assigned",
      assignedAt: serverTimestamp(),
    });

    // 4. Update Driver Document: 
    // Set onTrip to true immediately upon assignment
    // This removes them from the Admin assignment modal
    await updateDoc(driverRef, {
      onTrip: true, 
      currentRideId: bookingId,
      lastUpdated: serverTimestamp()
    });

    alert(`Successfully assigned to ${driverData.name}`);
    
  } catch (error) {
    console.error("Assignment Error:", error);
    alert("System error during assignment.");
  }
};