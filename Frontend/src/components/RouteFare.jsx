import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap
} from "react-leaflet";
import { useState, useEffect } from "react";
import L from "leaflet";


// ================= FIX MARKER ICON =================
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});


// ================= AUTO FIT ROUTE =================
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


// ================= FIX TILE CUT ISSUE =================
function FixMapSize() {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [map]);

  return null;
}


// ================= MAIN COMPONENT =================
export default function RouteFare({ pickup, drop, dateTime,onFareCalculated }) {
  const [route, setRoute] = useState([]);
  const [distance, setDistance] = useState(null);
  const [fare, setFare] = useState(null);
  const [loading, setLoading] = useState(false);


  // ================= GEOCODE =================
  const geocode = async (place) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        place
      )}&format=json&limit=1`
    );

    const data = await res.json();
    if (!data.length) return null;

    return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  };


  // ================= ROUTE CALCULATION =================
  const calculateRoute = async () => {
    if (!pickup || !drop) {
      alert("Enter pickup and drop locations");
      return;
    }

    if (!dateTime) {
      alert("Select date & time");
      return;
    }

    const selectedDate = new Date(dateTime);
    if (selectedDate < new Date()) {
      alert("Cannot book past time");
      return;
    }

    setLoading(true);

    try {
      const start = await geocode(pickup);
      const end = await geocode(drop);

      if (!start || !end) {
        alert("Location not found");
        setLoading(false);
        return;
      }

      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`
      );

      const data = await res.json();

      if (!data.routes?.length) {
        alert("No route found");
        setLoading(false);
        return;
      }

      const coords = data.routes[0].geometry.coordinates.map(
        ([lng, lat]) => [lat, lng]
      );

      const distKm = data.routes[0].distance / 1000;

setRoute(coords);
setDistance(distKm.toFixed(1));

const pricePerKm = 10;
const calculatedFare = distKm * pricePerKm;

setFare(calculatedFare.toFixed(0));

// ⭐ SEND TO BOOKING PAGE
if (onFareCalculated) {
  onFareCalculated({
    distance: distKm,
    fare: calculatedFare
  });
}

    } catch (err) {
      alert("Error fetching route");
      console.error(err);
    }

    setLoading(false);
  };


  // ================= UI =================
  return (
    <div className="mt-6">

      <button
        onClick={calculateRoute}
        disabled={loading}
        className={`w-full px-4 py-2 rounded font-semibold transition
        ${
          loading
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-yellow-400 hover:bg-yellow-500"
        }`}
      >
        {loading ? "Calculating..." : "Show Route & Fare"}
      </button>


      {/* RESULT CARD */}
      {distance && !loading && (
        <div className="mt-4 bg-white p-4 rounded shadow border-l-4 border-yellow-400">
          <p>📏 Distance: <b>{distance} km</b></p>
          <p>💰 Estimated Fare: <b className="text-green-600">₹{fare}</b></p>
        </div>
      )}


      {/* MAP */}
      {route.length > 0 && !loading && (
        <div className="w-full h-[420px] mt-4 rounded-lg overflow-hidden shadow border">

          <MapContainer
            center={route[0]}
            zoom={11}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%" }}
          >

            <TileLayer
              attribution="&copy; OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <FixMapSize />
            <RecenterMap positions={route} />

            <Marker position={route[0]} />
            <Marker position={route[route.length - 1]} />

            <Polyline
              positions={route}
              color="#3b82f6"
              weight={5}
              opacity={0.8}
            />

          </MapContainer>

        </div>
      )}

    </div>
  );
}