import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp, getDoc, doc } from "firebase/firestore";
import axios from "axios";
import { CheckCircle, Users, MapPin, IndianRupee, CreditCard, Calendar, Phone, Home } from "lucide-react";

const TourBookingPage = () => {
  const { id } = useParams(); // Tour ID from URL
  const navigate = useNavigate();
  
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [lastBookingId, setLastBookingId] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    bookerName: "",
    bookerPhone: "",
    bookerAddress: "",
    numPeople: 1,
    travelers: [{ name: "", age: "", phone: "" }]
  });
  
  const [aadharFiles, setAadharFiles] = useState({}); // Stores files per traveler index

  // 1. Fetch Tour Details on Load
  useEffect(() => {
    const fetchTour = async () => {
      const snap = await getDoc(doc(db, "tours", id));
      if (snap.exists()) {
        setTour({ id: snap.id, ...snap.data() });
      }
    };
    fetchTour();
  }, [id]);

  // 2. Handle Dynamic Traveler Fields
  const handleNumPeopleChange = (e) => {
    const count = parseInt(e.target.value) || 1;
    const newTravelers = [...formData.travelers];
    
    if (count > newTravelers.length) {
      for (let i = newTravelers.length; i < count; i++) {
        newTravelers.push({ name: "", age: "", phone: "" });
      }
    } else {
      newTravelers.splice(count);
    }
    setFormData({ ...formData, numPeople: count, travelers: newTravelers });
  };

  const handleTravelerChange = (index, e) => {
    const updatedTravelers = [...formData.travelers];
    updatedTravelers[index][e.target.name] = e.target.value;
    setFormData({ ...formData, travelers: updatedTravelers });
  };

  const handleFileChange = (index, e) => {
    setAadharFiles({ ...aadharFiles, [index]: e.target.files[0] });
  };

  // 3. Submit Logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return alert("Please login to book a tour");
    setLoading(true);

    try {
      const travelerDataWithImages = [];

      // A. Upload Aadhar Cards to Cloudinary (Loop through travelers)
      for (let i = 0; i < formData.travelers.length; i++) {
        let aadharUrl = "";
        if (aadharFiles[i]) {
          const data = new FormData();
          data.append("images", aadharFiles[i]); // Matches your backend field name
          data.append("userId", auth.currentUser.uid);

          const response = await axios.post("https://website-cabs-travels.onrender.com/api/images/upload", data);
          aadharUrl = response.data.urls[0]; 
        }

        travelerDataWithImages.push({
          ...formData.travelers[i],
          aadharUrl: aadharUrl
        });
      }

      // B. Save to Firestore (tour_bookings)
      const bookingData = {
        tourId: tour.id,
        tourTitle: tour.title,
        price: tour.price,
        userId: auth.currentUser.uid,
        bookerName: formData.bookerName,
        bookerPhone: formData.bookerPhone,
        bookerAddress: formData.bookerAddress,
        numPeople: formData.numPeople,
        travelers: travelerDataWithImages,
        status: "pending",
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, "tour_bookings"), bookingData);
      setLastBookingId(docRef.id);
      setSubmitted(true);
      
    } catch (error) {
      console.error("Booking failed", error);
      alert("Error: " + (error.response?.data?.error || "Submission failed"));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden text-center p-8">
          <CheckCircle size={60} className="mx-auto text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Booking Confirmed!</h2>
          <p className="text-gray-500 mt-2">Your request for <strong>{tour?.tourTitle || "the tour"}</strong> is being processed.</p>
          <div className="mt-6 p-4 bg-gray-100 rounded-lg text-sm font-mono text-gray-600">
            Booking ID: {lastBookingId}
          </div>
          <button onClick={() => navigate("/")} className="mt-8 w-full bg-blue-600 text-white py-3 rounded-xl font-bold">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!tour) return <div className="text-center py-20">Loading Tour Details...</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header Section */}
        <div className="bg-yellow-500 p-6 text-white">
          <h1 className="text-3xl font-bold">Complete Your Booking</h1>
          <div className="flex items-center gap-4 mt-2 opacity-90">
            <span className="flex items-center gap-1"><MapPin size={16}/> {tour.title}</span>
            <span className="flex items-center gap-1"><IndianRupee size={16}/> {tour.price} / person</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Booker Details */}
          <section>
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2">
              <Phone size={18} className="text-yellow-600"/> Booker Contact Info
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <input type="text" placeholder="Full Name" className="border p-3 rounded-lg w-full" 
                onChange={(e) => setFormData({...formData, bookerName: e.target.value})} required />
              <input type="tel" placeholder="Phone Number" className="border p-3 rounded-lg w-full" 
                onChange={(e) => setFormData({...formData, bookerPhone: e.target.value})} required />
              <div className="md:col-span-2">
                <textarea placeholder="Complete Address" className="border p-3 rounded-lg w-full" rows="2"
                  onChange={(e) => setFormData({...formData, bookerAddress: e.target.value})} required />
              </div>
            </div>
          </section>

          {/* Travelers Details */}
          <section>
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Users size={18} className="text-yellow-600"/> Traveler Details
              </h3>
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold">Total People:</label>
                <input type="number" min="1" value={formData.numPeople} onChange={handleNumPeopleChange} 
                  className="border rounded p-1 w-16 text-center" />
              </div>
            </div>

            {formData.travelers.map((traveler, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-xl mb-4 border border-gray-200">
                <p className="text-sm font-bold text-gray-500 mb-3 uppercase">Traveler {index + 1}</p>
                <div className="grid md:grid-cols-3 gap-4">
                  <input type="text" name="name" placeholder="Name as per Aadhar" className="bg-white border p-2 rounded-lg" 
                    onChange={(e) => handleTravelerChange(index, e)} required />
                  <input type="number" name="age" placeholder="Age" className="bg-white border p-2 rounded-lg" 
                    onChange={(e) => handleTravelerChange(index, e)} required />
                  <input type="tel" name="phone" placeholder="Mobile (Optional)" className="bg-white border p-2 rounded-lg" 
                    onChange={(e) => handleTravelerChange(index, e)} />
                  <div className="md:col-span-3">
                    <label className="text-xs font-bold text-gray-400 flex items-center gap-1 mb-1">
                      <CreditCard size={12}/> UPLOAD AADHAR CARD (Image)
                    </label>
                    <input type="file" className="text-sm w-full" onChange={(e) => handleFileChange(index, e)} required />
                  </div>
                </div>
              </div>
            ))}
          </section>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full bg-yellow-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-yellow-600 transition shadow-lg ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? "Uploading Documents & Booking..." : `Confirm Booking for ₹${tour.price * formData.numPeople}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TourBookingPage;