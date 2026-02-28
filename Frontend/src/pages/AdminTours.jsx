import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc, // 1. Added updateDoc
  serverTimestamp
} from "firebase/firestore";
import { Edit2, Trash2, X } from "lucide-react"; // Optional icons for better UI

export default function AdminTours() {
  const [tours, setTours] = useState([]);
  const [editingId, setEditingId] = useState(null); // 2. Track which tour is being edited

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

  // 3. Populate form for editing
  const startEdit = (tour) => {
    setEditingId(tour.id);
    setForm({
      title: tour.title,
      location: tour.location,
      price: tour.price,
      duration: tour.duration,
      imageUrl: tour.imageUrl,
      description: tour.description,
      itinerary: tour.itinerary.join("\n") // Convert array back to string for textarea
    });
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to form
  };

  // 4. Cancel Edit
  const cancelEdit = () => {
    setEditingId(null);
    setForm({ title: "", location: "", price: "", duration: "", imageUrl: "", description: "", itinerary: "" });
  };

  const handleSubmit = async () => {
    const tourData = {
      ...form,
      price: Number(form.price),
      itinerary: form.itinerary.split("\n"),
      updatedAt: serverTimestamp()
    };

    if (editingId) {
      // UPDATE LOGIC
      await updateDoc(doc(db, "tours", editingId), tourData);
      setEditingId(null);
    } else {
      // ADD LOGIC
      await addDoc(collection(db, "tours"), {
        ...tourData,
        createdAt: serverTimestamp()
      });
    }

    fetchTours();
    cancelEdit(); // Reset form
  };

  const deleteTour = async (id) => {
    if (window.confirm("Are you sure you want to delete this tour?")) {
      await deleteDoc(doc(db, "tours", id));
      fetchTours();
    }
  };

  return (
    <div className="p-10 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin — Manage Tours</h1>
        {editingId && (
          <button onClick={cancelEdit} className="flex items-center gap-2 text-red-600 font-bold bg-red-50 px-4 py-2 rounded-lg">
            <X size={18} /> Cancel Editing
          </button>
        )}
      </div>

      {/* FORM SECTION */}
      <div className={`p-6 rounded-xl shadow-lg mb-10 grid gap-4 transition-colors ${editingId ? 'bg-blue-50 border-2 border-blue-200' : 'bg-white'}`}>
        <h2 className="font-bold text-gray-700 uppercase tracking-wider">
          {editingId ? "Edit Tour Details" : "Add New Tour"}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none" />
          <input placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none" />
          <div className="relative">
            <input placeholder="Price" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">per person</span>
          </div>
          <input placeholder="Duration (e.g. 3 Days / 2 Nights)" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none" />
        </div>

        <input placeholder="Image URL" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none" />
        <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="border p-3 rounded-lg h-24 focus:ring-2 focus:ring-blue-400 outline-none" />
        <textarea placeholder="Itinerary (Write one point per line)" value={form.itinerary} onChange={e => setForm({ ...form, itinerary: e.target.value })} className="border p-3 rounded-lg h-32 focus:ring-2 focus:ring-blue-400 outline-none" />

        <button onClick={handleSubmit} className={`py-3 rounded-lg font-bold text-white shadow-md transition ${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}>
          {editingId ? "Update Tour Information" : "Add Tour to Listing"}
        </button>
      </div>

      {/* TOUR LIST */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tours.map(t => (
          <div key={t.id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 group">
            <img src={t.imageUrl} className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-500" alt={t.title} />
            <div className="p-5">
              <h2 className="font-bold text-xl mb-1 text-gray-800">{t.title}</h2>
              <p className="text-gray-500 text-sm mb-3 flex items-center gap-1">📍 {t.location}</p>
              <p className="text-green-600 font-black text-lg">₹ {t.price.toLocaleString('en-IN')}</p>

              <div className="flex gap-2 mt-5">
                <button onClick={() => startEdit(t)} className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-blue-100 hover:text-blue-700 transition">
                  <Edit2 size={16} /> Edit
                </button>
                <button onClick={() => deleteTour(t.id)} className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-600 hover:text-white transition">
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}