import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";

export default function AdminTours() {
  const [tours, setTours] = useState([]);

  const [form, setForm] = useState({
    title: "",
    location: "",
    price: "",
    duration: "",
    imageUrl: "",
    description: "",
    itinerary: ""
  });

  const fetchTours = async () => {
    const snap = await getDocs(collection(db, "tours"));
    setTours(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { fetchTours(); }, []);

  const addTour = async () => {
    await addDoc(collection(db, "tours"), {
      ...form,
      price: Number(form.price),
      itinerary: form.itinerary.split("\n"),
      createdAt: serverTimestamp()
    });

    fetchTours();
    setForm({
      title: "",
      location: "",
      price: "",
      duration: "",
      imageUrl: "",
      description: "",
      itinerary: ""
    });
  };

  const deleteTour = async (id) => {
    await deleteDoc(doc(db, "tours", id));
    fetchTours();
  };

  return (
    <div className="p-10 bg-gray-100 min-h-screen">

      <h1 className="text-3xl font-bold mb-6">
        Admin — Manage Tours
      </h1>

      {/* ADD FORM */}
      <div className="bg-white p-6 rounded shadow mb-10 grid gap-3">

        <input placeholder="Title"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          className="border p-2 rounded"
        />

        <input placeholder="Location"
          value={form.location}
          onChange={e => setForm({ ...form, location: e.target.value })}
          className="border p-2 rounded"
        />

  <div className="relative">
    <input placeholder="Price"
      type="number"
      value={form.price}
      onChange={e => setForm({ ...form, price: e.target.value })}
      className="border p-2 rounded w-full"
    />
    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
    per person
  </span>
  </div>
        

        <input placeholder="Duration"
          value={form.duration}
          onChange={e => setForm({ ...form, duration: e.target.value })}
          className="border p-2 rounded"
        />

        <input placeholder="Image URL"
          value={form.imageUrl}
          onChange={e => setForm({ ...form, imageUrl: e.target.value })}
          className="border p-2 rounded"
        />

        <textarea placeholder="Description"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          className="border p-2 rounded"
        />

        <textarea placeholder="Itinerary (one per line)"
          value={form.itinerary}
          onChange={e => setForm({ ...form, itinerary: e.target.value })}
          className="border p-2 rounded"
        />

        <button
          onClick={addTour}
          className="bg-green-600 text-white py-2 rounded font-bold"
        >
          Add Tour
        </button>
      </div>

      {/* TOUR LIST */}
      <div className="grid md:grid-cols-3 gap-6">

        {tours.map(t => (
          <div key={t.id} className="bg-white rounded shadow">

            <img src={t.imageUrl}
                 className="h-48 w-full object-cover" />

            <div className="p-4">
              <h2 className="font-bold">{t.title}</h2>
              <p>{t.location}</p>
              <p>₹ {t.price}</p>

              <button
                onClick={() => deleteTour(t.id)}
                className="bg-red-600 text-white px-3 py-1 mt-3 rounded"
              >
                Delete
              </button>
            </div>

          </div>
        ))}

      </div>
    </div>
  );
}