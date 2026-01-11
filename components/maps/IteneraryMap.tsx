"use client";
import { useState, useEffect } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";

const mapContainerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "12px",
};

const defaultCenter = {
  lat: -6.2088, // Jakarta
  lng: 106.8456,
};

// Sample locations for demonstration
const sampleLocations = [
  {
    id: 1,
    name: "Monas",
    lat: -6.1754,
    lng: 106.8272,
    description: "National Monument",
  },
  {
    id: 2,
    name: "Kota Tua",
    lat: -6.1352,
    lng: 106.8133,
    description: "Old Town",
  },
  {
    id: 3,
    name: "TMII",
    lat: -6.3024,
    lng: 106.8442,
    description: "Taman Mini Indonesia",
  },
];

interface ItineraryMapProps {
  destination?: string;
  activities?: string[];
}

export default function ItineraryMap({
  destination,
  activities,
}: ItineraryMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [center, setCenter] = useState(defaultCenter);
  const [zoom, setZoom] = useState(11);

  // Update map based on destination
  useEffect(() => {
    if (destination) {
      const destinationCoords: Record<string, { lat: number; lng: number }> = {
        Bali: { lat: -8.4095, lng: 115.1889 },
        Jakarta: { lat: -6.2088, lng: 106.8456 },
        Yogyakarta: { lat: -7.7956, lng: 110.3695 },
        Bandung: { lat: -6.9175, lng: 107.6191 },
        Surabaya: { lat: -7.2575, lng: 112.7521 },
      };

      const coords = destinationCoords[destination] || defaultCenter;
      setCenter(coords);
      setZoom(12);
    }
  }, [destination]);

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
        <p className="text-yellow-800 font-medium">🗺️ Map Feature</p>
        <p className="text-yellow-600 text-sm mt-2">
          Add{" "}
          <code className="bg-yellow-100 px-2 py-1 rounded">
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
          </code>{" "}
          to .env.local
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <span className="text-blue-500">🗺️</span>
          {destination ? `${destination} Map` : "Travel Map"}
        </h3>
        {destination && (
          <p className="text-sm text-gray-600 mt-1">
            Key locations in {destination}
          </p>
        )}
      </div>

      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={zoom}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
          }}
        >
          {sampleLocations.map((location) => (
            <Marker
              key={location.id}
              position={{ lat: location.lat, lng: location.lng }}
              onClick={() => setSelectedLocation(location)}
              icon={{
                url: `https://maps.google.com/mapfiles/ms/icons/blue-dot.png`,
                scaledSize: new window.google.maps.Size(40, 40),
              }}
            />
          ))}

          {selectedLocation && (
            <InfoWindow
              position={{
                lat: selectedLocation.lat,
                lng: selectedLocation.lng,
              }}
              onCloseClick={() => setSelectedLocation(null)}
            >
              <div className="p-2 max-w-xs">
                <h4 className="font-bold text-gray-800">
                  {selectedLocation.name}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedLocation.description}
                </p>
                <button
                  className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps/search/?api=1&query=${selectedLocation.lat},${selectedLocation.lng}`,
                      "_blank"
                    )
                  }
                >
                  Open in Google Maps →
                </button>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>

      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          <span className="font-medium">Tip:</span> Click on markers for
          details. Add your Google Maps API key for full functionality.
        </p>
      </div>
    </div>
  );
}
