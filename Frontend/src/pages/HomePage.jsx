import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { collection, addDoc, serverTimestamp,getDocs,getDoc,doc,onSnapshot,
  query, 
  where} from "firebase/firestore";
  import { FaWhatsapp } from "react-icons/fa6";



import innova from "../assets/innova.avif";
import MahindraXUV700 from "../assets/MahindraXUV700.avif";
import HyundaiCreta from "../assets/HyundaiCreta.avif";
import GrandVitara from "../assets/GrandVitara.webp";
import Brezza from "../assets/Brezza.avif";
import HyundaiAura from "../assets/Sedan1.avif";
import SuzukiDzire from "../assets/Sedan2.webp";
import HyundaiVerna from "../assets/Sedan3.avif";
import HondaAmaze from "../assets/Sedan4.avif";
import TataTigor from "../assets/Sedan5.jpg";
import MercedesBenzSClass from "../assets/Luxurycar1.webp";
import RangeRover from "../assets/Luxurycar2.webp";
import BMW from "../assets/Luxurycar3.webp";
import Audi from "../assets/Luxurycar4.webp";
import VolvoXC90 from "../assets/Luxurycar5.webp";
import outstationcar from "../assets/OutstationCab.webp";

import LocationInputs from "../components/pickupanddrop";
import ServiceCard from "../components/ServiceCard";
import ServiceModal from "../components/ServiceModal";
import RouteFare from "../components/RouteFare";







const HomePage = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [carType, setCarType] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [totalFare, setTotalFare] = useState(0);
  const RouteFareRef = React.useRef(); // Add this near your other useState hooks

  // For LocationInputs integration (important)
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [tripType, setTripType] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [heroPickup, setHeroPickup] = useState("");
  const [heroDrop, setHeroDrop] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);

  const [calculatedFare, setCalculatedFare] = useState(0);
  const [distance, setDistance] = useState(0);

  // 3. ADD THIS HANDLER to receive data from RouteFare component
const handleFareUpdate = ({ fare, distance }) => {
  setCalculatedFare(fare); // Updates the fare state
  
  
  setDistance(distance);   // Updates the distance state
};

  const navigate = useNavigate();





  





  // useEffect(() => {
  //   const fetchVehicles = async () => {
  //     try {
  //       const snapshot = await getDocs(collection(db, "vehicles"));

  //       const vehicleList = snapshot.docs.map(doc => ({
  //         id: doc.id,
  //         ...doc.data()
  //       }));

  //       setVehicles(vehicleList);

  //     } catch (error) {
  //       console.error("Error fetching vehicles:", error);
  //     }
  //   };

  //   fetchVehicles();
  // }, []);

useEffect(() => {
  if (pickup === drop) {
    setTotalFare(0);
  }
}, [pickup, drop]);

useEffect(() => {
  // 1. Create a query to the vehicles collection
  const q = query(collection(db, "vehicles"),where("available", "==", true));

  // 2. Set up the real-time listener
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const vehicleList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    setVehicles(vehicleList);
  }, (error) => {
    console.error("Error listening to vehicles:", error);
  });

  // 3. Clean up the listener when the component unmounts
  return () => unsubscribe();
}, []);



  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("vehicle_id");

  if (id) setSelectedVehicleId(id);
}, []);



  const seedVehicles = async () => {
    const vehicles = [

      {
        name: "Toyota Innova",
        type: "SUV",
        desc: "Spacious & Comfortable",
        imageUrl:
          innova
      },
      {
        name: "Mahindra XUV700",
        type: "SUV",
        desc: "Luxury & Power",
        imageUrl:
          MahindraXUV700
      },

      {
        name: "Hyundai Creta",
        type: "SUV",
        desc: "Premium Travel Experience",
        imageUrl:
          HyundaiCreta
      },
      {
        name: "Suzuki Brezza",
        type: "SUV",
        desc: "Smooth Ride",
        imageUrl:Brezza
          
      },
      {
        name: "Grand Vitara",
        type: "SUV",
        desc: "Versatile & Stylish",
        imageUrl:GrandVitara
      
      },

     { name: "Hyundai Aura", type: "Sedan", desc: "Elegant & Comfortable", imageUrl: HyundaiAura },
    { name: "Suzuki Dzire", type: "Sedan", desc: "Stylish & Smooth Ride", imageUrl: SuzukiDzire },
    { name: "Hyndai Verna", type: "Sedan", desc: "Spacious & Fuel Efficient", imageUrl: HyundaiVerna },
    { name: "Honda Amaze", type: "Sedan", desc: "Premium & Comfortable", imageUrl: HondaAmaze },
    { name: "Tata Tigor", type: "Sedan", desc: "Stylish & Reliable", imageUrl: TataTigor },

    {name: "Mercedes-Benz S-Class", desc: "Luxury & Performance", imageUrl:MercedesBenzSClass },
   {name: "Range Rover", desc: "Elegant & Powerful", imageUrl:RangeRover },
   {name: "BMW", desc: "Sophisticated & Comfortable", imageUrl: BMW },
   {name: "Audi", desc: "Luxury & Reliability", imageUrl: Audi },
   {name: " Volvo XC90", desc: "Stylish & Dynamic", imageUrl: VolvoXC90 },
      

    ];
    


    for (const vehicle of vehicles) {
      await addDoc(collection(db, "vehicles"), vehicle);
    }

    alert("Vehicles added successfully");
  };







