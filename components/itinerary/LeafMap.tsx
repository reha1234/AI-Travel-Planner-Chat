"use client";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/images/marker-icon-2x.png",
  iconUrl: "/leaflet/images/marker-icon.png",
  shadowUrl: "/leaflet/images/marker-shadow.png",
});

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64," +
    btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3B82F6" width="32" height="32">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Destination coordinates with attractions
const destinationData: Record<
  string,
  {
    center: [number, number];
    zoom: number;
    attractions: Array<{
      id: number;
      name: string;
      position: [number, number];
      description: string;
      type: "attraction" | "restaurant" | "hotel";
    }>;
  }
> = {
  Bali: {
    center: [-8.4095, 115.1889],
    zoom: 10,
    attractions: [
      {
        id: 1,
        name: "Ubud Monkey Forest",
        position: [-8.5183, 115.2592],
        description: "Sacred monkey sanctuary",
        type: "attraction",
      },
      {
        id: 2,
        name: "Tanah Lot Temple",
        position: [-8.621, 115.0868],
        description: "Iconic sea temple",
        type: "attraction",
      },
      {
        id: 3,
        name: "Tegalalang Rice Terrace",
        position: [-8.4249, 115.2832],
        description: "Beautiful rice fields",
        type: "attraction",
      },
      {
        id: 4,
        name: "Warung Babi Guling",
        position: [-8.506, 115.262],
        description: "Famous roast pork restaurant",
        type: "restaurant",
      },
      {
        id: 5,
        name: "Kuta Beach",
        position: [-8.7222, 115.1707],
        description: "Popular beach area",
        type: "attraction",
      },
    ],
  },
  Jakarta: {
    center: [-6.2088, 106.8456],
    zoom: 11,
    attractions: [
      {
        id: 1,
        name: "Monas (National Monument)",
        position: [-6.1754, 106.8272],
        description: "132m tall monument",
        type: "attraction",
      },
      {
        id: 2,
        name: "Kota Tua",
        position: [-6.1352, 106.8133],
        description: "Historic old town",
        type: "attraction",
      },
      {
        id: 3,
        name: "TMII",
        position: [-6.3024, 106.8442],
        description: "Indonesia in miniature park",
        type: "attraction",
      },
      {
        id: 4,
        name: "Grand Indonesia Mall",
        position: [-6.195, 106.822],
        description: "Luxury shopping mall",
        type: "attraction",
      },
      {
        id: 5,
        name: "Sabang Street Food",
        position: [-6.1902, 106.837],
        description: "Famous food street",
        type: "restaurant",
      },
    ],
  },
  Yogyakarta: {
    center: [-7.7956, 110.3695],
    zoom: 11,
    attractions: [
      {
        id: 1,
        name: "Borobudur Temple",
        position: [-7.6079, 110.2038],
        description: "World's largest Buddhist temple",
        type: "attraction",
      },
      {
        id: 2,
        name: "Prambanan Temple",
        position: [-7.752, 110.4919],
        description: "9th-century Hindu temple",
        type: "attraction",
      },
      {
        id: 3,
        name: "Malioboro Street",
        position: [-7.7936, 110.3633],
        description: "Famous shopping street",
        type: "attraction",
      },
      {
        id: 4,
        name: "Keraton Yogyakarta",
        position: [-7.8054, 110.364],
        description: "Sultan's palace",
        type: "attraction",
      },
      {
        id: 5,
        name: "Gudeg Yu Djum",
        position: [-7.8, 110.3667],
        description: "Famous gudeg restaurant",
        type: "restaurant",
      },
    ],
  },
  Bandung: {
    center: [-6.9175, 107.6191],
    zoom: 11,
    attractions: [
      {
        id: 1,
        name: "Tangkuban Perahu",
        position: [-6.7704, 107.6007],
        description: "Active volcano crater",
        type: "attraction",
      },
      {
        id: 2,
        name: "Kawah Putih",
        position: [-7.1667, 107.4],
        description: "White crater lake",
        type: "attraction",
      },
      {
        id: 3,
        name: "Floating Market Lembang",
        position: [-6.8165, 107.6157],
        description: "Floating market",
        type: "attraction",
      },
      {
        id: 4,
        name: "Braga Street",
        position: [-6.9164, 107.6094],
        description: "Historic colonial street",
        type: "attraction",
      },
      {
        id: 5,
        name: "Kampung Daun",
        position: [-6.85, 107.6333],
        description: "Nature restaurant",
        type: "restaurant",
      },
    ],
  },
  Lombok: {
    center: [-8.5657, 116.3513],
    zoom: 10,
    attractions: [
      {
        id: 1,
        name: "Mount Rinjani",
        position: [-8.4125, 116.4575],
        description: "Active volcano",
        type: "attraction",
      },
      {
        id: 2,
        name: "Gili Islands",
        position: [-8.35, 116.0394],
        description: "Three paradise islands",
        type: "attraction",
      },
      {
        id: 3,
        name: "Senggigi Beach",
        position: [-8.4897, 116.0411],
        description: "Beautiful beach resort",
        type: "attraction",
      },
      {
        id: 4,
        name: "Mandalika Circuit",
        position: [-8.8989, 116.2889],
        description: "MotoGP race track",
        type: "attraction",
      },
    ],
  },
  Surabaya: {
    center: [-7.2575, 112.7521],
    zoom: 12,
    attractions: [
      {
        id: 1,
        name: "House of Sampoerna",
        position: [-7.2347, 112.7428],
        description: "Museum & cigarette factory",
        type: "attraction",
      },
      {
        id: 2,
        name: "Surabaya Zoo",
        position: [-7.2856, 112.7347],
        description: "One of Asia's largest zoos",
        type: "attraction",
      },
      {
        id: 3,
        name: "Tunjungan Plaza",
        position: [-7.2597, 112.7419],
        description: "Large shopping complex",
        type: "attraction",
      },
      {
        id: 4,
        name: "Cheng Ho Mosque",
        position: [-7.2486, 112.7381],
        description: "Beautiful Chinese-style mosque",
        type: "attraction",
      },
    ],
  },
};

