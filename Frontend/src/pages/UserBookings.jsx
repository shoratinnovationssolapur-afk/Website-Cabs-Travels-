import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const q = query(
        collection(db, "bookings"),
        where("userId", "==", auth.currentUser.uid)
      );

      const snap = await getDocs(q);

      setBookings(
        snap.docs.map(d => ({ id: d.id, ...d.data() }))
      );
    };

    fetch();
  }, []);

  return (
    <div>

      <h1 className="text-2xl font-bold mb-6">
        My Bookings
      </h1>

      {bookings.map(b => (
        <div key={b.id}
          className="bg-white p-4 rounded shadow mb-3">

          <p><b>Vehicle:</b> {b.vehicleName}</p>
          <p><b>Pickup:</b> {b.pickup}</p>
          <p><b>Drop:</b> {b.drop}</p>
          <p><b>Status:</b> {b.status}</p>

        </div>
      ))}

    </div>
  );
};

export default UserBookings;