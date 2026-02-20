import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";

const AdminDrivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const fetchDrivers = async () => {
    const snapshot = await getDocs(collection(db, "drivers"));

    const list = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    setDrivers(list);
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const addDriver = async () => {
    if (!name || !phone) return alert("Fill all fields");

    await addDoc(collection(db, "drivers"), {
      name,
      phone,
      available: true
    });

    setName("");
    setPhone("");
    fetchDrivers();
  };

  const deleteDriver = async (id) => {
    await deleteDoc(doc(db, "drivers", id));
    fetchDrivers();
  };

  return (
    <div className="p-10 bg-gray-100 min-h-screen">

      <h1 className="text-3xl font-bold mb-6">
        Manage Drivers
      </h1>

      {/* ADD DRIVER */}
      <div className="bg-white p-6 rounded shadow mb-8">

        <input
          placeholder="Driver Name"
          className="border p-2 mr-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Phone"
          className="border p-2 mr-2"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <button
          onClick={addDriver}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Add Driver
        </button>

      </div>

      {/* DRIVER LIST */}
      <div className="grid md:grid-cols-3 gap-6">

        {drivers.map(d => (
          <div
            key={d.id}
            className="bg-white p-4 rounded shadow"
          >
            <h2 className="font-bold">{d.name}</h2>
            <p>{d.phone}</p>

            <button
              onClick={() => deleteDriver(d.id)}
              className="bg-red-600 text-white px-3 py-1 rounded mt-3"
            >
              Delete
            </button>
          </div>
        ))}

      </div>

    </div>
  );
};

export default AdminDrivers;
