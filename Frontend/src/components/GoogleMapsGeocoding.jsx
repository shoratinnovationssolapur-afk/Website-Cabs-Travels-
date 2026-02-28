import React, { useEffect, useRef, useState } from "react";

export default function GoogleMapsGeocoding({ lat, lng }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const infoWindowRef = useRef(null);
  const [address, setAddress] = useState("Loading address...");

  useEffect(() => {
    const initMap = async () => {
      // 1. Import Libraries
      const [{ Map, InfoWindow }, { Geocoder }, { AdvancedMarkerElement }] = 
        await Promise.all([
          google.maps.importLibrary("maps"),
          google.maps.importLibrary("geocoding"),
          google.maps.importLibrary("marker"),
        ]);

      const position = { lat: parseFloat(lat), lng: parseFloat(lng) };

      // 2. Initialize Map
      const map = new Map(mapRef.current, {
        center: position,
        zoom: 15,
        mapId: "YOUR_MAP_ID", // Required for AdvancedMarkerElement
        mapTypeControl: false,
        draggableCursor: "crosshair",
      });

      // 3. Initialize UI Elements
      infoWindowRef.current = new InfoWindow();
      markerRef.current = new AdvancedMarkerElement({
        map,
        position: position,
      });

      const geocoder = new Geocoder();

      // 4. Geocode function
      const geocode = async (location) => {
        try {
          const response = await geocoder.geocode({ location });
          if (response.results[0]) {
            const formattedAddress = response.results[0].formatted_address;
            setAddress(formattedAddress);
            
            // Update Marker and InfoWindow
            markerRef.current.position = location;
            infoWindowRef.current.setContent(formattedAddress);
            infoWindowRef.current.open(map, markerRef.current);
          }
        } catch (e) {
          console.error("Geocoder failed: " + e);
        }
      };

      // Initial Call
      geocode(position);

      // 5. Add Click Listener to Map
      map.addListener("click", (event) => {
        const newPos = { 
          lat: event.latLng.lat(), 
          lng: event.latLng.lng() 
        };
        geocode(newPos);
      });
    };

    if (lat && lng) {
      initMap();
    }
  }, [lat, lng]);

  return (
    <div className="w-full space-y-4">
      <div 
        ref={mapRef} 
        className="w-full h-64 rounded-xl shadow-inner border border-gray-200"
      />
      <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
        <p className="text-xs font-bold text-blue-800 uppercase tracking-tighter">Current Location</p>
        <p className="text-sm text-gray-700">{address}</p>
      </div>
    </div>
  );
}