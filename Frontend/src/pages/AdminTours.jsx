import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";

export default function AdminTours() {

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [tours, setTours] = useState([]);

  const fetchTours = async () => {
    const snap = await getDocs(collection(db, "tours"));
    setTours(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    fetchTours();
  }, []);

  const addTour = async () => {
    await addDoc(collection(db, "tours"), {
      title,
      price
    });

    setTitle("");
    setPrice("");
    fetchTours();
  };

  const deleteTour = async (id) => {
    await deleteDoc(doc(db, "tours", id));
    fetchTours();
  };

  return (
    <div>

      <h2 className="text-2xl font-bold mb-6">
        Manage Tours
      </h2>

      <div className="mb-6">
        <input
          placeholder="Tour Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 mr-2"
        />

        <input
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="border p-2 mr-2"
        />

        <button
          onClick={addTour}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Add Tour
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">

        {tours.map(t => (
          <div key={t.id} className="bg-white p-4 shadow rounded">

            <h3 className="font-bold">{t.title}</h3>
            <p>₹ {t.price}</p>

            <button
              onClick={() => deleteTour(t.id)}
              className="bg-red-600 text-white px-2 py-1 mt-2 rounded"
            >
              Delete
            </button>

          </div>
        ))}

      </div>

    </div>
  );
}