interface LeafletMapProps {
  destination?: string | null;
}

export default function LeafletMap({ destination }: LeafletMapProps) {
  const [mapData, setMapData] = useState(destinationData["Jakarta"]);
  const [selectedAttraction, setSelectedAttraction] = useState<any>(null);

  useEffect(() => {
    if (destination && destinationData[destination]) {
      setMapData(destinationData[destination]);
    } else {
      // Fallback to default
      setMapData(destinationData["Jakarta"]);
    }
  }, [destination]);

  const getMarkerColor = (type: string) => {
    switch (type) {
      case "attraction":
        return "#3B82F6"; // blue
      case "restaurant":
        return "#10B981"; // green
      case "hotel":
        return "#8B5CF6"; // purple
      default:
        return "#6B7280"; // gray
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "attraction":
        return "🏛️ Attraction";
      case "restaurant":
        return "🍽️ Restaurant";
      case "hotel":
        return "🏨 Hotel";
      default:
        return "📍 Location";
    }
  };

  // Check if we're in browser
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="bg-gray-100 rounded-xl h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <span className="text-blue-500">🗺️</span>
          {destination ? `${destination} Travel Map` : "Travel Map"}
        </h3>
        {destination && (
          <p className="text-sm text-gray-600 mt-1">
            Key locations in {destination} • Click markers for details
          </p>
        )}
      </div>

      <div className="relative" style={{ height: "400px" }}>
        <MapContainer
          center={mapData.center}
          zoom={mapData.zoom}
          className="h-full w-full rounded-b-lg"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {mapData.attractions.map((attraction) => {
            const icon = L.divIcon({
              html: `
                <div style="
                  background-color: ${getMarkerColor(attraction.type)};
                  width: 24px;
                  height: 24px;
                  border-radius: 50%;
                  border: 3px solid white;
                  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-size: 12px;
                  font-weight: bold;
                ">
                  ${
                    attraction.type === "restaurant"
                      ? "🍴"
                      : attraction.type === "hotel"
                      ? "🏨"
                      : "📍"
                  }
                </div>
              `,
              className: "custom-marker",
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            });

            return (
              <Marker
                key={attraction.id}
                position={attraction.position}
                icon={icon}
                eventHandlers={{
                  click: () => setSelectedAttraction(attraction),
                }}
              >
                <Popup>
                  <div className="p-2">
                    <h4 className="font-bold text-gray-800">
                      {attraction.name}
                    </h4>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                        {getTypeLabel(attraction.type)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {attraction.description}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                        onClick={() =>
                          window.open(
                            `https://www.google.com/maps/search/?api=1&query=${
                              attraction.position[0]
                            },${
                              attraction.position[1]
                            }&query=${encodeURIComponent(
                              attraction.name + " " + destination
                            )}`,
                            "_blank"
                          )
                        }
                      >
                        Open in Maps
                      </button>
                      <button
                        className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 transition-colors"
                        onClick={() => setSelectedAttraction(null)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-xs mb-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">Attractions</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Restaurants</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-gray-600">Hotels</span>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Powered by OpenStreetMap • Click markers for details
        </p>
      </div>
    </div>
  );
}
