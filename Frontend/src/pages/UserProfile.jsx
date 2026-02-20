import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function UserProfile() {
  const [userData, setUserData] = useState(null);
  const [name, setName] = useState("");

  const fetchUser = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) {
      setUserData(snap.data());
      setName(snap.data().name || "");
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const updateProfile = async () => {
    const user = auth.currentUser;
    await updateDoc(doc(db, "users", user.uid), {
      name,
    });
    alert("Profile Updated");
  };

  if (!userData) return <p className="p-10">Loading...</p>;

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded shadow">

      <h2 className="text-2xl font-bold mb-6">My Profile</h2>

      <img
        src={userData.photo || "https://via.placeholder.com/120"}
        className="w-28 h-28 rounded-full mb-4"
      />

      <p className="mb-2"><b>Email:</b> {userData.email}</p>
      <p className="mb-4"><b>Role:</b> {userData.role}</p>

      <input
        className="border p-2 w-full mb-3"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Full Name"
      />

      <button
        onClick={updateProfile}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Update Profile
      </button>

    </div>
  );
}