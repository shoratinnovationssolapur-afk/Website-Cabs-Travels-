import React, { useEffect, useState } from 'react';
import { 
  Calendar, Clock, MapPin, CheckCircle, Info, 
  ShieldCheck, Fuel, Gauge, ChevronRight, Car 
} from 'lucide-react';

const BookingDetails = () => {
  const [params, setParams] = useState(null);

  useEffect(() => {
    // Parse the complex URL parameters provided in your link
    const searchParams = new URLSearchParams(window.location.search);
    
    try {
      const source = JSON.parse(searchParams.get('source') || '{}');
      const pickup = JSON.parse(searchParams.get('pickup') || '{}');
      const drop = JSON.parse(searchParams.get('drop') || '{}');
      
      setParams({
        city: source.city || 'Solapur',
        vehicleId: searchParams.get('vehicle_id'),
        pickupDate: pickup.date,
        pickupTime: pickup.time,
        dropDate: drop.date,
        dropCity: drop.city || 'Pune',
        dropTime: drop.time,
        deliveryCharges: searchParams.get('delivery_charges') || 0,
        collectionCharges: searchParams.get('collection_charges') || 0,
      });
    } catch (e) {
      console.error("Error parsing URL params", e);
    }
  }, []);

  if (!params) return <div className="p-10 text-center">Loading Booking Details...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
      {/* Header / Progress */}
      <div className="bg-white border-b px-4 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-900">Book your car</h1>
          <div className="text-sm font-medium text-gray-500">Step 1 of 2</div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto p-4 lg:grid lg:grid-cols-3 lg:gap-8">
        
        {/* Left Column: Details & Options */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Car Preview Section */}
          <section className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden">
               <Car size={80} className="text-gray-300" />
               <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                 +0 Images
               </div>
            </div>
            <h2 className="text-2xl font-bold">Vehicle Details</h2>
            <div className="flex gap-4 mt-2 text-sm text-gray-600">
              <span className="flex items-center gap-1"><Gauge size={14}/> Unlimited Mileage</span>
              <span className="flex items-center gap-1"><Fuel size={14}/> Full to Full</span>
            </div>
          </section>

          {/* Booking Summary Card */}
          <section className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-blue-600"/> Booking Details
            </h3>
            <div className="grid grid-cols-2 gap-4 border-b pb-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 uppercase">Pickup</p>
                <p className="font-semibold">{params.pickupDate} at {params.pickupTime}</p>
                <p className="text-sm text-gray-500">{params.city}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Drop-off</p>
                <p className="font-semibold">{params.dropDate} at {params.dropTime}</p>
                <p className="text-sm text-gray-500">{params.dropCity}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-green-600 text-sm font-medium">
              <div className="flex items-center gap-1"><CheckCircle size={16}/> Free Cancellation</div>
              <div className="flex items-center gap-1"><CheckCircle size={16}/> Instant Confirmation</div>
            </div>
          </section>

          {/* Insurance Options */}
          <section className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg mb-4">Insurance Options</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50/50 border-blue-100">
                <div>
                  <p className="font-semibold">Collision Damage Waiver</p>
                  <p className="text-xs text-gray-500">Amount INR 0.00</p>
                </div>
                <input type="checkbox" className="w-5 h-5 accent-blue-600"defaultChecked/>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-semibold">Comprehensive Insurance</p>
                  <p className="text-xs text-gray-500">20% Excess on damage cost</p>
                </div>
                <button className="text-blue-600 text-sm font-bold">Add</button>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Fare Breakup (Sticky) */}
        <div className="lg:col-span-1 mt-6 lg:mt-0">
          <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100 sticky top-24">
            <h3 className="font-bold text-xl mb-4">Fare Details</h3>
            
            <div className="space-y-3 text-sm border-b pb-4">
              <div className="flex justify-between">
                <span>Rental Duration</span>
                <span>1 Day</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Base Fare</span>
                <span>INR 150.00</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Charges</span>
                <span>INR {params.deliveryCharges}.00</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Collection Charges</span>
                <span>INR {params.collectionCharges}.00</span>
              </div>
            </div>

            <div className="pt-4 mb-6">
              <div className="flex justify-between items-center mb-1">
                <span className="text-lg font-bold">Total Amount</span>
                <span className="text-2xl font-black text-blue-900">INR ₹ 250.00</span>
              </div>
              <p className="text-[10px] text-gray-400 text-right uppercase tracking-wider">Inclusive of VAT</p>
            </div>

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-md active:scale-95">
              PROCEED TO BOOK
            </button>

            <div className="mt-4 flex items-start gap-2 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
              <Info size={16} className="text-yellow-600 mt-0.5 shrink-0" />
              <p className="text-[11px] text-yellow-800">
                Refundable security deposit of INR 1,000.00 will be required at the time of pickup.
              </p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default BookingDetails;