import { MapContainer, TileLayer, Marker, Polyline,useMap } from "react-leaflet";
import { useState } from "react";
import { useEffect } from "react";
import L from "leaflet";

export default function RouteFare({ pickup, drop, dateTime }) { // Assuming dateTime is passed as a prop
  const [route, setRoute] = useState([]);
  const [distance, setDistance] = useState(null);
  const [fare, setFare] = useState(null);
  const [loading, setLoading] = useState(false);

const geocode = async (place) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json&limit=1`,
      {
        headers: {
          "User-Agent": "RathodCabsApp/1.0", // Nominatim requires this to prevent blocks
        },
      }
    );
    
    if (!res.ok) throw new Error("Network response was not ok");
    
    const data = await res.json();
    if (!data.length) return null;
    return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  } catch (error) {
    console.error("Geocoding failed:", error);
    return null;
  }
};

  function RecenterMap({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [positions, map]);
  return null;
}

  const calculateRoute = async () => {
    // 1. Check for Empty Fields
    if (!pickup || !pickup.trim()) {
      alert("📍 Please enter a Pickup location.");
      return;
    }
    if (!drop || !drop.trim()) {
      alert("🏁 Please enter a Drop location.");
      return;
    }
    if (!dateTime) {
      alert("📅 Please select a Date and Time.");
      return;
    }

    // 2. Check for Past Date/Time
    const now = new Date();
    const selectedDate = new Date(dateTime);
    if (selectedDate < now) {
      alert("⚠️ You cannot book for a past date or time. Please select a future time.");
      return;
    }

    setLoading(true);

    try {
      const start = await geocode(pickup);
      const end = await geocode(drop);

      if (!start || !end) {
        alert("❌ Could not find one of the locations. Please be more specific.");
        setLoading(false);
        return;
      }

      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`
      );

      const data = await res.json();

      if (data.routes && data.routes.length > 0) {
        const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        const distKm = data.routes[0].distance / 1000;

        setRoute(coords);
        setDistance(distKm.toFixed(1));
        const pricePerKm = 15;
        setFare((distKm * pricePerKm).toFixed(0));
      } else {
        alert("🚗 No driving route found between these locations.");
      }
    } catch (error) {
      console.error("Error fetching route:", error);
      alert("🔌 Connection error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <button
        onClick={calculateRoute}
        disabled={loading}
        className={`${
          loading ? "bg-gray-300 cursor-not-allowed" : "bg-yellow-400 hover:bg-yellow-500 cursor-pointer"
        } px-4 py-2 rounded font-semibold transition-colors w-full flex justify-center items-center`}
      >
        {loading ? (
          <>
            <span className="animate-spin mr-2">🌀</span> Calculating...
          </>
        ) : (
          "Show Route & Fare"
        )}
      </button>

      {/* Progress Bar */}
      {loading && (
        <div className="w-full bg-gray-200 h-1 mt-4 overflow-hidden rounded">
          <div className="bg-yellow-500 h-full origin-left" style={{ animation: 'progress 2s ease-in-out infinite', width: '100%' }}></div>
        </div>
      )}

      {distance && !loading && (
        <div className="mt-4 bg-white p-4 rounded shadow border-l-4 border-yellow-400">
          <p className="text-gray-700 font-medium">📏 Distance: <span className="font-bold">{distance} km</span></p>
          <p className="text-gray-700 font-medium">💰 Estimated Fare: <span className="font-bold text-green-600">₹{fare}</span></p>
        </div>
      )}

{route.length > 0 && !loading && (
  <div className="w-full h-[400px] mt-4 relative z-0 overflow-hidden rounded-lg shadow-inner border border-gray-200">
    <MapContainer
      center={route[0]}
      zoom={11}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer 
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
      />
      <RecenterMap positions={route} />
      <Marker position={route[0]} />
      <Marker position={route[route.length - 1]} />
      <Polyline positions={route} color="#3b82f6" weight={5} opacity={0.7} />
    </MapContainer>
  </div>
)}
    </div>
  );
}