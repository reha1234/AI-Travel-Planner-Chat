"use client";
import { useState } from "react";
import { MapPin, Navigation, ExternalLink } from "lucide-react";

// Image URLs untuk setiap destinasi (bisa pakai Unsplash)
const DESTINATION_IMAGES: Record<string, string> = {
  Bali: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=400&fit=crop",
  Jakarta:
    "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=400&fit=crop",
  Yogyakarta:
    "https://images.unsplash.com/photo-1590398085517-6b6b56286e4c?w=800&h=400&fit=crop",
  Bandung:
    "https://images.unsplash.com/photo-1588666309990-d68f08e3d4c6?w=800&h=400&fit=crop",
  Surabaya:
    "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=400&fit=crop",
  Lombok:
    "https://images.unsplash.com/photo-1523059623039-a9ed027e7fad?w=800&h=400&fit=crop",
  Medan:
    "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=400&fit=crop",
  Makassar:
    "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=400&fit=crop",
  default:
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h-400&fit=crop",
};

// Attractions untuk setiap destinasi
const ATTRACTIONS: Record<
  string,
  Array<{ name: string; description: string }>
> = {
  Bali: [
    { name: "Ubud Monkey Forest", description: "Sacred monkey sanctuary" },
    { name: "Tanah Lot Temple", description: "Iconic sea temple on rock" },
    { name: "Tegalalang Rice Terrace", description: "Beautiful rice fields" },
    { name: "Uluwatu Temple", description: "Cliff-top temple" },
  ],
  Jakarta: [
    { name: "Monas (National Monument)", description: "132m tall monument" },
    {
      name: "Kota Tua (Old Town)",
      description: "Historic Dutch colonial area",
    },
    { name: "TMII", description: "Indonesia Miniature Park" },
    { name: "Ancol Dreamland", description: "Beach resort complex" },
  ],
  Yogyakarta: [
    {
      name: "Borobudur Temple",
      description: "World's largest Buddhist temple",
    },
    { name: "Prambanan Temple", description: "Hindu temple complex" },
    { name: "Malioboro Street", description: "Famous shopping street" },
    { name: "Keraton Yogyakarta", description: "Sultan's palace" },
  ],
};

interface SimpleImageMapProps {
  destination?: string | null;
}

export default function SimpleImageMap({ destination }: SimpleImageMapProps) {
  const imageUrl = destination
    ? DESTINATION_IMAGES[destination] || DESTINATION_IMAGES.default
    : DESTINATION_IMAGES.default;

  const attractions = destination ? ATTRACTIONS[destination] || [] : [];
  const googleMapsUrl = destination
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        destination
      )}+Indonesia`
    : "https://www.google.com/maps";

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Map Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-500" />
              {destination ? `${destination} Travel Guide` : "Travel Map"}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {destination
                ? `Key attractions in ${destination}`
                : "Popular Indonesian destinations"}
            </p>
          </div>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Open Maps
          </a>
        </div>
      </div>

      {/* Destination Image */}
      <div className="relative h-[250px] bg-gray-100">
        <img
          src={imageUrl}
          alt={destination || "Travel destination"}
          className="w-full h-full object-cover"
        />
        {destination && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
            <div className="p-4 text-white">
              <h4 className="text-xl font-bold">{destination}</h4>
              <p className="text-sm opacity-90">Indonesia</p>
            </div>
          </div>
        )}
      </div>

      {/* Attractions List */}
      {attractions.length > 0 && (
        <div className="p-4 border-t border-gray-200">
          <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Navigation className="w-4 h-4 text-green-500" />
            Must-Visit Attractions
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {attractions.slice(0, 4).map((attraction, index) => (
              <div
                key={index}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div className="font-medium text-gray-800">
                  {attraction.name}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {attraction.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-700">Main Destination</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">Popular Attractions</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Click "Open Maps" for directions and more details. Images from
          Unsplash.
        </p>
      </div>
    </div>
  );
}
