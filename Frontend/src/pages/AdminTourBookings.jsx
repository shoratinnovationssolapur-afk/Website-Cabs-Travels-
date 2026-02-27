import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { 
  collection, 
  onSnapshot, 
  updateDoc, 
  doc, 
  query, 
  orderBy 
} from "firebase/firestore";
import { CheckCircle, XCircle, Clock, MapPin, User, Calendar } from "lucide-react";

const AdminTourBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔄 Real-time listener for "tour_bookings" collection
  useEffect(() => {
    const q = query(collection(db, "tour_bookings"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookings(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, "tour_bookings", id), {
        status: newStatus
      });
    } catch (error) {
      alert("Error updating status: " + error.message);
    }
  };

  if (loading) return <div className="p-10 text-center font-bold">Loading Tour Bookings...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-black mb-8 text-gray-800 border-b pb-4">
        Tour Package Management
      </h1>

      <div className="grid gap-6">
        {bookings.map((b) => (
          <div key={b.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition">
            
            {/* Tour Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  b.status === "approved" ? "bg-green-100 text-green-700" : 
                  b.status === "rejected" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                }`}>
                  {b.status}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock size={12} /> {b.createdAt?.toDate ? b.createdAt.toDate().toLocaleDateString() : "Just now"}
                </span>
              </div>
              
              <h2 className="text-xl font-bold text-gray-800">{b.tourTitle}</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600">
                <p className="flex items-center gap-2"><User size={14} className="text-gray-400" /> User ID: <span className="font-mono text-xs">{b.userId.substring(0, 8)}...</span></p>
                <p className="flex items-center gap-2"><MapPin size={14} className="text-gray-400" /> Tour ID: <span className="font-mono text-xs">{b.tourId}</span></p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
              {b.status === "pending" ? (
                <>
                  <button
                    onClick={() => updateStatus(b.id, "approved")}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-green-700 transition"
                  >
                    <CheckCircle size={18} /> Approve
                  </button>
                  <button
                    onClick={() => updateStatus(b.id, "rejected")}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 px-5 py-2 rounded-xl font-bold hover:bg-red-50 transition"
                  >
                    <XCircle size={18} /> Reject
                  </button>
                </>
              ) : (
                <div className="text-sm font-semibold text-gray-400 italic">
                  Decision finalized
                </div>
              )}
            </div>
          </div>
        ))}

        {bookings.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">No tour bookings received yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTourBookings;