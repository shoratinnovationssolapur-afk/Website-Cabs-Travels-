import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from "firebase/firestore";
import { Check, X, Trash2, Clock, Car, User, MapPin, IndianRupee } from "lucide-react";

const AdminVendorManagement = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Real-time listener for all vendor listings
  useEffect(() => {
    const q = query(collection(db, "vendor_listings"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setListings(data);
      setLoading(false);
    }, (err) => {
      console.error("Admin Fetch Error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      const docRef = doc(db, "vendor_listings", id);
      await updateDoc(docRef, { status: newStatus });
    } catch (error) {
      alert("Error updating status: " + error.message);
    }
  };

  const deleteListing = async (id) => {
    if (window.confirm("Are you sure you want to delete this listing permanently?")) {
      try {
        await deleteDoc(doc(db, "vendor_listings", id));
      } catch (error) {
        alert("Error deleting: " + error.message);
      }
    }
  };

  if (loading) return <div className="p-10 text-center animate-pulse">Loading Admin Panel...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Vendor Management</h1>
          <p className="text-gray-500">Approve or Reject car rental listings from vendors.</p>
        </header>

        <div className="grid gap-6">
          {listings.length > 0 ? (
            listings.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row">
                
                {/* Image Section */}
                <div className="w-full md:w-64 h-48 bg-gray-200">
                  {item.imageUrls && item.imageUrls[0] ? (
                    <img src={item.imageUrls[0]} alt="Car" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400"><Car size={40}/></div>
                  )}
                </div>

                {/* Info Section */}
                <div className="p-6 flex-1 grid md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      {item.carModel} <span className="text-xs font-normal text-gray-400">({item.year})</span>
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><User size={14}/> {item.ownerName}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin size={14}/> {item.location}</p>
                  </div>

                  <div className="flex flex-col justify-center">
                    <p className="text-sm font-bold text-slate-600 uppercase tracking-wider">Reg No: {item.regNumber}</p>
                    <p className="text-lg font-bold text-green-600 flex items-center gap-1">
                      <IndianRupee size={16}/> {item.price}/day
                    </p>
                  </div>

                  <div className="flex flex-col justify-center items-start md:items-end gap-3">
                    {/* Status Badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      item.status === 'approved' ? 'bg-green-100 text-green-700' : 
                      item.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {item.status}
                    </span>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {item.status !== "approved" && (
                        <button 
                          onClick={() => updateStatus(item.id, "approved")}
                          className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                          title="Approve"
                        >
                          <Check size={18} />
                        </button>
                      )}
                      
                      {item.status !== "rejected" && (
                        <button 
                          onClick={() => updateStatus(item.id, "rejected")}
                          className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                          title="Reject"
                        >
                          <X size={18} />
                        </button>
                      )}

                      <button 
                        onClick={() => deleteListing(item.id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
              No listings found in the database.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminVendorManagement;