import React from "react";
import { Link } from "react-router-dom";
import { MapPin, CalendarDays, CarTaxiFront } from "lucide-react";

function TourPackagesPage() {
  const packages = [
    {
      title: "City Local Tour",
      duration: "4 Hours / 40 KM",
      price: "₹999",
      features: [
        "AC Cab Included",
        "Multiple Stops Allowed",
        "Best for Shopping & City Travel",
      ],
    },
    {
      title: "Heritage & Temple Tour",
      duration: "Full Day Tour",
      price: "₹2499",
      features: [
        "Visit Famous Temples",
        "Safe & Verified Drivers",
        "Flexible Tour Schedule",
      ],
    },
    {
      title: "Weekend Getaway Package",
      duration: "2 Days / 1 Night",
      price: "₹6999",
      features: [
        "Outstation Cab Included",
        "Hotel Pickup & Drop",
        "Perfect for Couples & Groups",
      ],
    },
    {
      title: "Hill Station Tour",
      duration: "3 Days Tour",
      price: "₹11999",
      features: [
        "SUV Recommended",
        "Mountain Route Experts",
        "Sightseeing Spots Covered",
      ],
    },
    {
      title: "Luxury Family Holiday",
      duration: "5 Days Tour",
      price: "₹24999",
      features: [
        "Innova / Luxury SUV",
        "Dedicated Chauffeur",
        "Premium Comfort Experience",
      ],
    },
    {
      title: "Airport + Tour Combo",
      duration: "Pickup + Full Day Tour",
      price: "₹3999",
      features: [
        "Airport Transfer Included",
        "Corporate Friendly",
        "Professional Drivers",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white py-16 px-6">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-extrabold text-blue-400 mb-4">
          Tour Packages 🚖✨
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Explore our best travel packages designed for comfort, safety, and
          unforgettable journeys.
        </p>
      </div>

      {/* Packages Grid */}
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-10">
        {packages.map((pkg, index) => (
          <div
            key={index}
            className="bg-slate-800/40 border border-slate-700 rounded-3xl p-8 hover:scale-105 transition duration-300"
          >
            {/* Title */}
            <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
              <MapPin className="text-yellow-400" />
              {pkg.title}
            </h2>

            {/* Duration */}
            <p className="text-slate-400 flex items-center gap-2 mb-3">
              <CalendarDays size={18} className="text-green-400" />
              {pkg.duration}
            </p>

            {/* Price */}
            <p className="text-3xl font-extrabold text-blue-400 mb-6">
              {pkg.price}
            </p>

            {/* Features */}
            <ul className="space-y-2 text-slate-300 mb-6">
              {pkg.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CarTaxiFront size={18} className="text-emerald-400" />
                  {feature}
                </li>
              ))}
            </ul>

            {/* Book Button */}
            <button className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-semibold transition">
              Book This Tour 🚖
            </button>
          </div>
        ))}
      </div>

      {/* Custom Package CTA */}
      <div className="text-center mt-20 bg-slate-800/40 border border-slate-700 rounded-3xl max-w-4xl mx-auto p-10">
        <h2 className="text-3xl font-bold mb-4 text-green-400">
          Want a Custom Tour Package?
        </h2>
        <p className="text-slate-400 mb-6">
          We provide customized travel plans for weddings, corporate events,
          family trips, and long vacations.
        </p>

        <Link
          to="/aboutus"
          className="bg-green-600 hover:bg-green-700 px-10 py-3 rounded-xl font-semibold transition"
        >
          Contact Us 📞
        </Link>
      </div>
    </div>
  );
}

export default TourPackagesPage;
