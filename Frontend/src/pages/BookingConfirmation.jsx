import React, { useEffect, useState } from 'react';
import { db } from "../firebase";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  MapPin, CheckCircle, Car, Loader2, Minus, Plus, 
  ShieldCheck, ChevronLeft, PartyPopper, PhoneCall, Home
} from 'lucide-react';

const BookingConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [days, setDays] = useState(1);
  const [bookingId, setBookingId] = useState("");

  const vehicleId = searchParams.get("vehicle_id");
  const pickupLocation = searchParams.get("pickup") || "Solapur City";
  const dropLocation = searchParams.get("drop") || "Pune Airport";

  useEffect(() => {
    const fetchVehicle = async () => {
      if (vehicleId) {
        try {
          const docRef = doc(db, "vehicles", vehicleId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) setVehicle({ id: docSnap.id, ...docSnap.data() });
        } catch (error) { console.error("Firestore Error:", error); }
      }
      setLoading(false);
    };
    fetchVehicle();
  }, [vehicleId]);

  const handleFinalBooking = async () => {
    setIsSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, "confirmed_bookings"), {
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        pickup: pickupLocation,
        drop: dropLocation,
        durationDays: days,
        totalFare: totalAmount,
        status: "confirmed",
        createdAt: serverTimestamp()
      });
      setBookingId(docRef.id);
      setIsSuccess(true);
    } catch (error) {
      alert("Booking Failed: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const shareOnWhatsApp = () => {
    const message = `Hello Rathod Cabs! %0A%0A*New Booking Confirmed*%0AID: ${bookingId}%0AVehicle: ${vehicle.name}%0APickup: ${pickupLocation}%0ADrop: ${dropLocation}%0ADuration: ${days} Days%0ATotal: ₹${totalAmount}%0A%0APlease confirm my ride!`;
    window.open(`https://wa.me/9130067841?text=${message}`, '_blank');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-yellow-500" size={48} /></div>;

  const dailyRate = vehicle?.pricePerKm ? parseInt(vehicle.pricePerKm) * 10 : 2500;
  const totalAmount = dailyRate * days;

  // SUCCESS SCREEN UI
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="flex justify-center">
             <div className="bg-green-100 p-6 rounded-full">
               <PartyPopper size={60} className="text-green-600" />
             </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-gray-900">Booking Confirmed!</h1>
            <p className="text-gray-500 font-medium">Your ride is reserved. Booking ID: <span className="text-gray-900 font-bold">{bookingId.slice(0, 8)}</span></p>
          </div>
          
          <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 text-left space-y-3">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Summary</p>
            <div className="flex justify-between font-bold text-lg">
              <span>{vehicle.name}</span>
              <span>₹{totalAmount}</span>
            </div>
            <p className="text-sm text-gray-600 italic">For {days} days • {pickupLocation} to {dropLocation}</p>
          </div>

          <div className="space-y-4 pt-4">
            <button 
              onClick={shareOnWhatsApp}
              className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-green-100 hover:scale-105 transition"
            >
              <PhoneCall size={20} /> SEND DETAILS ON WHATSAPP
            </button>
            <button 
              onClick={() => navigate('/')}
              className="w-full bg-black text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2"
            >
              <Home size={20} /> BACK TO HOME
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ORIGINAL BOOKING UI (Simplified for brevity)
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="relative w-full h-[450px] bg-black">
        <img src={vehicle?.imageUrl} alt={vehicle?.name} className="w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>
        <button onClick={() => navigate(-1)} className="absolute top-6 left-6 bg-white/20 backdrop-blur-md p-2 rounded-full text-white"><ChevronLeft size={28} /></button>
        <div className="absolute bottom-10 left-6 md:left-20 text-white">
          <span className="bg-yellow-400 text-black px-3 py-1 rounded-md text-xs font-bold uppercase tracking-widest">{vehicle?.type}</span>
          <h1 className="text-4xl md:text-6xl font-black mt-2 uppercase">{vehicle?.name}</h1>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 grid lg:grid-cols-3 gap-10 -mt-10 relative z-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
             <h3 className="text-2xl font-bold flex items-center gap-3 mb-8"><MapPin className="text-yellow-500" /> Journey Overview</h3>
             <div className="flex justify-between items-center bg-gray-50 p-6 rounded-2xl">
                <div><p className="text-xs text-gray-400 font-bold uppercase">Pickup</p><p className="text-lg font-bold">{pickupLocation}</p></div>
                <div className="h-px bg-gray-200 flex-1 mx-6"></div>
                <div className="text-right"><p className="text-xs text-gray-400 font-bold uppercase">To</p><p className="text-lg font-bold">{dropLocation}</p></div>
             </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 flex justify-between items-center">
             <div><h3 className="text-xl font-bold">Booking Duration</h3><p className="text-gray-500">Days for car rental</p></div>
             <div className="flex items-center gap-6 bg-gray-50 p-3 rounded-2xl">
                <button onClick={() => setDays(Math.max(1, days - 1))} className="w-12 h-12 bg-white rounded-xl shadow-md"><Minus size={20}/></button>
                <span className="text-3xl font-black">{days}</span>
                <button onClick={() => setDays(days + 1)} className="w-12 h-12 bg-white rounded-xl shadow-md"><Plus size={20}/></button>
             </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-[40px] p-8 shadow-2xl border border-gray-100 sticky top-24">
            <h3 className="text-2xl font-bold mb-8">Pricing</h3>
            <div className="space-y-5 mb-10 text-gray-500 font-medium">
              <div className="flex justify-between"><span>Rate per Day</span><span>₹{dailyRate}</span></div>
              <div className="flex justify-between text-black font-bold pt-5 border-t"><span>Grand Total</span><span className="text-3xl text-blue-900 font-black">₹{totalAmount}</span></div>
            </div>

            <button 
              onClick={handleFinalBooking}
              disabled={isSubmitting}
              className="w-full bg-yellow-400 text-black py-5 rounded-2xl font-black text-lg hover:bg-yellow-500 transition-all flex items-center justify-center gap-3"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <>CONFIRM NOW <CheckCircle size={22} /></>}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookingConfirmation;