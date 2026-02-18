import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import { useState } from "react";

export default function RouteFare({ pickup, drop }) {

  const [route, setRoute] = useState([]);
  const [distance, setDistance] = useState(null);
  const [fare, setFare] = useState(null);

  const geocode = async (place) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${place}&format=json&limit=1`
    );
    const data = await res.json();

    if (!data.length) return null;

    return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  };

  const calculateRoute = async () => {

    if (!pickup || !drop) return;

    const start = await geocode(pickup);
    const end = await geocode(drop);

    if (!start || !end) return;

    // OSRM Routing API (FREE)
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`
    );

    const data = await res.json();

    const coords = data.routes[0].geometry.coordinates.map(
      ([lng, lat]) => [lat, lng]
    );

    const distKm = data.routes[0].distance / 1000;

    setRoute(coords);
    setDistance(distKm.toFixed(1));

    // 💰 Example fare calculation
    const pricePerKm = 15;
    setFare((distKm * pricePerKm).toFixed(0));
  };

  return (
    <div className="mt-6">

      <button
        onClick={calculateRoute}
        className="bg-yellow-400 px-4 py-2 rounded font-semibold cursor-pointer hover:bg-yellow-500"
      >
        Show Route & Fare
      </button>

      {distance && (
        <div className="mt-4 bg-white p-4 rounded shadow">
          <p>📏 Distance: {distance} km</p>
          <p>💰 Estimated Fare: ₹{fare}</p>
        </div>
      )}

      {route.length > 0 && (
        <MapContainer
          center={route[0]}
          zoom={11}
          style={{ height: "400px", marginTop: "15px" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker position={route[0]} />
          <Marker position={route[route.length - 1]} />

          <Polyline positions={route} color="blue" />
        </MapContainer>
      )}

    </div>
  );
}
