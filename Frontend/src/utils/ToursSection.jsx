import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function ToursSection() {
  const [tours, setTours] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTours = async () => {
      const snap = await getDocs(collection(db, "tours"));
      setTours(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };

    fetchTours();
  }, []);

  return (
    <div className="py-16 bg-gray-100">

      <h2 className="text-3xl font-bold text-center mb-10">
        Popular Tours
      </h2>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">

        {tours.map(t => (
          <div
            key={t.id}
            onClick={() => navigate(`/tour/${t.id}`)}
            className="bg-white rounded shadow cursor-pointer"
          >
            <img src={t.imageUrl}
                 className="h-48 w-full object-cover rounded-t" />

            <div className="p-4">
              <h3 className="font-bold text-lg">{t.title}</h3>
              <p>{t.location}</p>
              <p className="text-green-600 font-bold">
                ₹ {t.price}
              </p>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}