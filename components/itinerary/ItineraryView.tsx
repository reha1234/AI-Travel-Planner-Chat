"use client";
import { useState } from "react";
import { Itinerary, DayPlan } from "../../types";
import BudgetBreakdown from "../../app/itinerary/BudgetBreakdown";
import DayCard from "../../app/itinerary/DayCard";
import ShareOptions from "../../app/itinerary/ShareOption";

interface ItineraryViewProps {
  itinerary: Itinerary;
  isShared?: boolean;
}

export default function ItineraryView({
  itinerary,
  isShared = false,
}: ItineraryViewProps) {
  const [showShareOptions, setShowShareOptions] = useState(false);
  const { tripInput, days, budgetBreakdown } = itinerary;

  const totalBudget = tripInput.budgetPerPerson * tripInput.travelers;
  const isOverBudget = budgetBreakdown.total > totalBudget;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                🏝️ {days.length} Days in {tripInput.destination}
              </h1>
              <p className="text-gray-600 mt-2">
                {new Date(tripInput.startDate).toLocaleDateString()} -{" "}
                {new Date(tripInput.endDate).toLocaleDateString()}•{" "}
                {tripInput.travelers} traveler
                {tripInput.travelers > 1 ? "s" : ""}
              </p>
            </div>

            {!isShared && (
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowShareOptions(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Share
                </button>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Download PDF
                </button>
              </div>
            )}
          </div>

          {/* Budget Summary */}
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-gray-600">Total Budget:</span>
                <span className="text-lg font-semibold ml-2">
                  Rp {totalBudget.toLocaleString("id-ID")}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Estimated Cost:</span>
                <span
                  className={`text-lg font-semibold ml-2 ${
                    isOverBudget ? "text-red-600" : "text-green-600"
                  }`}
                >
                  Rp {budgetBreakdown.total.toLocaleString("id-ID")}
                  {isOverBudget ? " ⚠️" : " ✓"}
                </span>
              </div>
            </div>
            {isOverBudget && (
              <p className="text-red-600 text-sm mt-2">
                Budget may be tight! Consider adjusting your plans or budget.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Days Itinerary */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {days.map((dayPlan: DayPlan) => (
            <DayCard key={dayPlan.day} dayPlan={dayPlan} isShared={isShared} />
          ))}
        </div>

        {/* Budget Breakdown */}
        <div className="mt-12">
          <BudgetBreakdown
            breakdown={budgetBreakdown}
            totalBudget={totalBudget}
          />
        </div>
      </div>

      {/* Share Modal */}
      {showShareOptions && (
        <ShareOptions
          itinerary={itinerary}
          onClose={() => setShowShareOptions(false)}
        />
      )}
    </div>
  );
}
