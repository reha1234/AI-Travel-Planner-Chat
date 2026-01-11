"use client";
import { useState, useEffect } from "react";
import Map, {
  Marker,
  Popup,
  NavigationControl,
  FullscreenControl,
  AttributionControl,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapPin, Navigation, ZoomIn, ZoomOut } from "lucide-react";

const MAPTILER_API_KEY = "free"; // Gratis untuk OpenStreetMap
const MAP_STYLE = `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_API_KEY}`;

// Destination coordinates untuk Indonesia
const DESTINATION_COORDS: Record<
  string,
  { lat: number; lng: number; zoom: number }
> = {
  Bali: { lat: -8.4095, lng: 115.1889, zoom: 10 },
  Jakarta: { lat: -6.2088, lng: 106.8456, zoom: 11 },
  Yogyakarta: { lat: -7.7956, lng: 110.3695, zoom: 12 },
  Bandung: { lat: -6.9175, lng: 107.6191, zoom: 12 },
  Surabaya: { lat: -7.2575, lng: 112.7521, zoom: 12 },
  Lombok: { lat: -8.5657, lng: 116.3513, zoom: 10 },
  Medan: { lat: 3.5952, lng: 98.6722, zoom: 12 },
  Makassar: { lat: -5.1477, lng: 119.4327, zoom: 12 },
};

// Popular attractions untuk setiap destinasi
const ATTRACTIONS: Record<
  string,
  Array<{ name: string; lat: number; lng: number; description: string }>
> = {
  Bali: [
    {
      name: "Ubud",
      lat: -8.5069,
      lng: 115.2625,
      description: "Cultural heart of Bali",
    },
    {
      name: "Kuta Beach",
      lat: -8.7222,
      lng: 115.1728,
      description: "Famous surfing beach",
    },
    {
      name: "Tanah Lot",
      lat: -8.621,
      lng: 115.0868,
      description: "Sea temple on rock formation",
    },
    {
      name: "Uluwatu Temple",
      lat: -8.8288,
      lng: 115.0841,
      description: "Cliff-top temple",
    },
  ],
  Jakarta: [
    {
      name: "Monas",
      lat: -6.1754,
      lng: 106.8272,
      description: "National Monument",
    },
    {
      name: "Kota Tua",
      lat: -6.1352,
      lng: 106.8133,
      description: "Historic old town",
    },
    {
      name: "TMII",
      lat: -6.3024,
      lng: 106.8442,
      description: "Indonesia Miniature Park",
    },
    {
      name: "Ancol",
      lat: -6.1256,
      lng: 106.838,
      description: "Beach resort area",
    },
  ],
  Yogyakarta: [
    {
      name: "Borobudur",
      lat: -7.6079,
      lng: 110.2038,
      description: "Buddhist temple",
    },
    {
      name: "Prambanan",
      lat: -7.752,
      lng: 110.4919,
      description: "Hindu temple complex",
    },
    {
      name: "Malioboro",
      lat: -7.7936,
      lng: 110.3633,
      description: "Shopping street",
    },
    {
      name: "Keraton",
      lat: -7.8054,
      lng: 110.364,
      description: "Sultan palace",
    },
  ],
};

interface SimpleMapProps {
  destination?: string | null;
  showAttractions?: boolean;
}

export default function SimpleMap({
  destination,
  showAttractions = true,
}: SimpleMapProps) {
  const [selectedAttraction, setSelectedAttraction] = useState<any>(null);
  const [viewState, setViewState] = useState({
    latitude: -2.5489, // Center of Indonesia
    longitude: 118.0149,
    zoom: 4,
  });

  // Update map view ketika destination berubah
  useEffect(() => {
    if (destination && DESTINATION_COORDS[destination]) {
      const coords = DESTINATION_COORDS[destination];
      setViewState({
        latitude: coords.lat,
        longitude: coords.lng,
        zoom: coords.zoom,
      });
    }
  }, [destination]);

  // Toggle untuk attraction popup
  const handleMarkerClick = (attraction: any) => {
    setSelectedAttraction(attraction);
  };

  // Get attractions untuk destination saat ini
  const currentAttractions = destination ? ATTRACTIONS[destination] || [] : [];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Map Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-500" />
              {destination ? `${destination} Map` : "Indonesia Travel Map"}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {destination
                ? `Explore ${destination}'s attractions`
                : "Click on markers for details"}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Navigation className="w-4 h-4" />
            <span>OpenStreetMap</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-[400px]">
        <Map
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          mapStyle={MAP_STYLE}
          style={{ width: "100%", height: "100%", borderRadius: "0" }}
          attributionControl={{
            customAttribution: "© OpenStreetMap contributors",
          }}
        >
          {/* Navigation Controls */}
          <NavigationControl position="top-right" />
          <FullscreenControl position="top-right" />

          {/* Destination Marker */}
          {destination && DESTINATION_COORDS[destination] && (
            <Marker
              latitude={DESTINATION_COORDS[destination].lat}
              longitude={DESTINATION_COORDS[destination].lng}
              color="#3B82F6"
            >
              <div className="relative">
                <MapPin className="w-8 h-8 text-blue-600" />
                <div className="absolute -top-8 -left-4 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-lg whitespace-nowrap">
                  {destination}
                </div>
              </div>
            </Marker>
          )}

          {/* Attraction Markers */}
          {showAttractions &&
            currentAttractions.map((attraction) => (
              <Marker
                key={attraction.name}
                latitude={attraction.lat}
                longitude={attraction.lng}
                color="#10B981"
                onClick={() => handleMarkerClick(attraction)}
              >
                <MapPin className="w-6 h-6 text-green-500 cursor-pointer hover:scale-110 transition-transform" />
              </Marker>
            ))}

          {/* Attraction Popup */}
          {selectedAttraction && (
            <Popup
              latitude={selectedAttraction.lat}
              longitude={selectedAttraction.lng}
              anchor="bottom"
              onClose={() => setSelectedAttraction(null)}
              closeButton={true}
              closeOnClick={false}
            >
              <div className="p-2 max-w-[200px]">
                <h4 className="font-bold text-gray-800">
                  {selectedAttraction.name}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedAttraction.description}
                </p>
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <button
                    className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors w-full"
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps/search/?api=1&query=${selectedAttraction.lat},${selectedAttraction.lng}`,
                        "_blank"
                      )
                    }
                  >
                    Open in Google Maps
                  </button>
                </div>
              </div>
            </Popup>
          )}
        </Map>

        {/* Zoom Controls Custom */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <button
            className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
            onClick={() =>
              setViewState({ ...viewState, zoom: viewState.zoom + 1 })
            }
          >
            <ZoomIn className="w-5 h-5 text-gray-700" />
          </button>
          <button
            className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
            onClick={() =>
              setViewState({
                ...viewState,
                zoom: Math.max(1, viewState.zoom - 1),
              })
            }
          >
            <ZoomOut className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Map Legend */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-700">Main Destination</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">Tourist Attractions</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Click on green markers for attraction details. Map data from
          OpenStreetMap.
        </p>
      </div>
    </div>
  );
}
