import { useState } from "react";

export default function LocationInputs({
    pickup,
  setPickup,
  drop,
  setDrop
}) {
  

  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropSuggestions, setDropSuggestions] = useState([]);

  // 🔍 Search address
  let timer;

const searchLocation = (query, setResults) => {
  clearTimeout(timer);

  timer = setTimeout(async () => {
    if (!query) return;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${query}&format=json&addressdetails=1&limit=5`,
        {
          headers: {
            "Accept-Language": "en"
          }
        }
      );

      const data = await res.json();
      setResults(data);

    } catch (err) {
      console.log("Location fetch error:", err);
    }
  }, 500); // wait 500ms after typing stops
};


  // 📍 Get current location
  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );

      const data = await res.json();
      setPickup(data.display_name);
    });
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">

      {/* PICKUP */}
      <div className="relative">

        <input
          value={pickup}
          onChange={(e) => {
            setPickup(e.target.value);
            searchLocation(e.target.value, setPickupSuggestions);
          }}
          placeholder="Pickup Location"
          className="border p-3 rounded-lg w-full"
        />

        {/* Suggestions */}
        {pickupSuggestions.length > 0 && (
          <div className="absolute bg-white border w-full max-h-40 overflow-y-auto z-10">
            {pickupSuggestions.map((place, i) => (
              <div
                key={i}
                onClick={() => {
                  setPickup(place.display_name);
                  setPickupSuggestions([]);
                }}
                className="p-2 hover:bg-gray-200 cursor-pointer"
              >
                {place.display_name}
              </div>
            ))}
          </div>
        )}

        <button
          onClick={getCurrentLocation}
          className="text-blue-600 text-sm mt-1"
        >
          📍 Use current location
        </button>

      </div>

      {/* DROP */}
      <div className="relative">

        <input
          value={drop}
          onChange={(e) => {
            setDrop(e.target.value);
            searchLocation(e.target.value, setDropSuggestions);
          }}
          placeholder="Drop Location"
          className="border p-3 rounded-lg w-full"
        />

        {/* Suggestions */}
        {dropSuggestions.length > 0 && (
          <div className="absolute bg-white border w-full max-h-40 overflow-y-auto z-10">
            {dropSuggestions.map((place, i) => (
              <div
                key={i}
                onClick={() => {
                  setDrop(place.display_name);
                  setDropSuggestions([]);
                }}
                className="p-2 hover:bg-gray-200 cursor-pointer"
              >
                {place.display_name}
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}
