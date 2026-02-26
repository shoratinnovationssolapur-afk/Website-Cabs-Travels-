import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";
import { UserMinus, Trash2, ShieldAlert, Search } from "lucide-react";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Real-time listener for auto-refresh
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(list);
    });

    return () => unsubscribe();
  }, []);

  const makeAdmin = async (id) => {
    await updateDoc(doc(db, "users", id), { role: "Admin" });
  };

  const removeAdmin = async (id) => {
    if (window.confirm("Demote this user to a regular User?")) {
      await updateDoc(doc(db, "users", id), { role: "User" });
    }
  };

  const deleteUser = async (id, name) => {
    if (window.confirm(`PERMANENTLY DELETE ${name}? This cannot be undone.`)) {
      try {
        await deleteDoc(doc(db, "users", id));
      } catch (error) {
        alert("Error: " + error.message);
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-gray-800">User Management</h1>
        
        {/* Search Bar */}
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            placeholder="Search name or email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredUsers.map(u => (
          <div key={u.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition">
            <div>
              <p className="font-bold text-gray-800">{u.name}</p>
              <p className="text-sm text-gray-500">{u.email}</p>
              <span className={`mt-2 inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                u.role === "Admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
              }`}>
                {u.role || "User"}
              </span>
            </div>

            <div className="flex gap-3">
              {u.role === "Admin" ? (
                <button
                  onClick={() => removeAdmin(u.id)}
                  className="flex items-center gap-2 bg-yellow-50 text-yellow-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-yellow-100 transition"
                  title="Remove Admin Rights"
                >
                  <UserMinus size={16} /> Demote
                </button>
              ) : (
                <button
                  onClick={() => makeAdmin(u.id)}
                  className="flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-purple-100 transition"
                >
                  <ShieldAlert size={16} /> Make Admin
                </button>
              )}

              <button
                onClick={() => deleteUser(u.id, u.name)}
                className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                title="Delete User Account"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminUsers;