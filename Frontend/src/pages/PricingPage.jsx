import React from "react";
import { CheckCircle } from "lucide-react";

function PricingPage() {
  const plans = [
    {
      title: "Standard Ride",
      price: "₹499",
      duration: "/Trip",
      features: ["Local City Rides", "Comfortable Cars", "24/7 Support"],
      popular: false,
    },
    {
      title: "Business Class",
      price: "₹999",
      duration: "/Trip",
      features: [
        "Executive Vehicles",
        "Professional Chauffeur",
        "Free Wi-Fi",
        "Bottled Water",
      ],
      popular: true,
    },
    {
      title: "Luxury Tour",
      price: "₹4999",
      duration: "/Day",
      features: ["Full Day Trips", "Luxury SUVs", "Guided Tours", "Refreshments"],
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white py-16 px-6">
      {/* Header */}
      <div className="text-center mb-14">
        <h1 className="text-4xl font-bold mb-3 text-blue-400">
          Choose Your Plan 🚖
        </h1>
        <p className="text-slate-400 text-lg">
          Affordable pricing for all your travel needs
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`relative bg-slate-800/40 border border-slate-700 rounded-2xl p-8 shadow-lg hover:scale-105 transition-transform duration-300 ${
              plan.popular ? "border-blue-500" : ""
            }`}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <span className="absolute top-4 right-4 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                Most Popular
              </span>
            )}

            {/* Title */}
            <h2 className="text-2xl font-semibold mb-4">{plan.title}</h2>

            {/* Price */}
            <p className="text-4xl font-bold text-blue-400 mb-6">
              {plan.price}{" "}
              <span className="text-lg text-slate-400">{plan.duration}</span>
            </p>

            {/* Features */}
            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-slate-300">
                  <CheckCircle className="text-green-400" size={18} />
                  {feature}
                </li>
              ))}
            </ul>

            {/* Button */}
            <button className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-semibold transition">
              Choose Plan
            </button>
          </div>
        ))}
      </div>

      {/* Contact Section */}
      <div className="text-center mt-16">
        <h2 className="text-xl text-slate-300 mb-2">
          Need a custom package?
        </h2>
        <p className="text-slate-500 mb-6">
          Contact us for special travel plans and discounts!
        </p>

        <button className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-xl font-semibold transition">
          Get in Touch 📞
        </button>
      </div>
    </div>
  );
}

export default PricingPage;
