import React from "react";
import { useParams, Link } from "react-router-dom";
import jsPDF from "jspdf";
import { ArrowLeft } from "lucide-react";

function Invoice() {
  const { id } = useParams();

  // Dummy Trip Data (Later fetch from Firebase)
  const trip = {
    id,
    customer: "Samarth Hatte",
    from: "Solapur",
    to: "Pune",
    fare: "₹2200",
    date: "10 Feb 2026",
  };

  // PDF Generator
  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Rathod Cabs & Travels Invoice", 20, 20);

    doc.setFontSize(12);
    doc.text(`Invoice ID: ${trip.id}`, 20, 40);
    doc.text(`Customer: ${trip.customer}`, 20, 50);
    doc.text(`Trip Route: ${trip.from} → ${trip.to}`, 20, 60);
    doc.text(`Date: ${trip.date}`, 20, 70);
    doc.text(`Fare Paid: ${trip.fare}`, 20, 80);

    doc.text("Thank you for travelling with us 🚖", 20, 110);

    doc.save(`invoice_trip_${trip.id}.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-10">
      <Link
        to="/history"
        className="text-slate-400 hover:text-white flex items-center gap-2 mb-6"
      >
        <ArrowLeft size={18} /> Back to Trips
      </Link>

      <div className="max-w-xl bg-slate-800/40 border border-slate-700 rounded-2xl p-8">
        <h1 className="text-2xl font-bold mb-4 text-blue-400">
          Invoice Details
        </h1>

        <p className="text-slate-300">Trip ID: {trip.id}</p>
        <p className="text-slate-300">Customer: {trip.customer}</p>
        <p className="text-slate-300">
          Route: {trip.from} → {trip.to}
        </p>
        <p className="text-slate-300">Date: {trip.date}</p>
        <p className="text-slate-300 font-bold text-lg mt-2">
          Fare: {trip.fare}
        </p>

        <button
          onClick={downloadPDF}
          className="mt-6 w-full bg-green-600 hover:bg-green-700 py-3 rounded-xl font-semibold"
        >
          Download PDF Invoice 🧾
        </button>
      </div>
    </div>
  );
}

export default Invoice;
