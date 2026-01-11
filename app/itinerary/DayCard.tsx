"use client";
import { useState } from "react";
import { DayPlan, Activity } from "../../types";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";

interface DayCardProps {
  dayPlan: DayPlan;
  isShared?: boolean;
  onEditActivity?: (
    day: number,
    activityType: string,
    activity: Activity
  ) => void;
}

export default function DayCard({
  dayPlan,
  isShared = false,
  onEditActivity,
}: DayCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingActivity, setEditingActivity] = useState<string | null>(null);

  const activityTypes = {
    morning: { emoji: "🌅", title: "Morning" },
    lunch: { emoji: "🍽️", title: "Lunch" },
    afternoon: { emoji: "☀️", title: "Afternoon" },
    dinner: { emoji: "🍽️", title: "Dinner" },
    evening: { emoji: "🌙", title: "Evening" },
  };

  const formatTime = (type: string) => {
    const times = {
      morning: "9:00 AM",
      lunch: "12:30 PM",
      afternoon: "2:00 PM",
      dinner: "7:00 PM",
      evening: "9:00 PM",
    };
    return times[type as keyof typeof times] || "";
  };

  const handleEditClick = (activityType: string) => {
    if (isShared) return;
    setEditingActivity(activityType);
  };

  const handleRegenerate = async (activityType: string) => {
    // Implementation for regenerating specific activity
    console.log("Regenerate", activityType, "for day", dayPlan.day);
    setEditingActivity(null);
  };

  const handleRemove = (activityType: string) => {
    // Implementation for removing activity
    console.log("Remove", activityType, "for day", dayPlan.day);
    setEditingActivity(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Day Header */}
      <div
        className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold text-white">
              📅 Day {dayPlan.day} -{" "}
              {new Date(dayPlan.date).toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </h2>
          </div>
          <div className="text-white">
            {isExpanded ? (
              <ChevronUpIcon className="w-5 h-5" />
            ) : (
              <ChevronDownIcon className="w-5 h-5" />
            )}
          </div>
        </div>
      </div>

      {/* Activities */}
      {isExpanded && (
        <div className="p-6 space-y-4">
          {Object.entries(activityTypes).map(([type, info]) => {
            const activity =
              dayPlan.activities[type as keyof typeof dayPlan.activities];
            if (!activity) return null;

            return (
              <div key={type} className="relative">
                <div className="flex space-x-4 group">
                  {/* Time & Emoji */}
                  <div className="flex-shrink-0 w-24">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{info.emoji}</span>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {info.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatTime(type)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Activity Content */}
                  <div className="flex-1 min-w-0">
                    <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {activity.name}
                          </h3>
                          <p className="text-gray-600 mt-1 text-sm leading-relaxed">
                            {activity.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>⏱️ {activity.duration}</span>
                            {activity.cost > 0 && (
                              <span>
                                💰 Rp {activity.cost.toLocaleString("id-ID")}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Edit Button */}
                        {!isShared && (
                          <button
                            onClick={() => handleEditClick(type)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity ml-4 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edit Menu */}
                {editingActivity === type && (
                  <div className="ml-24 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10 absolute w-64">
                    <div className="space-y-2">
                      <button
                        onClick={() => handleRegenerate(type)}
                        className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
                      >
                        🔄 Regenerate Activity
                      </button>
                      <button
                        onClick={() => handleRemove(type)}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                      >
                        🗑️ Remove Activity
                      </button>
                      <button
                        onClick={() => setEditingActivity(null)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md"
                      >
                        ✕ Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
