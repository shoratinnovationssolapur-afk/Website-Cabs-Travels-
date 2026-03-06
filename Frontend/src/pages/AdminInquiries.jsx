import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { Mail, Trash2, CheckCircle, Clock, User, MessageSquare, ExternalLink } from "lucide-react";

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Real-time listener for inquiries, newest first
    const q = query(collection(db, "inquiries"), orderBy("timestamp", "desc"));
    
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setInquiries(list);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const markAsRead = async (id) => {
    try {
      await updateDoc(doc(db, "inquiries", id), {
        status: "read"
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const deleteInquiry = async (id) => {
    if (window.confirm("Are you sure you want to delete this inquiry?")) {
      try {
        await deleteDoc(doc(db, "inquiries", id));
      } catch (error) {
        alert("Delete failed: " + error.message);
      }
    }
  };

  if (loading) return <div className="p-10 text-center font-bold">Loading Inquiries...</div>;

  return (
    <div className="bg-slate-50 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-outfit">Customer Inquiries</h1>
            <p className="text-slate-500">Manage messages sent from the Contact Us page</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-200">
            <span className="text-blue-600 font-bold">{inquiries.length}</span> Total Messages
          </div>
        </div>

        {inquiries.length === 0 ? (
          <div className="bg-white p-20 rounded-3xl text-center border-2 border-dashed border-slate-200">
            <MessageSquare size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">No inquiries found yet.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {inquiries.map((item) => (
              <div 
                key={item.id} 
                className={`bg-white rounded-3xl p-6 shadow-sm border transition-all ${
                  item.status === 'read' ? 'border-slate-100 opacity-80' : 'border-blue-200 ring-1 ring-blue-50'
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-slate-100 p-2 rounded-xl">
                        <User size={20} className="text-slate-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">{item.name}</h3>
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <Mail size={12} /> {item.email}
                        </p>
                      </div>
                      {item.status !== 'read' && (
                        <span className="ml-2 bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                          New
                        </span>
                      )}
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl mb-4">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Subject: {item.subject}</p>
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{item.message}</p>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock size={14} /> 
                        {item.timestamp?.toDate().toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col gap-2 justify-end">
                    <button 
                      onClick={() => window.location.href = `mailto:${item.email}?subject=Re: ${item.subject}`}
                      className="flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-600 transition"
                    >
                      <ExternalLink size={16} /> Reply via Email
                    </button>
                    
                    {item.status !== 'read' && (
                      <button 
                        onClick={() => markAsRead(item.id)}
                        className="flex items-center justify-center gap-2 bg-green-50 text-green-600 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-green-100 transition"
                      >
                        <CheckCircle size={16} /> Mark Read
                      </button>
                    )}

                    <button 
                      onClick={() => deleteInquiry(item.id)}
                      className="flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-red-100 transition"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInquiries;