import React from "react";
import { Link } from "react-router-dom";

import {
  CarTaxiFront,
  MapPin,
  Plane,
  Briefcase,
  Users,
  Clock,
} from "lucide-react";

function ServicesPage() {
  const services = [
    {
      title: "Local City Rides",
      desc: "Quick and affordable rides within the city anytime.",
      icon: <CarTaxiFront size={34} className="text-yellow-400" />,
    },
    {
      title: "Outstation Trips",
      desc: "Comfortable long-distance travel with best pricing packages.",
      icon: <MapPin size={34} className="text-blue-400" />,
    },
    {
      title: "Airport Pickup & Drop",
      desc: "On-time airport transfers with tracking and support.",
      icon: <Plane size={34} className="text-green-400" />,
    },
    {
      title: "Corporate Travel",
      desc: "Business-class rides for offices, meetings and events.",
      icon: <Briefcase size={34} className="text-purple-400" />,
    },
    {
      title: "Family & Group Tours",
      desc: "Spacious vehicles for group trips, weddings & tours.",
      icon: <Users size={34} className="text-pink-400" />,
    },
    {
      title: "24/7 Availability",
      desc: "Day or night, we are always ready to serve you.",
      icon: <Clock size={34} className="text-red-400" />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white py-16 px-6">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-extrabold text-blue-400 mb-4">
          Our Services 🚖
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Rathod Cabs & Travels provides safe, reliable and affordable travel
          solutions for every journey.
        </p>
      </div>

      {/* Services Grid */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-10">
        {services.map((service, index) => (
          <div
            key={index}
            className="bg-slate-800/40 border border-slate-700 rounded-3xl p-8 hover:scale-105 transition duration-300"
          >
            <div className="mb-5">{service.icon}</div>

            <h2 className="text-xl font-bold mb-3">{service.title}</h2>

            <p className="text-slate-400 leading-relaxed">{service.desc}</p>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="text-center mt-20">
        <h2 className="text-2xl font-semibold mb-3">
          Ready to Book Your Ride?
        </h2>
        <p className="text-slate-500 mb-6">
          Explore pricing or contact us for custom travel packages.
        </p>

        <div className="flex justify-center gap-6">
          <Link
            to="/pricing"
            className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-xl font-semibold transition"
          >
            View Pricing 💰
          </Link>

          <Link
            to="/aboutus"
            className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-xl font-semibold transition"
          >
            Contact Us 📞
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ServicesPage;
