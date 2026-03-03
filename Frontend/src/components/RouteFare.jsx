import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap
} from "react-leaflet";
import L from "leaflet";
import { forwardRef, useImperativeHandle,useState, useEffect} from "react"; // Add these imports


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
// ... (keep your Icon and Helper components at the top as they are)

const RouteFare = forwardRef(({ pickup, drop, dateTime, onFareCalculated }, ref) => {
  const [route, setRoute] = useState([]);
  const [distance, setDistance] = useState(null);
  const [fare, setFare] = useState(null);
  const [loading, setLoading] = useState(false);

  useImperativeHandle(ref, () => ({
    triggerCalculation: async () => { 
      return await calculateRoute(); 
    }
  }));

  const geocode = async (place) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json&limit=1`
      );
      const data = await res.json();
      if (!data.length) return null;
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    } catch (e) {
      return null;
    }
  };

  const calculateRoute = async () => {
    if (!pickup || !drop) {
      alert("Enter pickup and drop locations");
      return null;
    }

    setLoading(true);

    try {
      const start = await geocode(pickup);
      const end = await geocode(drop);

      if (!start || !end) {
        alert("Location not found. Please try a more specific address.");
        setLoading(false); // ⭐ Stop loading
        return null;
      }

      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`
      );

      const data = await res.json();

      if (!data.routes?.length) {
        alert("No route found between these points.");
        setLoading(false); // ⭐ Stop loading
        return null;
      }

      const coords = data.routes[0].geometry.coordinates.map(
        ([lng, lat]) => [lat, lng]
      );

      const distKm = data.routes[0].distance / 1000;
      const pricePerKm = 10;
      const calculatedFare = distKm * pricePerKm;

      // Update internal state for UI
      setRoute(coords);
      setDistance(distKm.toFixed(1));
      setFare(calculatedFare.toFixed(0));

      // SEND TO PARENT
      if (onFareCalculated) {
        onFareCalculated({
          distance: distKm,
          fare: calculatedFare
        });
      }

      setLoading(false); // ⭐ Stop loading on success
      return { distance: distKm, fare: calculatedFare };

    } catch (err) {
      alert("Error fetching route. Please check your internet.");
      console.error(err);
      setLoading(false); // ⭐ Stop loading on error
      return null;
    }
  };

  return (
    <div className="mt-6 h-full flex flex-col">
      {/* TRIGGER BUTTON */}
      <button
        onClick={calculateRoute}
        disabled={loading}
        className={`w-full px-4 py-3 rounded-xl font-bold transition shadow-sm mb-4
        ${loading ? "bg-gray-300 cursor-not-allowed" : "bg-yellow-400 hover:bg-yellow-500"}`}
      >
        {loading ? "Calculating Route..." : "Show Route & Fare"}
      </button>

      {/* RESULTS AND MAP AREA */}
      <div className="flex-1 flex flex-col min-h-[450px]">
        {loading && (
          <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed">
            <p className="animate-pulse font-bold text-gray-500">📍 Finding best route...</p>
          </div>
        )}

        {!loading && distance && (
          <div className="mb-4 bg-green-50 p-4 rounded-xl border border-green-200 flex justify-between items-center">
            <div>
              <p className="text-[10px] uppercase font-black text-green-600 tracking-widest">Estimated Distance</p>
              <p className="text-xl font-black text-green-800">{distance} km</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase font-black text-green-600 tracking-widest">Est. Fare</p>
              <p className="text-xl font-black text-green-800">₹{fare}</p>
            </div>
          </div>
        )}

        {!loading && route.length > 0 && (
          <div className="flex-1 w-full rounded-2xl overflow-hidden shadow-inner border border-gray-200 relative">
            <MapContainer
              center={route[0]}
              zoom={11}
              scrollWheelZoom={false}
              style={{ height: "420px", width: "100%" }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <FixMapSize />
              <RecenterMap positions={route} />
              <Marker position={route[0]} />
              <Marker position={route[route.length - 1]} />
              <Polyline positions={route} color="#3b82f6" weight={5} opacity={0.8} />
            </MapContainer>
          </div>
        )}
      </div>
    </div>
  );
});

RouteFare.displayName = "RouteFare";
export default RouteFare;