import React from "react";

const RentCarPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-6">

      {/* Title */}
      <h1 className="text-4xl font-bold text-center mb-4">
        Rent Your Car With Us
      </h1>

      <p className="text-center text-gray-600 mb-10">
        Earn money by listing your vehicle on Rathod Cabs & Travels
      </p>

      {/* Form */}
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg">

        <form className="grid md:grid-cols-2 gap-6">

          {/* Owner Details */}
          <input
            type="text"
            placeholder="Owner Name"
            className="border p-3 rounded-lg"
          />

          <input
            type="tel"
            placeholder="Mobile Number"
            className="border p-3 rounded-lg"
          />

          {/* Car Details */}
          <input
            type="text"
            placeholder="Car Brand & Model (e.g. Innova Crysta)"
            className="border p-3 rounded-lg"
          />

          <input
            type="number"
            placeholder="Year of Manufacture"
            className="border p-3 rounded-lg"
          />

          <input
            type="text"
            placeholder="Vehicle Registration Number"
            className="border p-3 rounded-lg"
          />

          <select className="border p-3 rounded-lg">
            <option>Fuel Type</option>
            <option>Petrol</option>
            <option>Diesel</option>
            <option>CNG</option>
            <option>Electric</option>
          </select>

          <select className="border p-3 rounded-lg">
            <option>Transmission</option>
            <option>Manual</option>
            <option>Automatic</option>
          </select>

          <input
            type="number"
            placeholder="Seating Capacity"
            className="border p-3 rounded-lg"
          />

          {/* Pricing */}
          <input
            type="number"
            placeholder="Expected Price per Day (₹)"
            className="border p-3 rounded-lg"
          />

          {/* Availability */}
          <input
            type="text"
            placeholder="Available Location (City)"
            className="border p-3 rounded-lg"
          />

          {/* Image Upload */}
          <div className="md:col-span-2">
            <label className="block mb-2 font-semibold">
              Upload Car Photos
            </label>
            <input type="file" multiple className="border p-3 rounded-lg w-full" />
          </div>

          {/* Additional Info */}
          <textarea
            placeholder="Additional Details (optional)"
            className="border p-3 rounded-lg md:col-span-2"
            rows={4}
          ></textarea>

          {/* Submit Button */}
          <button className="bg-yellow-400 text-black py-3 rounded-lg font-semibold md:col-span-2 hover:bg-yellow-500 transition">
            Submit Car for Approval
          </button>

        </form>
      </div>
    </div>
  );
};

export default RentCarPage;
