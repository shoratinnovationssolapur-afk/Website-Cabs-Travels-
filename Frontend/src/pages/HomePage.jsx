import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";




import outstationcar from "../assets/OutstationCab.webp";
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
import LocationInputs from "../components/pickupanddrop";
import ServiceCard from "../components/ServiceCard";
import ServiceModal from "../components/ServiceModal";
import RouteFare from "../components/RouteFare";





const HomePage = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [carType, setCarType] = useState("");
  const [dateTime, setDateTime] = useState("");

  // For LocationInputs integration (important)
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [tripType, setTripType] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [heroPickup, setHeroPickup] = useState("");
  const [heroDrop, setHeroDrop] = useState("");



  const cars = [
    { name: "Toyota Innova", desc: "Spacious & Comfortable", img: innova },
    { name: "Mahindra XUV700", desc: "Luxury & Power", img: MahindraXUV700 },
    { name: "Hyundai Creta", desc: "Premium Travel Experience", img: HyundaiCreta },
    { name: "Suzuki Grand Vitara", desc: "Versatile & Stylish", img: GrandVitara },
    { name: "Maruti Brezza", desc: "Compact & Efficient", img: Brezza },
  ];
  const SedenCars = [
    { name: "Hyundai Aura", desc: "Elegant & Comfortable", img: HyundaiAura },
    { name: "Suzuki Dzire", desc: "Stylish & Smooth Ride", img: SuzukiDzire },
    { name: "Hyndai Verna", desc: "Spacious & Fuel Efficient", img: HyundaiVerna },
    { name: "Honda Amaze", desc: "Premium & Comfortable", img: HondaAmaze },
    { name: "Tata Tigor", desc: "Stylish & Reliable", img: TataTigor },
  ];
  const LuxuryCars = [
    { name: "Mercedes-Benz S-Class", desc: "Luxury & Performance", img: MercedesBenzSClass },
    { name: "Range Rover", desc: "Elegant & Powerful", img: RangeRover },
    { name: "BMW", desc: "Sophisticated & Comfortable", img: BMW },
    { name: "Audi", desc: "Luxury & Reliability", img: Audi },
    { name: " Volvo XC90", desc: "Stylish & Dynamic", img: VolvoXC90 },
  ]

  const submitBooking = async () => {

    if (
      !name.trim() ||
      !phone.trim() ||
      !pickup.trim() ||
      !drop.trim() ||
      !carType ||
      !dateTime
    ) {
      alert("Please first fill the booking form");
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      alert("Please login to book a ride");
      return;
    }

    try {
      await addDoc(collection(db, "bookings"), {
        userId: user.uid,
        userEmail: user.email,
        name,
        phone,
        pickup,
        drop,
        carType,
        tripType,
        dateTime,
        status: "pending",
        createdAt: serverTimestamp()
      });

      alert("Booking Successful");

    } catch (error) {
      alert(error.message);
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
              href="tel:+919999999999"
              className="bg-yellow-400 text-black px-8 py-3 rounded-full font-semibold hover:scale-105 transition"
            >
              Call Now
            </a>

            <a
              href="#booking"
              className="border border-white px-8 py-3 rounded-full hover:bg-white hover:text-black transition"
            >
              Book Ride
            </a>
          </div>
<div className="flex justify-center gap-4 mt-22">

  {["Sedan", "SUV", "Luxury"].map((type) => (
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

      

      {/* ⭐ WORKING QUICK FARE ESTIMATE */}
      {/* <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl flex flex-col md:flex-row gap-3 mt-6 justify-center items-center">

        <input
          value={heroPickup}
          onChange={(e) => setHeroPickup(e.target.value)}
          placeholder="Pickup"
          className="px-3 py-2 rounded text-black w-full md:w-auto"
        />

        <input
          value={heroDrop}
          onChange={(e) => setHeroDrop(e.target.value)}
          placeholder="Drop"
          className="px-3 py-2 rounded text-black w-full md:w-auto"
        />

        <button
          onClick={handleHeroFare}
          className="bg-yellow-400 px-5 py-2 rounded font-semibold hover:scale-105 transition"
        >
          Get Fare
        </button>

      </div> */}

      {/* ================= SUV SHOWCASE ================= */}
      <section id="SUV" className="py-16 px-6 bg-white ">
        <h2 className="text-3xl font-bold text-center mb-12 text-black">
          Our Premium SUV Fleet
        </h2>

        {/* Scroll Container */}
        <div className="flex gap-6 overflow-x-auto scroll-smooth px-2 pb-4">
          {cars.map((car, index) => (
            <div
              key={index}
              className="min-w-[280px] bg-white rounded-2xl shadow-lg overflow-hidden flex-shrink-0 group"
            >
              <img
                src={car.img}
                alt={car.name}
                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
              />

              <div className="p-4 text-center">
                <h3 className="font-semibold text-lg">{car.name}</h3>
                <p className="text-gray-600 text-sm">{car.desc}</p>
              </div>
            </div>
          ))}

        </div>
      </section>

      {/*SEDAN SHOWCASE*/}
      <section id="SEDAN" className=" py-16 px-6  bg-white">
        <h2 className="text-3xl font-bold text-center mb-12 text-black">
          Our Premium Sedan Fleet
        </h2>
        {/* Scroll Container */}
        <div className="flex gap-6 overflow-x-auto scroll-smooth px-2 pb-4">
          {SedenCars.map((Sedancar, index) => (
            <div
              key={index}
              className="min-w-[280px] bg-white rounded-2xl shadow-lg overflow-hidden flex-shrink-0 group"
            >
              <img
                src={Sedancar.img}
                alt={Sedancar.name}
                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
              />

              <div className="p-4 text-center">
                <h3 className="font-semibold text-lg">{Sedancar.name}</h3>
                <p className="text-gray-600 text-sm">{Sedancar.desc}</p>
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
          {LuxuryCars.map((Luxurycar, index) => (
            <div
              key={index}
              className="min-w-[280px] bg-white rounded-2xl shadow-lg overflow-hidden flex-shrink-0 group"
            >
              <img
                src={Luxurycar.img}
                alt={Luxurycar.name}
                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
              />

              <div className="p-4 text-center">
                <h3 className="font-semibold text-lg">{Luxurycar.name}</h3>
                <p className="text-gray-600 text-sm">{Luxurycar.desc}</p>
              </div>
            </div>
          ))}

        </div>

      </section>


      {/* ================= QUICK BOOKING ================= */}
      <section id="booking" className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10">
          Quick Booking
        </h2>

        <div className="grid md:grid-cols-3 gap-6 ">

          <input
            className="border p-3 rounded-lg placeholder-black "
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="border p-3 rounded-lg placeholder-black"
            placeholder="Mobile Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          {/* <div className="md:col-span-2"> */}
          <LocationInputs
            pickup={pickup}
            setPickup={setPickup}
            drop={drop}
            setDrop={setDrop}
          />
          <RouteFare pickup={pickup} drop={drop} />


          {/* </div> */}
        

          <select 
            className="border p-3 rounded-lg"
            value={tripType}
            onChange={(e) => setTripType(e.target.value)}
          >
            <option value="">Trip Type</option>
            <option>One Day</option>
            <option>3 Day</option>
            <option>5 Day</option>
            <option>Outstation</option>
          </select>

          <select
            className="border p-3 rounded-lg"
            value={carType}
            onChange={(e) => setCarType(e.target.value)}
          >
            <option value="">Car Type</option>
            <option>Sedan</option>
            <option>SUV</option>
            <option>Luxury</option>
          </select>

         

          <input
            type="datetime-local"
            className="border p-3 rounded-lg md:col-span-3"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
          />

          <button
            className="bg-yellow-500 text-white py-3 rounded-lg md:col-span-3 font-bold hover:bg-blue-800 transition cursor-pointer "
            onClick={submitBooking}
          >
            Submit Booking Request
          </button>

        </div>
      </section>


      {/* ================= SERVICES ================= */}
      <section className="py-24 px-6 bg-gradient-to-br from-indigo-100 via-white to-blue-100">

        <h2 className="text-4xl font-bold text-center mb-16">
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

    <h2 className="text-4xl font-bold mb-12">
      Why Choose Us
    </h2>

    <div className="grid md:grid-cols-3 gap-8">

      {/* SAFE & RELIABLE */}
      <div className="bg-white p-8 rounded-2xl shadow hover:shadow-xl transition">
        <div className="text-4xl mb-4">🛡️</div>
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
        <div className="text-4xl mb-4">⏱️</div>
        <h3 className="text-xl font-semibold mb-2">
          Always On Time
        </h3>
        <p className="text-gray-600">
          We value your time and guarantee punctual pickups and
          timely drop-offs for every trip.
        </p>
      </div>

      {/* AFFORDABLE PRICING */}
      <div className="bg-white p-8 rounded-2xl shadow hover:shadow-xl transition">
        <div className="text-4xl mb-4">💰</div>
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
        <div className="text-4xl mb-4">📞</div>
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
        <div className="text-4xl mb-4">✨</div>
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
        <div className="text-4xl mb-4">🌍</div>
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
        <p>Phone: +91 99999 99999</p>
        <p>Email: info@rathodcabs.com</p>
      </footer>

    </div>
  );
};

export default HomePage;
