import React, { useEffect, useState } from 'react';
import { db } from "../firebase";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  Calendar, MapPin, CheckCircle, Info, 
  Car, Loader2, Minus, Plus, IndianRupee, ShieldCheck, ChevronLeft
} from 'lucide-react';
import { getAuth } from "firebase/auth"; // <--- Add this

const auth = getAuth(); // <--- Initialize auth

const BookingDetails = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(1);
  const vehicleId = searchParams.get("vehicle_id");
  const pickupLocation = searchParams.get("pickup") || "Solapur City";
  const dropLocation = searchParams.get("drop") || "Pune Airport";

  useEffect(() => {
    const fetchVehicle = async () => {
      if (vehicleId) {
        try {
          const docRef = doc(db, "vehicles", vehicleId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setVehicle({ id: docSnap.id, ...docSnap.data() });
          }
        } catch (error) { console.error("Firestore Error:", error); }
      }
      setLoading(false);
    };
    fetchVehicle();
  }, [vehicleId]);

const handleFinalBooking = async () => {
  try {
    await addDoc(collection(db, "confirm_bookings"), { // Changed to 'confirm_bookings'
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      pickup: pickupLocation,
      drop: dropLocation,
      durationDays: days,
      totalFare: totalAmount,
      status: "pending", // Set to pending for Admin review
      userId: auth.currentUser.uid, // Required so you can read it back later
      createdAt: serverTimestamp()
    });
    alert("🚀 Request sent to Admin for confirmation!");
    navigate('/');
  } catch (error) { 
    alert("Error: " + error.message); 
  }
};

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-yellow-500" size={48} /></div>;

  const dailyRate = vehicle?.pricePerKm ? parseInt(vehicle.pricePerKm) * 10 : 2500;
  const totalAmount = dailyRate * days;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 1. LARGE HERO IMAGE SECTION */}
      <div className="relative w-full h-[450px] bg-black">
        <img 
          src={vehicle?.imageUrl} 
          alt={vehicle?.name} 
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>
        
        {/* Vehicle Image */}
        <div className="overflow-hidden rounded-lg mb-6">
          <img
            src={vehicle.imageUrl}
            alt={vehicle.name}
            className="w-full h-72 object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Vehicle Info */}
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-3xl font-bold text-gray-800">{vehicle.name}</h2>
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded uppercase">
            {vehicle.type}
          </span>
        </div>

        <p className="text-gray-600 mb-6 leading-relaxed">
          {vehicle.desc}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6 border-y border-gray-100 py-4">
          <div>
            <p className="text-sm text-gray-500">Pricing</p>
            <p className="text-lg font-bold text-green-600">
              {vehicle.pricePerKm ? `₹ ${vehicle.pricePerKm}/km` : "Contact for Price"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Status</p>
            {vehicle.available === false ? (
              <p className="text-red-600 font-bold">❌ Not Available</p>
            ) : (
              <p className="text-green-600 font-bold">✅ Available Now</p>
            )}
          </div>
        </div>

        {/* Book Button */}
        <button

  onClick={() =>
    navigate(`/?vehicle_id=${vehicle.id}#booking`)
  }
  className="w-full bg-yellow-500 text-white py-3 rounded-lg font-bold hover:bg-yellow-600 transition"
>
  Proceed to Booking
</button>

        {/* Back Button Overlay */}

        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/40 transition"
        >
          <ChevronLeft size={28} />
        </button>

        {/* Floating Vehicle Title */}
        <div className="absolute bottom-10 left-6 md:left-20 text-white">
          <span className="bg-yellow-400 text-black px-3 py-1 rounded-md text-xs font-bold uppercase tracking-widest">
            {vehicle?.type || 'Premium'}
          </span>
          <h1 className="text-4xl md:text-6xl font-black mt-2 drop-shadow-lg uppercase tracking-tight">
            {vehicle?.name}
          </h1>
          <p className="text-gray-300 mt-2 font-medium flex items-center gap-2">
            <CheckCircle size={18} className="text-yellow-400" /> Professional Grade Cab Service
          </p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 grid lg:grid-cols-3 gap-10 -mt-10 relative z-10">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Trip Summary Card */}
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold flex items-center gap-3">
                   <MapPin className="text-yellow-500" /> Route Details
                </h3>
                <div className="bg-gray-100 px-4 py-2 rounded-2xl">
                   <p className="text-[10px] text-gray-500 uppercase font-bold text-center">Duration</p>
                   <p className="font-bold text-gray-800">{days} Days Trip</p>
                </div>
             </div>

             <div className="grid md:grid-cols-2 gap-10 relative">
                {/* Vertical Line Decor */}
                <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-0.5 bg-gray-100"></div>
                
                <div className="space-y-1">
                   <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">From</p>
                   <p className="text-xl font-bold text-gray-800">{pickupLocation}</p>
                </div>

                <div className="space-y-1 md:text-right">
                   <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">To</p>
                   <p className="text-xl font-bold text-gray-800">{dropLocation}</p>
                </div> 
             </div>
          </div>

          {/* Duration Selector */}
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
             <div>
                <h3 className="text-xl font-bold">Extend Your Trip?</h3>
                <p className="text-gray-500">Adjust the number of days you need the vehicle.</p>
             </div>
             <div className="flex items-center gap-6 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <button 
                  onClick={() => setDays(Math.max(1, days - 1))}
                  className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-md hover:text-yellow-500 transition"
                >
                  <Minus size={20}/>
                </button>
                <span className="text-3xl font-black min-w-[40px] text-center">{days}</span>
                <button 
                  onClick={() => setDays(days + 1)}
                  className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-md hover:text-yellow-500 transition"
                >
                  <Plus size={20}/>
                </button>
             </div>
          </div>
        </div>

        {/* Right Column: Pricing */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[40px] p-8 shadow-2xl border border-gray-100 sticky top-24">
            <h3 className="text-2xl font-bold mb-8">Fare Details</h3>
            
            <div className="space-y-5 mb-10">
              <div className="flex justify-between text-gray-500 font-medium">
                <span>Daily Rate</span>
                <span>₹{dailyRate}</span>
              </div>
              <div className="flex justify-between text-gray-500 font-medium">
                <span>Total Days</span>
                <span>x {days}</span>
              </div>
              <div className="border-t border-dashed pt-5 mt-5 flex justify-between items-end">
                <span className="font-bold text-gray-400">GRAND TOTAL</span>
                <div className="text-right">
                  <p className="text-4xl font-black text-black">₹{totalAmount}</p>
                  <p className="text-[10px] text-green-600 font-bold tracking-widest uppercase">No Hidden Taxes</p>
                </div>
              </div>
            </div>

            <button 
              onClick={handleFinalBooking}
              className="w-full bg-yellow-400 text-black py-5 rounded-2xl font-black text-lg hover:bg-yellow-500 transition-all shadow-xl shadow-yellow-200 active:scale-95 flex items-center justify-center gap-3"
            >
              CONFIRM NOW <CheckCircle size={22} />
            </button>

            <div className="mt-8 p-4 bg-gray-50 rounded-2xl flex gap-3 border border-gray-100">
              <ShieldCheck className="text-green-500 shrink-0" size={24} />
              <p className="text-[11px] text-gray-600 leading-relaxed font-medium">
                <strong>Safety First:</strong> All Rathod Cabs drivers are verified and follow strict safety protocols. Pay the driver directly upon arrival.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookingDetails;