import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase"; // Adjust path if necessary
import { collection, addDoc, serverTimestamp, getDoc, doc } from "firebase/firestore";
import axios from "axios";
import { CheckCircle, Eye, PlusCircle, Car, MapPin, Phone, IndianRupee, Info } from "lucide-react";
import ListingHistory from "./ListingHistory"; // Import the new component

// 1. Define initial state outside to easily reset
const initialFormState = {
  ownerName: "",
  mobile: "",
  carModel: "",
  year: "",
  regNumber: "",
  fuelType: "Petrol",
  transmission: "Manual",
  capacity: "",
  price: "",
  location: "",
  additionalInfo: ""
};

const RentCarPage = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [files, setFiles] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false); 
  const [lastListingId, setLastListingId] = useState(""); 
  const [fetchedData, setFetchedData] = useState(null); // Data from Firebase

  // Handle Input Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  // 2. Fetch data from Firebase when a listing is successful
  useEffect(() => {
    const fetchNewListing = async () => {
      if (submitted && lastListingId) {
        try {
          const docRef = doc(db, "vendor_listings", lastListingId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setFetchedData(docSnap.data());
          }
        } catch (error) {
          console.error("Error fetching listing:", error);
        }
      }
    };
    fetchNewListing();
  }, [submitted, lastListingId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return alert("Please login first");
    setLoading(true);

    try {
      let imageUrls = [];

      // A. Upload to Cloudinary
      if (files && files.length > 0) {
        const data = new FormData();
        for (let i = 0; i < files.length; i++) {
          data.append("images", files[i]); 
        }
        data.append("userId", auth.currentUser.uid);

        const response = await axios.post("http://localhost:3000/api/images/upload", data);
        imageUrls = response.data.urls; 
      }

      // B. Save to Firestore
      const listingData = {
        ...formData,
        imageUrls: imageUrls,
        vendorId: auth.currentUser.uid,
        status: "pending",
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, "vendor_listings"), listingData);
      
      // C. Reset and toggle view
      setLastListingId(docRef.id);
      setSubmitted(true);
      setFormData(initialFormState); // FIXED: Clears form
      setFiles(null);
      
    } catch (error) {
      console.error("Submission failed", error);
      alert("Error: " + (error.response?.data?.error || "Check your backend terminal"));
    } finally {
      setLoading(false);
    }
  };

  // --- SUCCESS VIEW (Directly from Firebase) ---
  if (submitted && fetchedData) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-6 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-green-100">
          <div className="bg-green-500 p-6 text-center text-white">
            <CheckCircle size={50} className="mx-auto mb-2" />
            <h2 className="text-2xl font-bold">Listing Received!</h2>
            <p className="text-sm opacity-90">ID: {lastListingId}</p>
          </div>

          <div className="p-8 space-y-6">
            {/* Image Preview from Firebase */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {fetchedData.imageUrls?.map((url, i) => (
                <img key={i} src={url} alt="Car" className="w-32 h-24 object-cover rounded-lg border shadow-sm" />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-gray-400 font-bold flex items-center gap-1"><Car size={12}/> Model</span>
                <span className="font-semibold text-gray-800">{fetchedData.carModel}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-gray-400 font-bold flex items-center gap-1"><MapPin size={12}/> Location</span>
                <span className="font-semibold text-gray-800">{fetchedData.location}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-gray-400 font-bold flex items-center gap-1"><IndianRupee size={12}/> Price</span>
                <span className="font-semibold text-gray-800">₹{fetchedData.price}/day</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-gray-400 font-bold flex items-center gap-1"><Info size={12}/> Status</span>
                <span className="font-bold text-orange-500 uppercase">{fetchedData.status}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4 border-t">
              <button 
                onClick={() => window.location.href = `/booking-details?vehicle_id=${lastListingId}`}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition"
              >
                <Eye size={20} /> View Full Public Page
              </button>
              <button 
                onClick={() => { setSubmitted(false); setFetchedData(null); }}
                className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition"
              >
                <PlusCircle size={20} /> List Another Vehicle
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- FORM VIEW ---
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-6">
      <h1 className="text-4xl font-bold text-center mb-4">Rent Your Car With Us</h1>
      <p className="text-center text-gray-600 mb-10">Earn money by listing your vehicle on Rathod Cabs & Travels</p>

      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        <form className="grid md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
          <input name="ownerName" type="text" placeholder="Owner Name" value={formData.ownerName} className="border p-3 rounded-lg" onChange={handleChange} required />  
          <input name="mobile" type="tel" placeholder="Mobile Number" value={formData.mobile} className="border p-3 rounded-lg" onChange={handleChange} required /> 
          <input name="carModel" type="text" placeholder="Car Brand & Model" value={formData.carModel} className="border p-3 rounded-lg" onChange={handleChange} required /> 
          <input name="year" type="number" placeholder="Year of Manufacture" value={formData.year} className="border p-3 rounded-lg" onChange={handleChange} /> 
          <input name="regNumber" type="text" placeholder="Registration Number" value={formData.regNumber} className="border p-3 rounded-lg" onChange={handleChange} required /> 

          <select name="fuelType" value={formData.fuelType} className="border p-3 rounded-lg" onChange={handleChange}>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="CNG">CNG</option>
            <option value="Electric">Electric</option>
          </select>

          <select name="transmission" value={formData.transmission} className="border p-3 rounded-lg" onChange={handleChange}>
            <option value="Manual">Manual</option>
            <option value="Automatic">Automatic</option>
          </select>

          <input name="capacity" type="number" placeholder="Seating Capacity" value={formData.capacity} className="border p-3 rounded-lg" onChange={handleChange} />
          <input name="price" type="number" placeholder="Price per Day (₹)" value={formData.price} className="border p-3 rounded-lg" onChange={handleChange} />
          <input name="location" type="text" placeholder="Available Location" value={formData.location} className="border p-3 rounded-lg" onChange={handleChange} />

          <div className="md:col-span-2">
            <label className="block mb-2 font-semibold">Upload Car Photos</label>
            <input type="file" multiple className="border p-3 rounded-lg w-full" onChange={handleFileChange} />
          </div>

          <textarea name="additionalInfo" placeholder="Additional Details" value={formData.additionalInfo} className="border p-3 rounded-lg md:col-span-2" rows={4} onChange={handleChange}></textarea>

          <button 
            type="submit" 
            disabled={loading}
            className={`bg-yellow-400 text-black py-3 rounded-lg font-semibold md:col-span-2 hover:bg-yellow-500 transition shadow-md ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? "Processing Upload..." : "Submit Car for Approval"}
          </button>
        </form>
      </div>
      {/* ADD THIS LINE AT THE BOTTOM */}
    {!submitted && <ListingHistory />}
    </div>
  );
};

export default RentCarPage;