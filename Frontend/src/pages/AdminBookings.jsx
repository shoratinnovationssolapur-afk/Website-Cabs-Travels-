import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  onSnapshot
} from "firebase/firestore";
import { autoAssignDriver } from "../utils/autoAssignDriver";

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [passenger, setPassenger] = useState([]);

  const fetchBookings = async () => {
    const snapshot = await getDocs(collection(db, "bookings"));

    const list = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    setBookings(list);
  };

  // useEffect(() => {
  //   fetchBookings();
  // }, []);


  // Replace fetchBookings and its useEffect with this:
useEffect(() => {
  const q = collection(db, "bookings");
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
    // Sort by most recent if you have a createdAt field
    setBookings(list.sort((a, b) => b.createdAt - a.createdAt));
  });

  return () => unsubscribe();
}, []);

// Remove all calls to fetchBookings() inside updateStatus
const updateStatus = async (b, status) => {
  await updateDoc(doc(db, "bookings", b.id), { status });
  // No need to call fetchBookings() anymore!
};





  

  return (
    <div className="p-10 bg-gray-100 min-h-screen">

      <h1 className="text-3xl font-bold mb-6">
        Manage Bookings
      </h1>

      <div className="space-y-4">

        {/* {bookings.map(b => (
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
                className="bg-green-600 text-white cursor-pointer hover:bg-green-400 px-3 py-1 rounded"
              >
                Approve
              </button>

              <button
                onClick={() => updateStatus(b, "rejected")}
                className="bg-red-600 text-white cursor-pointer hover:bg-red-400 px-3 py-1 rounded"
              >
                Reject
              </button>
<button
                onClick={() => autoAssignDriver(b.id)}
                className="bg-blue-600 text-white hover:bg-blue-400 cursor-pointer px-3 py-1 rounded"
              >
                Assign Driver
                </button>
              
            

            </div>
          </div>
        ))} */}
        {bookings.map(b => {
          // Check if passengers array exists and has at least one entry with an 'age'
          const isCarBooking = b.passengers && b.passengers.length > 0 && b.passengers[0].age;

          return (
            <div key={b.id} className="bg-white p-5 rounded shadow relative">

              {/* Dynamic Label */}
              <span className={`absolute top-2 right-2 px-2 py-1 text-xs rounded font-bold ${isCarBooking ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                }`}>
                {isCarBooking ? 'CAR BOOKING' : 'QUICK BOOKING'}
              </span>

              {/* Basic Info */}
              <p><b>Name:</b> {b.passengers?.[0]?.name || b.name || "N/A"}</p>
              <p><b>Phone:</b> {b.passengers?.[0]?.phone || b.phone || "N/A"}</p>

              {/* Show Age/Type only for Car Bookings */}
              {/* {isCarBooking && (
                <p className="text-sm text-gray-600">
                  <b>Details:</b> {b.passengers[0].age} yrs ({b.passengers[0].type})
                </p>
              )} */}

              <p><b>Pickup:</b> {b.pickup}</p>
              <p><b>Drop:</b> {b.drop}</p>
              <p><b>Status:</b> {b.status}</p>

              <div className="flex gap-2 mt-3">
                {/* Show Approve/Reject ONLY if the status is 'pending' */}
                {b.status === "pending" && (
                  <>
                    <button
                      onClick={() => updateStatus(b, "approved")}
                      className="bg-green-600 text-white cursor-pointer hover:bg-green-400 px-3 py-1 rounded"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => updateStatus(b, "rejected")}
                      className="bg-red-600 text-white cursor-pointer hover:bg-red-400 px-3 py-1 rounded"
                    >
                      Reject
                    </button>
                  </>
                )}

                {/* Show Assign Driver ONLY if NOT completed and NOT rejected */}
                {b.status !== "completed" && b.status !== "rejected" && (
                  <button
                    onClick={() => autoAssignDriver(b.id)}
                    className="bg-blue-600 text-white hover:bg-blue-400 cursor-pointer px-3 py-1 rounded"
                  >
                    {b.status === "assigned" ? "Re-assign Driver" : "Assign Driver"}
                  </button>
                )}

                {/* Visual Indicator for Completed/Rejected rides */}
                {b.status === "completed" && (
                  <span className="text-gray-500 italic font-medium">✓ Ride Completed</span>
                )}
                {b.status === "rejected" && (
                  <span className="text-red-500 italic font-medium">✘ Ride Rejected</span>
                )}
              </div>
            </div>
          );
        })}

      </div>

    </div>
  );
};

export default AdminBookings;
