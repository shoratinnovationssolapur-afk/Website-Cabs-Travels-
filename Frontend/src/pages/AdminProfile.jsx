import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function AdminProfile() {

  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const fetchAdmin = async () => {
      const user = auth.currentUser;
      const snap = await getDoc(doc(db, "users", user.uid));
      setAdmin(snap.data());
    };

    fetchAdmin();
  }, []);

  if (!admin) return <p>Loading...</p>;

  return (
    <div className="bg-white p-6 rounded shadow max-w-xl">

      <h2 className="text-2xl font-bold mb-6">
        Admin Profile
      </h2>

      <img
        src={admin.photo || "https://via.placeholder.com/120"}
        className="w-28 h-28 rounded-full mb-4"
      />

      <p><b>Name:</b> {admin.name}</p>
      <p><b>Email:</b> {admin.email}</p>
      <p><b>Role:</b> {admin.role}</p>

    </div>
  );
}