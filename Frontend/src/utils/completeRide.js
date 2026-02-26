import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export const completeRide = async (bookingId, driverId) => {
  if (!bookingId || !driverId) {
    console.error("Missing IDs for completion");
    return;
  }

  try {
    // 1. Update the Booking status to completed
    const bookingRef = doc(db, "bookings", bookingId);
    await updateDoc(bookingRef, {
      status: "completed",
      completedAt: serverTimestamp(),
    });

    // 2. Update the Driver to be ready for the next trip
    const driverRef = doc(db, "drivers", driverId);
    await updateDoc(driverRef, {
      onTrip: false,          // Now they can be assigned again
      currentRideId: null,    // Clear the link to the finished booking
      lastUpdated: serverTimestamp()
    });

    console.log("Ride completed and driver status reset.");
  } catch (error) {
    console.error("Error completing ride:", error);
    alert("Failed to complete ride: " + error.message);
  }
};