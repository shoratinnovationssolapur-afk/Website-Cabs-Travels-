
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../firebase";


export const autoAssignDriver = async (bookingId, vehicleType) => {

  const driversSnap = await getDocs(collection(db, "drivers"));

  const availableDrivers = driversSnap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(d =>
      d.available &&
      d.vehicleType === vehicleType
    );

  if (!availableDrivers.length) {
    alert("No suitable drivers available");
    return;
  }

  const driver = availableDrivers[0];

  await updateDoc(doc(db, "bookings", bookingId), {
    driverId: driver.id,
    driverName: driver.name,
    status: "assigned",
  });

  await updateDoc(doc(db, "drivers", driver.id), {
    available: false,
    currentRideId: bookingId,
  });
};