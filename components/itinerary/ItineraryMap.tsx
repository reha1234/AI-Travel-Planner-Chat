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

// Destination coordinates mapping
const destinationCoords: Record<
  string,
  { lat: number; lng: number; places: any[] }
> = {
  Bali: {
    lat: -8.4095,
    lng: 115.1889,
    places: [
      {
        id: 1,
        name: "Ubud Monkey Forest",
        lat: -8.5183,
        lng: 115.2592,
        description: "Sacred monkey sanctuary",
      },
      {
        id: 2,
        name: "Tanah Lot Temple",
        lat: -8.621,
        lng: 115.0868,
        description: "Iconic sea temple",
      },
      {
        id: 3,
        name: "Tegalalang Rice Terrace",
        lat: -8.4249,
        lng: 115.2832,
        description: "Beautiful rice fields",
      },
      {
        id: 4,
        name: "Uluwatu Temple",
        lat: -8.8288,
        lng: 115.0841,
        description: "Cliff-top temple",
      },
    ],
  },
  Jakarta: {
    lat: -6.2088,
    lng: 106.8456,
    places: [
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
        description: "Old Town Jakarta",
      },
      {
        id: 3,
        name: "TMII",
        lat: -6.3024,
        lng: 106.8442,
        description: "Taman Mini Indonesia Indah",
      },
      {
        id: 4,
        name: "Ancol Dreamland",
        lat: -6.1256,
        lng: 106.838,
        description: "Entertainment complex",
      },
    ],
  },
  Yogyakarta: {
    lat: -7.7956,
    lng: 110.3695,
    places: [
      {
        id: 1,
        name: "Borobudur Temple",
        lat: -7.6079,
        lng: 110.2038,
        description: "World's largest Buddhist temple",
      },
      {
        id: 2,
        name: "Prambanan Temple",
        lat: -7.752,
        lng: 110.4919,
        description: "Hindu temple complex",
      },
      {
        id: 3,
        name: "Malioboro Street",
        lat: -7.7936,
        lng: 110.3633,
        description: "Famous shopping street",
      },
      {
        id: 4,
        name: "Keraton Yogyakarta",
        lat: -7.8054,
        lng: 110.364,
        description: "Sultan's palace",
      },
    ],
  },
  Bandung: {
    lat: -6.9175,
    lng: 107.6191,
    places: [
      {
        id: 1,
        name: "Tangkuban Perahu",
        lat: -6.7704,
        lng: 107.6007,
        description: "Active volcano crater",
      },
      {
        id: 2,
        name: "Kawah Putih",
        lat: -7.1667,
        lng: 107.4,
        description: "White crater lake",
      },
      {
        id: 3,
        name: "Floating Market Lembang",
        lat: -6.8165,
        lng: 107.6157,
        description: "Floating market",
      },
      {
        id: 4,
        name: "Braga Street",
        lat: -6.9164,
        lng: 107.6094,
        description: "Historic street",
      },
    ],
  },
  Surabaya: {
    lat: -7.2575,
    lng: 112.7521,
    places: [
      {
        id: 1,
        name: "Suramadu Bridge",
        lat: -7.1924,
        lng: 112.7357,
        description: "Longest bridge in Indonesia",
      },
      {
        id: 2,
        name: "Tugu Pahlawan",
        lat: -7.2458,
        lng: 112.7378,
        description: "Heroes Monument",
      },
      {
        id: 3,
        name: "House of Sampoerna",
        lat: -7.2304,
        lng: 112.7416,
        description: "Museum and cigarette factory",
      },
    ],
  },
};

// Definisikan interface untuk props
interface ItineraryMapProps {
  destination?: string | null;
}

export default function ItineraryMap({ destination }: ItineraryMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [center, setCenter] = useState(defaultCenter);
  const [zoom, setZoom] = useState(11);
  const [locations, setLocations] = useState<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Update map based on destination
  useEffect(() => {
    if (destination && destinationCoords[destination]) {
      const dest = destinationCoords[destination];
      setCenter({ lat: dest.lat, lng: dest.lng });
      setLocations(dest.places);
      setZoom(11);
    } else {
      // Default to Jakarta if no specific destination
      setCenter(defaultCenter);
      setLocations(destinationCoords["Jakarta"].places);
      setZoom(11);
    }
  }, [destination]);

  const handleLoad = () => {
    setMapLoaded(true);
  };

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <span className="text-blue-500">🗺️</span>
            Travel Map
          </h3>
        </div>
        <div className="p-8 text-center bg-gray-50">
          <div className="text-yellow-600 mb-3">
            <svg
              className="w-12 h-12 mx-auto opacity-50"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p className="text-gray-700 font-medium">Map Feature</p>
          <p className="text-gray-600 text-sm mt-2 mb-4">
            Add your Google Maps API key to enable interactive maps
          </p>
          <div className="bg-gray-100 rounded-lg p-3 text-left">
            <code className="text-xs">
              NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
            </code>
          </div>
        </div>
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
            Key attractions in {destination}
          </p>
        )}
      </div>

      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
        onLoad={handleLoad}
      >
        {mapLoaded && (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={zoom}
            options={{
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: true,
              styles: [
                {
                  featureType: "poi",
                  elementType: "labels",
                  stylers: [{ visibility: "on" }],
                },
              ],
            }}
          >
            {locations.map((location) => (
              <Marker
                key={location.id}
                position={{ lat: location.lat, lng: location.lng }}
                onClick={() => setSelectedLocation(location)}
                icon={{
                  url: `https://maps.google.com/mapfiles/ms/icons/red-dot.png`,
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
                  <div className="flex gap-2 mt-3">
                    <button
                      className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                      onClick={() =>
                        window.open(
                          `https://www.google.com/maps/search/?api=1&query=${
                            selectedLocation.lat
                          },${selectedLocation.lng}&query=${encodeURIComponent(
                            selectedLocation.name
                          )}`,
                          "_blank"
                        )
                      }
                    >
                      Directions
                    </button>
                    <button
                      className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 transition-colors"
                      onClick={() => setSelectedLocation(null)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        )}
      </LoadScript>

      {!mapLoaded && (
        <div className="h-[400px] flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}

      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-600">Tourist Attractions</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">Click for details</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Click on markers for attraction details and directions.
        </p>
      </div>
    </div>
  );
}
