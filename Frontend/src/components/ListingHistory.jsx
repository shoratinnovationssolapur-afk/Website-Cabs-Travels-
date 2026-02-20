import React, { useEffect, useState } from 'react';
import { db, auth } from "../firebase";
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { Clock, CheckCircle, XCircle, Eye, Car, Trash2, AlertCircle } from "lucide-react";

const ListingHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. We use onAuthStateChanged to ensure the user is loaded
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        // 2. Real-time Query
        const q = query(
          collection(db, "vendor_listings"),
          where("vendorId", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        // 3. Listen for changes
        const unsubscribeDocs = onSnapshot(q, (snapshot) => {
          const docs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setHistory(docs);
          setLoading(false);
          setError(null);
        }, (err) => {
          console.error("Firestore Error:", err);
          setError(err.message);
          setLoading(false);
        });

        return () => unsubscribeDocs();
      } else {
        setLoading(false);
        setHistory([]);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      try {
        await deleteDoc(doc(db, "vendor_listings", id));
        // No need to manually update state; onSnapshot handles it!
      } catch (err) {
        alert("Delete failed: " + err.message);
      }
    }
  };

  if (loading) return (
    <div className="text-center p-10 flex flex-col items-center gap-2">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p className="text-gray-500 italic">Fetching your car history...</p>
    </div>
  );

  if (error) return (
    <div className="max-w-4xl mx-auto mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3">
      <AlertCircle size={24} />
      <div>
        <p className="font-bold">Index Required</p>
        <p className="text-sm">Please check your browser console (F12) and click the Firebase link to create the index.</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto mt-12 p-6 bg-white rounded-3xl shadow-xl border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Clock className="text-blue-600" /> Your Listing History
      </h2>

      {history.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl">
          <Car className="mx-auto text-gray-200 mb-4" size={48} />
          <p className="text-gray-500">You haven't listed any cars in Solapur yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div key={item.id} className="group border rounded-2xl p-4 flex items-center justify-between hover:border-blue-200 hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-20 h-16 bg-gray-50 rounded-xl overflow-hidden shadow-inner">
                  {item.imageUrls?.length > 0 ? (
                    <img src={item.imageUrls[0]} alt="Car" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300"><Car /></div>
                  )}
                </div>
                
                <div>
                  <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition">{item.carModel}</h3>
                  <p className="text-xs text-gray-500 font-medium">{item.regNumber} • ₹{item.price}/day</p>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">{item.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${
                  item.status === 'approved' ? 'bg-green-100 text-green-700' : 
                  item.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {item.status || 'pending'}
                </span>

                <button 
                  onClick={() => window.location.href = `/booking-details?vehicle_id=${item.id}`}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  <Eye size={20} />
                </button>

                <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListingHistory;