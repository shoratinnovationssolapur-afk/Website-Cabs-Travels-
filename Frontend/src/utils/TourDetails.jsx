import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc, addDoc, collection } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { auth } from "../firebase";

export default function TourDetails() {

  const { id } = useParams();
  const [tour, setTour] = useState(null);

  useEffect(() => {
    const fetchTour = async () => {
      const snap = await getDoc(doc(db, "tours", id));
      if (snap.exists()) {
        setTour({ id: snap.id, ...snap.data() });
      }
    };
    fetchTour();
  }, [id]);

  const bookTour = async () => {
    await addDoc(collection(db, "tour_bookings"), {
      tourId: tour.id,
      tourTitle: tour.title,
      userId: auth.currentUser.uid,
      status: "pending",
      createdAt: new Date()
    });

    alert("Tour booked successfully!");
  };

  if (!tour) return <p>Loading...</p>;

  return (
    <div className="p-10 max-w-4xl mx-auto">

      <img src={tour.imageUrl}
           className="w-full h-72 object-cover rounded mb-6" />

      <h1 className="text-3xl font-bold">{tour.title}</h1>
      <p>{tour.location}</p>

      <p className="text-green-600 font-bold text-xl mt-2">
        ₹ {tour.price}
      </p>

      <p className="mt-4">{tour.description}</p>

      <h3 className="font-bold mt-6">Itinerary</h3>
      <ul className="list-disc ml-6">
        {tour.itinerary.map((day, i) => (
          <li key={i}>{day}</li>
        ))}
      </ul>

      <button
        onClick={bookTour}
        className="mt-6 bg-yellow-500 text-white px-6 py-3 rounded font-bold"
      >
        Book Now
      </button>

    </div>
  );
}