import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc
} from "firebase/firestore";

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);

  const fetchBookings = async () => {
    const snapshot = await getDocs(collection(db, "bookings"));

    const list = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    setBookings(list);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateStatus = async (b, status) => {
    await updateDoc(doc(db, "bookings", b.id), { status });
    fetchBookings();
  };

  return (
    <div className="p-10 bg-gray-100 min-h-screen">

      <h1 className="text-3xl font-bold mb-6">
        Manage Bookings
      </h1>

      <div className="space-y-4">

        {bookings.map(b => (
          <div
            key={b.id}
            className="bg-white p-5 rounded shadow"
          >
            <p><b>Name:</b> {b.name}</p>
            <p><b>Phone:</b> {b.phone}</p>
            <p><b>Pickup:</b> {b.pickup}</p>
            <p><b>Drop:</b> {b.drop}</p>
            <p><b>Status:</b> {b.status}</p>

            <div className="flex gap-2 mt-3">

              <button
                onClick={() => updateStatus(b, "approved")}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Approve
              </button>

              <button
                onClick={() => updateStatus(b, "rejected")}
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                Reject
              </button>

            </div>
          </div>
        ))}

      </div>

    </div>
  );
};

export default AdminBookings;