//   const submitBooking = async () => {

//     if (
//       !name.trim() ||
//       !phone.trim() ||
//       !pickup.trim() ||
//       !drop.trim() ||
//       !carType ||
//       !dateTime
//     ) {
//       alert("Please first fill the booking form");
//       return;
//     }

//     const user = auth.currentUser;

//     if (!user) {
//       alert("Please login to book a ride");
//       return;
//     }

//     try {
//       await addDoc(collection(db, "bookings"), {
//   userId: user.uid,
//   userEmail: user.email,
//   vehicleId: selectedVehicleId,   // ⭐ IMPORTANT
//   name,
//   phone,
//   pickup,
//   drop,
//   carType,
//   tripType,
//   dateTime,
//   status: "pending",
//   createdAt: serverTimestamp()
// });
//       alert("Booking request submitted successfully!");

//     } catch (error) {
//       alert(error.message);
//     }
//   };

const submitBooking = async () => {
  // 1. Basic Field Validation
  if (!name.trim() || !phone.trim() || !pickup.trim() || !drop.trim() || !dateTime) {
    alert("Please fill all booking details (Name, Phone, Locations, and Date/Time).");
    return;
  }

  // 2. Route Calculation Warning/Check
  // If calculatedFare is 0 or null, it means they haven't clicked calculate yet.
  if (!calculatedFare || calculatedFare === 0) {
    console.log("Fare not calculated. Triggering calculation...");
    
    // Call the function we exposed via forwardRef
    const result = await RouteFareRef.current.triggerCalculation();

    if (result) {
      // Show the warning so user sees the route/price before confirming
      alert("⚠️ Route and Fare calculated! Please review the price on the map and click 'Submit Booking Request' again to confirm.");
      
      // We return here to give the user a chance to see the Map/Fare 
      // before actually sending data to Firebase.
      return; 
    } else {
      // If geocoding failed or something went wrong in RouteFare
      alert("Could not calculate route. Please check your pickup and drop locations.");
      return;
    }
  }

  // 3. Firebase Submission (only runs if fare is > 0)
  const user = auth.currentUser;
  if (!user) return alert("Please login to book a ride.");

  try {
    const bookingData = {
      userId: user.uid,
      userEmail: user.email,
      vehicleId: selectedVehicleId || "quick_choice",
      name,
      phone,
      pickup,
      drop,
      carType,
      tripType,
      dateTime,
      distance: Number(distance),
      totalFare: Number(calculatedFare),
      status: "pending",
      createdAt: serverTimestamp(),
      bookingMethod: "quick_booking",
      driverId: null,
      driverName: null,
      passengers: [] 
    };

    await addDoc(collection(db, "bookings"), bookingData);
    alert("✅ Booking request submitted! Our team will assign a driver shortly.");
    
    // Clear form
    setName("");
    setPhone("");
    setPickup("");
    setDrop("");
    setDateTime("");
    setCalculatedFare(0); // Reset for next booking

  } catch (error) {
    console.error("Booking Error:", error);
    alert("Booking failed: " + error.message);
  }
};



  const handleHeroFare = () => {
    if (!heroPickup.trim() || !heroDrop.trim()) {
      alert("Please enter pickup and drop locations");
      return;
    }

    // ✅ Fill booking form fields
    setPickup(heroPickup);
    setDrop(heroDrop);

    // ✅ Scroll to booking section
    document
      .getElementById("booking")
      .scrollIntoView({ behavior: "smooth" });
  };




  return (


    <div className="w-full min-h-screen bg-gray-100">
      <div className="absolute top-6 right-6 z-50">
      </div>


      {/* ================= HERO SECTION ================= */}



      {/* Hero Content */}

      <section className="relative h-screen flex items-center justify-center text-white overflow-hidden">

      
        {/* Background Image */}
        <div
          className="absolute  inset-0 bg-cover bg-center animate-[zoom_20s_linear_infinite]"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1503376780353-7e6692767b70')",
          }}
        ></div>
          


        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60"></div>

       
        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-3xl">
          
          
         
         
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fadeInUp">
            Rathod on Road,
            <span className="text-yellow-400"> Comfort on Board</span>
          </h1>

          <p className="text-lg md:text-xl mb-8">
            Premium SUV & Cab Services Across Solapur, Pune, Mumbai & Goa.
          </p>

          <div className="flex justify-center gap-6 flex-wrap">
            <a
              href="https://wa.me/9130067841" target="_blank" rel="noreferrer" 
              className=" text-green-500 font-bold px-8 py-3 rounded-full font-semibold hover:scale-105 transition flex gap-2 border"
            >
              Whatsapp us <FaWhatsapp className="text-2xl"  />
            </a>

            <a
            onClick={()=>navigate("/bookride")}
              className="border border-white px-8 py-3 rounded-full hover:bg-white hover:text-black transition cursor-pointer"
            >
              Book Ride
            </a>
          </div>
          <div className="flex justify-center gap-4 mt-22">

            {["Sedan", "SUV", "Luxury", "Others"].map((type) => (
              <button
                key={type}
                onClick={() => {
                  const id = type.toUpperCase(); // sedan, suv, luxury

                  document
                    .getElementById(id)
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-white/20 px-6 py-2 rounded-full hover:bg-yellow-400 hover:text-black transition cursor-pointer font-semibold backdrop-blur-sm"
              >
                {type === "Sedan"
                  ? "🚗"
                  : type === "SUV"
                    ? "🚙"
                    : "👑"}{" "}
                {type}
              </button>
            ))}

          </div>
          <div className=" text-white  inline-block relative top-10 font-semibold animate-pulse">
            ⭐ #1 Trusted Cab Service in Solapur
          </div>



        </div>

      </section>


      {/*SEDAN SHOWCASE*/}
      <section id="SEDAN" className=" py-16 px-6  bg-white">
        <h2 className="text-3xl font-bold text-center mb-12 text-black">
          Our Premium Sedan Fleet
        </h2>
        {/* Scroll Container */}
        <div className="flex gap-6 overflow-x-auto scroll-smooth px-2 pb-4">
          {vehicles
            .filter(v => v.type === "Sedan")
            .map(vehicle => (
              <div key={vehicle.id}
                onClick={() =>
                  navigate(`/booking?vehicle_id=${vehicle.id}`)
                }

                className="min-w-[280px] bg-white rounded-2xl shadow-lg overflow-hidden flex-shrink-0 group">
                <img
                  src={vehicle.imageUrl}
                  alt={vehicle.name}
                  className="w-full h-48 object-cover"
                />

                <div className="p-4 text-center">
                  <h3 className="font-semibold text-lg">{vehicle.name}</h3>
                  <p className="text-gray-600 text-sm">{vehicle.desc}</p>
                </div>
              </div>
            ))}

        </div>
      </section>
      {/*Luxury SHOWCASE*/}
      <section id="LUXURY" className=" py-16 px-6  bg-white">
        <h2 className="text-3xl font-bold text-center mb-12 text-black">
          Our Premium Luxury Car Fleet
        </h2>
        {/* Scroll Container */}
        <div className="flex gap-6 overflow-x-auto scroll-smooth px-2 pb-4">
          {vehicles
            .filter(v => v.type === "Luxury")
            .map(vehicle => (
              <div key={vehicle.id}
                onClick={() =>
                  navigate(`/booking?vehicle_id=${vehicle.id}`)
                }

                className="min-w-[280px] bg-white rounded-2xl shadow-lg overflow-hidden flex-shrink-0 group">
                <img
                  src={vehicle.imageUrl}
                  alt={vehicle.name}
                  className="w-full h-48 object-cover"
                />

                <div className="p-4 text-center">
                  <h3 className="font-semibold text-lg">{vehicle.name}</h3>
                  <p className="text-gray-600 text-sm">{vehicle.desc}</p>
                </div>
              </div>
            ))}

        </div>

      </section>


      {/* ================= SUV SHOWCASE ================= */}
      <section id="SUV" className="py-16 px-6 bg-white ">
        <h2 className="text-3xl font-bold text-center mb-12 text-black">
          Our Premium SUV Fleet
        </h2>

        {/* Scroll Container */}
        <div className="flex gap-6 overflow-x-auto scroll-smooth px-2 pb-4">
          {vehicles
            .filter(v => v.type === "SUV")
            .map(vehicle => (
              <div
                key={vehicle.id}
                onClick={() =>
                   navigate(`/booking?vehicle_id=${vehicle.id}`)

                }

                className="min-w-[280px] bg-white rounded-2xl shadow-lg overflow-hidden flex-shrink-0 group"

              >
                <img
                  src={vehicle.imageUrl}
                  alt={vehicle.name}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />

                <div className="p-4 text-center">
                  <h3 className="font-semibold text-lg">{vehicle.name}</h3>
                  <p className="text-gray-600 text-sm">{vehicle.desc}</p>
                </div>
              </div>
            ))}


        </div>
      </section>


            {/*Others SHOWCASE*/}
{/* ================= OTHERS SHOWCASE ================= */}
<section id="OTHERS" className="py-16 px-6 bg-white">
  <h2 className="text-3xl font-bold text-center mb-12 text-black">
   Cabs on Per day basis
  </h2>
  <div className="flex gap-6 overflow-x-auto scroll-smooth px-2 pb-4">
    {vehicles
      .filter(v => v.type === "Others")
      .map(vehicle => (
        <div 
          key={vehicle.id}
          onClick={() => navigate(`/booking?vehicle_id=${vehicle.id}`)}
          className="min-w-[280px] bg-white rounded-2xl shadow-lg overflow-hidden flex-shrink-0 group cursor-pointer"
        >
          <img
            src={vehicle.imageUrl}
            alt={vehicle.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="p-4 text-center">
            <h3 className="font-semibold text-lg">{vehicle.name}</h3>
            <p className="text-gray-600 text-sm">{vehicle.desc || "Comfortable ride for your journey"}</p>
          </div>
        </div>
      ))}
  </div>
  {/* Show message if no "Other" cars are available */}
  {vehicles.filter(v => v.type === "Others").length === 0 && (
    <p className="text-center text-gray-400 italic">More vehicles coming soon!</p>
  )}
</section>
    


        {/* ================= QUICK BOOKING ================= */}
       {/* QUICK BOOKING SECTION (Compact Styles) */}
      <section id="booking" className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10">Quick Booking</h2>
        <div className="bg-white p-8 rounded-3xl shadow-xl">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <input className="border border-gray-300 p-2 rounded-lg w-full h-11 bg-white outline-none focus:ring-2 focus:ring-yellow-400" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input className="border border-gray-300 p-2 rounded-lg w-full h-11 bg-white outline-none focus:ring-2 focus:ring-yellow-400" placeholder="Mobile" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <LocationInputs pickup={pickup} setPickup={setPickup} drop={drop} setDrop={setDrop} />
            <select className="border border-gray-300 p-2 rounded-lg w-full h-11 bg-white" value={tripType} onChange={(e) => setTripType(e.target.value)}><option value="">Trip Type</option><option>One Day</option><option>Outstation</option></select>
            <select className="border border-gray-300 p-2 rounded-lg w-full h-11 bg-white" value={carType} onChange={(e) => setCarType(e.target.value)}><option value="">Car Type</option><option>Sedan</option><option>SUV</option><option>Luxury</option></select>
            <input type="datetime-local" className="border border-gray-300 p-2 rounded-lg w-full h-11" value={dateTime} onChange={(e) => setDateTime(e.target.value)} />
          </div>
          <div className="w-full mb-8 rounded-2xl overflow-hidden border bg-gray-50 min-h-[350px]">
            <RouteFare ref={RouteFareRef} pickup={pickup} drop={drop} dateTime={dateTime} onFareCalculated={handleFareUpdate} />
          </div>
          <button className="w-full bg-yellow-500 text-black py-4 rounded-xl font-bold hover:bg-black hover:text-yellow-400 transition" onClick={submitBooking}>Submit Booking Request</button>
        </div>
      </section>


      {/* ⭐ NEW CITY ROUTES SECTION (Hyperlinks added here) */}
      <section className="py-16 px-6 bg-white border-t">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Outstation Routes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="font-black text-lg mb-4 text-blue-600 border-b-2 border-yellow-400 inline-block">Solapur Routes</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                {["Solapur to Pune", "Solapur to Mumbai", "Solapur to Goa", "Solapur to Tuljapur"].map(r => (
                  <li key={r} onClick={() => handleRouteClick(r.split(" to ")[0], r.split(" to ")[1])} className="cursor-pointer hover:text-yellow-600">• {r} taxi</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-black text-lg mb-4 text-blue-600 border-b-2 border-yellow-400 inline-block">Pune Routes</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                {["Pune to Mahabaleshwar", "Pune to Shirdi", "Pune to Mumbai Airport", "Pune to Lonavala"].map(r => (
                  <li key={r} onClick={() => handleRouteClick(r.split(" to ")[0], r.split(" to ")[1])} className="cursor-pointer hover:text-yellow-600">• {r} cab</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-black text-lg mb-4 text-blue-600 border-b-2 border-yellow-400 inline-block">Mumbai Routes</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                {["Mumbai to Solapur", "Mumbai to Pune", "Mumbai to Goa", "Mumbai to Nashik"].map(r => (
                  <li key={r} onClick={() => handleRouteClick(r.split(" to ")[0], r.split(" to ")[1])} className="cursor-pointer hover:text-yellow-600">• {r} car rental</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-black text-lg mb-4 text-blue-600 border-b-2 border-yellow-400 inline-block">Goa Routes</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                {["Goa to Solapur", "Goa to Pune", "Goa to Mumbai", "Goa Airport to Calangute"].map(r => (
                  <li key={r} onClick={() => handleRouteClick(r.split(" to ")[0], r.split(" to ")[1])} className="cursor-pointer hover:text-yellow-600">• {r} trip</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>


      {/* ================= SERVICES ================= */}
      <section className="py-24 px-6 bg-gradient-to-br from-indigo-100 via-white to-blue-100">

        <h2 className="text-8xl font-bold text-center mb-16">
          Our Services
        </h2>

        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">

          {/* ===== OUTSTATION ===== */}
          <ServiceCard
            title="Outstation Cab"
            icon="🚗"
            price="From ₹14/km"
            popular
            description="Travel comfortably to nearby cities and tourist destinations."
            onClick={() => {
              setTripType("Outstation");
              setSelectedService("Outstation Cab");

            }}
          />

          {/* ===== CORPORATE ===== */}
          <ServiceCard
            title="Corporate Travel"
            icon="💼"
            price="Custom Pricing"
            description="Professional rides for meetings and business trips."
            onClick={() => {
              setTripType("Corporate");
              setSelectedService("Corporate Travel");
            
            
            }}
          />

          {/* ===== AIRPORT ===== */}
          <ServiceCard
            title="Airport Transfers"
            icon="✈️"
            price="Flat ₹799+"
            description="On-time pickup and drop for airport journeys."
            onClick={() => {
              setTripType("Airport");
              setSelectedService("Airport Transfers");
            }}
          />

        </div>

        {/* ===== MODAL ===== */}
        {selectedService && (
          <ServiceModal
            service={selectedService}
            onClose={() => setSelectedService(null)}
          />
        )}

      </section>
      {/* ================= ABOUT US ================= */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">

          {/* LEFT CONTENT */}
          <div>
            <h2 className="text-4xl font-bold mb-6 text-gray-900">
              About Rathod Cabs & Travels
            </h2>

            <p className="text-gray-700 mb-4 leading-relaxed">
              Rathod Cabs & Travels is a trusted cab service provider offering
              comfortable, safe, and reliable transportation across Solapur,
              Pune, Mumbai, Goa, and nearby destinations. We specialize in
              outstation travel, airport transfers, and corporate rides with
              well-maintained vehicles and professional drivers.
            </p>

            <p className="text-gray-700 leading-relaxed">
              Our mission is to provide a stress-free travel experience with
              punctual service, transparent pricing, and customer-first support.
              Whether it’s a business trip or a family vacation, we ensure every
              journey is smooth and memorable.
            </p>
          </div>

          {/* RIGHT IMAGE */}
          <div>
            <img
              src={outstationcar}
              alt="Cab Service"
              className="rounded-2xl shadow-lg"
            />
          </div>

        </div>
      </section>
      {/* ================= WHY CHOOSE US ================= */}
      <section className="py-20 px-6 bg-gray-100">
        <div className="max-w-6xl mx-auto text-center">

          <h2 className="text-8xl font-bold mb-12">
            Why Choose Us
          </h2>

          <div className="grid md:grid-cols-3 gap-8">

            {/* SAFE & RELIABLE */}
            <div className="bg-white p-8 rounded-2xl shadow hover:shadow-xl transition">
              <div className="text-8xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold mb-2">
                Safe & Reliable
              </h3>
              <p className="text-gray-600">
                Experienced drivers and well-maintained vehicles ensure a
                secure and comfortable journey every time.
              </p>
            </div>

            {/* ON-TIME SERVICE */}
            <div className="bg-white p-8 rounded-2xl shadow hover:shadow-xl transition">
              <div className="text-8xl mb-4">⏱️</div>
              <h3 className="text-xl font-semibold mb-2">
                Always On Time
              </h3>
              <p className="text-gray-600">
                We value your time and guarantee punctual pickups and
                timely drop-offs for every trip.
                timely drop-offs for every tritep.
              </p>
            </div>

            {/* AFFORDABLE PRICING */}
            <div className="bg-white p-8 rounded-2xl shadow hover:shadow-xl transition">
              <div className="text-8xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-2">
                Transparent Pricing
              </h3>
              <p className="text-gray-600">
                No hidden charges — get fair and competitive pricing for
                all types of journeys.
              </p>
            </div>

            {/* 24x7 SUPPORT */}
            <div className="bg-white p-8 rounded-2xl shadow hover:shadow-xl transition">
              <div className="text-8xl mb-4">📞</div>
              <h3 className="text-xl font-semibold mb-2">
                24×7 Customer Support
              </h3>
              <p className="text-gray-600">
                Our support team is available round-the-clock to assist
                you anytime, anywhere.
              </p>
            </div>

            {/* CLEAN VEHICLES */}
            <div className="bg-white p-8 rounded-2xl shadow hover:shadow-xl transition">
              <div className="text-8xl mb-4">✨</div>
              <h3 className="text-xl font-semibold mb-2">
                Clean & Comfortable
              </h3>
              <p className="text-gray-600">
                Enjoy a pleasant ride in sanitized, spacious, and
                comfortable vehicles.
              </p>
            </div>

            {/* WIDE COVERAGE */}
            <div className="bg-white p-8 rounded-2xl shadow hover:shadow-xl transition">
              <div className="text-8xl mb-4">🌍</div>
              <h3 className="text-xl font-semibold mb-2">
                Wide Service Area
              </h3>
              <p className="text-gray-600">
                Serving Solapur, Pune, Mumbai, Goa, and many nearby
                destinations for your convenience.
              </p>
            </div>

          </div>

        </div>
      </section>



      {/* ================= FOOTER ================= */}
      <footer className="bg-yellow-500 text-white font-bold py-8 px-6 text-center">
        <p className="font-bold">
          Rathod Cabs & Travels
        </p>
        <p>Solapur | Pune | Mumbai | Goa</p>
        <p>Phone: +91 9130067841</p>
        <p>Email: rathodexpressofficial@gmail.com</p>
      </footer>

    </div>
  );
};

export default HomePage;