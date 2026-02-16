import React from "react";
import { useNavigate } from "react-router-dom";

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





const HomePage = () => {
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
    { name: "Honda Amaze", desc: "Premium & Comfortable", img:HondaAmaze },
    { name: "Tata Tigor", desc: "Stylish & Reliable", img: TataTigor },
  ];
  const LuxuryCars = [
   {name: "Mercedes-Benz S-Class", desc: "Luxury & Performance", img:MercedesBenzSClass },
   {name: "Range Rover", desc: "Elegant & Powerful", img:RangeRover },
   {name: "BMW", desc: "Sophisticated & Comfortable", img:BMW },
   {name: "Audi", desc: "Luxury & Reliability", img: Audi },
   {name: " Volvo XC90", desc: "Stylish & Dynamic", img: VolvoXC90 },
  ]


  return (

   
    <div className="w-full min-h-screen bg-gray-50">
      <div className="absolute top-6 right-6 z-50">
</div>


      {/* ================= HERO SECTION ================= */}
      <section className="relative h-screen flex items-center justify-center text-white overflow-hidden">

        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center animate-[zoom_20s_linear_infinite]"
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
        </div>
      </section>

      {/* ================= SUV SHOWCASE ================= */}
      <section className="py-16 px-6 bg-white">
  <h2 className="text-3xl font-bold text-center mb-12">
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
<section className=" py-16 px-6  bg-white">
  <h2 className="text-3xl font-bold text-center mb-12">
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
<section className=" py-16 px-6  bg-white">
  <h2 className="text-3xl font-bold text-center mb-12">
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

        <div className="grid md:grid-cols-3 gap-6">
          <input className="border p-3 rounded-lg" placeholder="Name" />
          <input className="border p-3 rounded-lg" placeholder="Mobile Number" />
          <input className="border p-3 rounded-lg" placeholder="Pickup Location" />
          <input className="border p-3 rounded-lg" placeholder="Drop Location" />

          <select className="border p-3 rounded-lg">
            <option>Trip Type</option>
            <option>One Day</option>
            <option>3 Day</option>
            <option>5 Day</option>
            <option>Outstation</option>
          </select>

          <select className="border p-3 rounded-lg">
            <option>Car Type</option>
            <option>Sedan</option>
            <option>SUV</option>
            <option>Luxury</option>
          </select>

          <input
            type="datetime-local"
            className="border p-3 rounded-lg md:col-span-3"
          />

          <button className="bg-blue-700 text-white py-3 rounded-lg md:col-span-3 hover:bg-blue-800 transition">
            Submit Booking Request
          </button>
        </div>
      </section>

      {/* ================= SERVICES ================= */}
      <section className="bg-gray-100 py-16 px-6">
        <h2 className="text-3xl font-bold text-center mb-12">
          Our Services
        </h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto text-center">
          {[
            "Outstation Cab",
            "Corporate Travel",
            "Airport Transfers",
          ].map((service, index) => (
            <div
              key={index}
              className="p-6 bg-white shadow-lg rounded-xl"
            >
              <h3 className="text-xl font-semibold mb-2">
                {service}
              </h3>
              <p>
                Reliable, safe and comfortable travel experience.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-indigo-900 text-white py-8 px-6 text-center">
        <p className="font-semibold">
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
