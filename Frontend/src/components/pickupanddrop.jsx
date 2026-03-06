import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";

export default function LocationInputs({ pickup, setPickup, drop, setDrop }) {
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropSuggestions, setDropSuggestions] = useState([]);

  let timer;
  const searchLocation = (query, setResults) => {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      if (!query) return;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${query}&format=json&addressdetails=1&limit=5`,
          { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.log("Location fetch error:", err);
      }
    }, 500);
  };

  const handleSwap = () => {
    const temp = pickup;
    setPickup(drop);
    setDrop(temp);
  };

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      const data = await res.json();
      const newPickup = data.display_name;

      if (newPickup === drop) {
        alert("Pickup location cannot be the same as the Drop location.");
      } else {
        setPickup(newPickup);
      }
    });
  };

  return (
    <div className="relative w-full space-y-3">
      <div className="relative w-full">
        <input
          value={pickup}
          onChange={(e) => {
            setPickup(e.target.value);
            searchLocation(e.target.value, setPickupSuggestions);
          }}
          placeholder="Pickup Location"
          className="border p-3 rounded-lg w-full h-11 placeholder-black"
        />
        {pickupSuggestions.length > 0 && (
          <div className="absolute bg-white border w-full max-h-40 overflow-y-auto z-20 shadow-lg mt-1 rounded-lg">
            {pickupSuggestions.map((place, i) => (
              <div
                key={i}
                onClick={() => {
                  if (place.display_name === drop) {
                    alert("Pickup cannot be the same as Drop location.");
                  } else {
                    setPickup(place.display_name);
                    setPickupSuggestions([]);
                  }
                }}
                className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
              >
                {place.display_name}
              </div>
            ))}
          </div>
        )}
        <button onClick={getCurrentLocation} className="text-blue-600 text-xs mt-1 block">
          Use current location
        </button>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleSwap}
          className="bg-gray-100 p-2 rounded-full hover:bg-yellow-400 transition-colors shadow-sm z-10"
          title="Swap Locations"
        >
          <ArrowLeftRight size={20} className="text-gray-700 hover:text-black rotate-90" />
        </button>
      </div>

      <div className="relative w-full">
        <input
          value={drop}
          onChange={(e) => {
            setDrop(e.target.value);
            searchLocation(e.target.value, setDropSuggestions);
          }}
          placeholder="Drop Location"
          className="border p-3 rounded-lg w-full h-11 placeholder-black"
        />
        {dropSuggestions.length > 0 && (
          <div className="absolute bg-white border w-full max-h-40 overflow-y-auto z-20 shadow-lg mt-1 rounded-lg">
            {dropSuggestions.map((place, i) => (
              <div
                key={i}
                onClick={() => {
                  if (place.display_name === pickup) {
                    alert("Drop location cannot be the same as Pickup location.");
                  } else {
                    setDrop(place.display_name);
                    setDropSuggestions([]);
                  }
                }}
                className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
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
