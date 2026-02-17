import { useState } from "react";

const HeroBooking = () => {
  const [tripType, setTripType] = useState("airport");
  const [tab, setTab] = useState("cabs");

  return (
    <section className="relative h-screen text-white">

      {/* BACKGROUND IMAGE */}
      <img
        src="https://images.unsplash.com/photo-1502877338535-766e1452684a"
        alt="cab"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 to-black/70"></div>

      {/* CONTENT */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">

        {/* TAGLINE */}
        <h2 className="text-5xl font-bold mb-4">
          Rathod Cabs & Travels
        </h2>

        <p className="text-xl mb-8">
          Rathod on Board, Comfort on Road
        </p>

        {/* TABS */}
        <div className="flex bg-white/20 rounded-full p-1 mb-6">
          <button
            onClick={() => setTab("cabs")}
            className={`px-6 py-2 rounded-full font-semibold ${
              tab === "cabs"
                ? "bg-blue-600 text-white"
                : "text-white"
            }`}
          >
            Cabs
          </button>

          <button
            onClick={() => setTab("self")}
            className={`px-6 py-2 rounded-full font-semibold ${
              tab === "self"
                ? "bg-blue-600 text-white"
                : "text-white"
            }`}
          >
            Self Drive
          </button>
        </div>

        {/* TRIP OPTIONS */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">

          {[
            ["airport", "Airport"],
            ["oneway", "Outstation One-Way"],
            ["round", "Outstation Round-Trip"],
            ["hourly", "Hourly Rental"]
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setTripType(value)}
              className={`px-4 py-2 rounded-full border ${
                tripType === value
                  ? "bg-blue-600 border-blue-600"
                  : "bg-white text-black"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* BOOKING FORM */}
        <div className="bg-white text-black rounded-xl shadow-xl p-4 w-full max-w-5xl">

          <div className="grid md:grid-cols-5 gap-3">

            <input
              type="text"
              placeholder="From"
              className="p-3 border rounded"
            />

            <input
              type="text"
              placeholder="To"
              className="p-3 border rounded"
            />

            <input
              type="date"
              className="p-3 border rounded"
            />

            <input
              type="time"
              className="p-3 border rounded"
            />

            <button className="bg-gray-400 text-white rounded font-bold">
              GO
            </button>

          </div>
        </div>

        {/* TRUST POINTS */}
        <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm">

          <span>✔ Guaranteed Rides</span>
          <span>✔ 24×7 Customer Support</span>
          <span>✔ Free Cancellation</span>
          <span>✔ Verified Drivers</span>

        </div>

      </div>
    </section>
  );
};

export default HeroBooking;