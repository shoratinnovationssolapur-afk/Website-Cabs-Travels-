import React from "react";
import { Link } from "react-router-dom";
import { CarTaxiFront, ArrowLeft } from "lucide-react";

function TripHistory() {
  // Dummy Trip Data (Later you can fetch from Firebase)
  const trips = [
    {
      id: 1,
      from: "Solapur",
      to: "Pune",
      date: "10 Feb 2026",
      fare: "₹2200",
      status: "Completed",
    },
    {
      id: 2,
      from: "Osmanabad",
      to: "Mumbai",
      date: "05 Feb 2026",
      fare: "₹4500",
      status: "Completed",
    },
    {
      id: 3,
      from: "Solapur",
      to: "Hyderabad",
      date: "28 Jan 2026",
      fare: "₹5200",
      status: "Cancelled",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <Link
          to="/profile"
          className="text-slate-400 hover:text-white transition"
        >
          <ArrowLeft />
        </Link>

        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CarTaxiFront className="text-yellow-400" />
          Trip History
        </h1>
      </div>

      {/* Trips List */}
      <div className="space-y-6 max-w-4xl">
        {trips.map((trip) => (
          <div
            key={trip.id}
            className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 flex justify-between items-center"
          >
            <div>
              <h2 className="text-xl font-semibold">
                {trip.from} → {trip.to}
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Date: {trip.date}
              </p>
              <p className="text-slate-500 text-sm">
                Status:{" "}
                <span
                  className={`font-semibold ${
                    trip.status === "Completed"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {trip.status}
                </span>
              </p>
            </div>

            <div className="text-right">
              <p className="text-lg font-bold text-blue-400">{trip.fare}</p>

              {/* Invoice Button */}
              <Link
                to={`/invoice/${trip.id}`}
                className="mt-2 inline-block bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl text-sm font-semibold"
              >
                Download Invoice
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TripHistory;
