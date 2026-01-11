"use client";
import { useState } from "react";
import { Itinerary } from "../../types";
import ItineraryView from "../../components/itinerary/ItineraryView";
import CollaborationPanel from "../../components/collaboration/CollaborationPanel";
import ItineraryMap from "../../components/maps/IteneraryMap";
import GoogleMapsLoader from "../../components/maps/GoogleMapsLoader";
import { UserGroupIcon, MapIcon } from "@heroicons/react/24/outline";

interface EnhancedItineraryViewProps {
  itinerary: Itinerary;
  isShared?: boolean;
}

// Mock data - in real app, fetch from API
const mockCollaborators = [
  {
    id: "user1",
    email: "alice@example.com",
    name: "Alice",
    role: "owner" as const,
    joinedAt: new Date().toISOString(),
  },
  {
    id: "user2",
    email: "bob@example.com",
    name: "Bob",
    role: "editor" as const,
    joinedAt: new Date().toISOString(),
  },
];

export default function EnhancedItineraryView({
  itinerary,
  isShared,
}: EnhancedItineraryViewProps) {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [showMap, setShowMap] = useState(false);
  const [showCollaboration, setShowCollaboration] = useState(false);

  const handleActivitySelect = (day: number, activityType: string) => {
    setSelectedDay(day);
    // You could add highlighting or scrolling to the specific activity
    console.log(`Selected Day ${day}, ${activityType}`);
  };

  if (isShared) {
    return <ItineraryView itinerary={itinerary} isShared={true} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                🏝️ {itinerary.days.length} Days in{" "}
                {itinerary.tripInput.destination}
              </h1>
              <p className="text-gray-600 mt-2">
                {new Date(itinerary.tripInput.startDate).toLocaleDateString()} -{" "}
                {new Date(itinerary.tripInput.endDate).toLocaleDateString()}•{" "}
                {itinerary.tripInput.travelers} traveler
                {itinerary.tripInput.travelers > 1 ? "s" : ""}
              </p>
            </div>

            <div className="flex space-x-3">
              {/* Map Toggle */}
              <button
                onClick={() => setShowMap(!showMap)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  showMap
                    ? "bg-blue-100 text-blue-700 border-blue-300"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                <MapIcon className="w-4 h-4" />
                <span>Map</span>
              </button>

              {/* Collaboration Toggle */}
              <button
                onClick={() => setShowCollaboration(!showCollaboration)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  showCollaboration
                    ? "bg-purple-100 text-purple-700 border-purple-300"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                <UserGroupIcon className="w-4 h-4" />
                <span>Team</span>
                <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                  {mockCollaborators.length}
                </span>
              </button>
            </div>
          </div>

          {/* Budget Summary */}
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-gray-600">Total Budget:</span>
                <span className="text-lg font-semibold ml-2">
                  Rp{" "}
                  {(
                    itinerary.tripInput.budgetPerPerson *
                    itinerary.tripInput.travelers
                  ).toLocaleString("id-ID")}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Estimated Cost:</span>
                <span
                  className={`text-lg font-semibold ml-2 ${
                    itinerary.budgetBreakdown.total >
                    itinerary.tripInput.budgetPerPerson *
                      itinerary.tripInput.travelers
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  Rp {itinerary.budgetBreakdown.total.toLocaleString("id-ID")}
                  {itinerary.budgetBreakdown.total >
                  itinerary.tripInput.budgetPerPerson *
                    itinerary.tripInput.travelers
                    ? " ⚠️"
                    : " ✓"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div
          className={`gap-8 ${
            showMap || showCollaboration ? "lg:grid lg:grid-cols-2" : ""
          }`}
        >
          {/* Main Itinerary */}
          <div className={showMap || showCollaboration ? "lg:col-span-1" : ""}>
            <ItineraryView itinerary={itinerary} />
          </div>

          {/* Sidebar */}
          {(showMap || showCollaboration) && (
            <div className="lg:col-span-1 space-y-6">
              {showMap && (
                <GoogleMapsLoader>
                  <ItineraryMap
                    itinerary={itinerary}
                    selectedDay={selectedDay}
                    onActivitySelect={handleActivitySelect}
                  />
                </GoogleMapsLoader>
              )}

              {showCollaboration && (
                <CollaborationPanel
                  itinerary={itinerary}
                  collaborators={mockCollaborators}
                  currentUser={mockCollaborators[0]} // In real app, get from auth
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
