import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc
} from "firebase/firestore";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const snapshot = await getDocs(collection(db, "users"));

    const list = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setUsers(list);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const makeAdmin = async (id) => {
    await updateDoc(doc(db, "users", id), {
      Role: "Admin"
    });
    fetchUsers();
  };

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">
        Admin — Users
      </h1>

      {users.map(u => (
        <div key={u.id} className="bg-white p-4 rounded mb-3 shadow">

          <p><b>Name:</b> {u.name}</p>
          <p><b>Email:</b> {u.email}</p>
          <p><b>Role:</b> {u.Role}</p>

          {u.Role !== "Admin" && (
            <button
              onClick={() => makeAdmin(u.id)}
              className="bg-blue-600 text-white px-3 py-1 rounded mt-2"
            >
              Make Admin
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default AdminUsers;
