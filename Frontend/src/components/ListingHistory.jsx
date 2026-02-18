import React, { useEffect, useState } from 'react';
import { db, auth } from "../firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { Clock, CheckCircle, XCircle, Eye, Car } from "lucide-react";

const ListingHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!auth.currentUser) return;
      
      try {
        const q = query(
          collection(db, "vendor_listings"),
          where("vendorId", "==", auth.currentUser.uid),
          orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        const docs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setHistory(docs);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) return <div className="text-center p-10">Loading your listings...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-12 p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Clock className="text-blue-600" /> Your Listing History
      </h2>

      {history.length === 0 ? (
        <p className="text-gray-500 text-center py-10">You haven't listed any cars yet.</p>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div key={item.id} className="border rounded-xl p-4 flex items-center justify-between hover:bg-gray-50 transition">
              <div className="flex items-center gap-4">
                {/* Show first image or placeholder */}
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                  {item.imageUrls?.length > 0 ? (
                    <img src={item.imageUrls[0]} alt="Car" className="w-full h-full object-cover" />
                  ) : (
                    <Car className="text-gray-400" size={24} />
                  )}
                </div>
                
                <div>
                  <h3 className="font-bold text-gray-800">{item.carModel}</h3>
                  <p className="text-xs text-gray-500">{item.regNumber} • ₹{item.price}/day</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {/* Status Badge */}
                <span className={`flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full uppercase ${
                  item.status === 'approved' ? 'bg-green-100 text-green-700' : 
                  item.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {item.status === 'approved' && <CheckCircle size={12} />}
                  {item.status === 'rejected' && <XCircle size={12} />}
                  {item.status || 'pending'}
                </span>

                <button 
                  onClick={() => window.location.href = `/booking-details?vehicle_id=${item.id}`}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"
                  title="View Details"
                >
                  <Eye size={20} />
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