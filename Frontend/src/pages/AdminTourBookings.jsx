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
import { 
  CheckCircle, XCircle, Clock, MapPin, User, 
  Users, Phone, Home, CreditCard, ChevronDown, ChevronUp, ExternalLink 
} from "lucide-react";

const AdminTourBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null); // Track which booking is open

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

  const toggleDetails = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) return <div className="p-6 md:p-10 text-center font-bold">Loading Tour Bookings...</div>;

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-black mb-8 text-gray-800 border-b pb-4">
        Tour Package Management
      </h1>

      <div className="grid gap-6">
        {bookings.map((b) => (
          <div key={b.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
            
            {/* Top Row: Main Info */}
            <div className="p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
                
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600">
                  <p className="flex items-center gap-2"><User size={14} className="text-blue-500" /> <b>Booker:</b> {b.bookerName}</p>
                  <p className="flex items-center gap-2"><Users size={14} className="text-purple-500" /> <b>People:</b> {b.numPeople}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button 
                  onClick={() => toggleDetails(b.id)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-bold hover:bg-gray-200 transition"
                >
                  {expandedId === b.id ? <ChevronUp size={18}/> : <ChevronDown size={18}/>} 
                  {expandedId === b.id ? "Hide Details" : "View Details"}
                </button>

                {b.status === "pending" && (
                  <div className="flex gap-2">
                    <button onClick={() => updateStatus(b.id, "approved")} className="p-2 bg-green-600 text-white rounded-xl hover:bg-green-700"><CheckCircle size={20}/></button>
                    <button onClick={() => updateStatus(b.id, "rejected")} className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600"><XCircle size={20}/></button>
                  </div>
                )}
              </div>
            </div>

            {/* Expandable Details Section */}
            {expandedId === b.id && (
              <div className="bg-gray-50 p-4 md:p-6 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
                <div className="grid md:grid-cols-2 gap-8">
                  
                  {/* Left: Booker & Tour Info */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-gray-400 uppercase text-xs tracking-widest">Contact Information</h3>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-2 text-sm">
                      <p className="flex items-center gap-2"><Phone size={14} className="text-gray-400"/> {b.bookerPhone}</p>
                      <p className="flex items-start gap-2"><Home size={14} className="text-gray-400 mt-1"/> {b.bookerAddress}</p>
                      <p className="pt-2 text-xs text-gray-400 font-mono">User ID: {b.userId}</p>
                    </div>
                  </div>

                  {/* Right: Traveler Cards & Aadhar */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-gray-400 uppercase text-xs tracking-widest">Traveler Documents</h3>
                    <div className="grid gap-4">
                      {b.travelers?.map((t, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
                          <div>
                            <p className="font-bold text-gray-800">{t.name} <span className="text-gray-400 font-normal">({t.age} yrs)</span></p>
                            <p className="text-xs text-gray-500">{t.phone || "No phone provided"}</p>
                          </div>
                          {t.aadharUrl ? (
                            <a 
                              href={t.aadharUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition"
                            >
                              <CreditCard size={14}/> View Aadhar <ExternalLink size={12}/>
                            </a>
                          ) : (
                            <span className="text-xs text-red-400 italic">No Aadhar Uploaded</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}
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
