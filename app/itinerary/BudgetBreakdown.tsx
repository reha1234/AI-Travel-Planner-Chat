"use client";
import { BudgetBreakdown as BudgetBreakdownType } from "../../types";

interface BudgetBreakdownProps {
  breakdown: BudgetBreakdownType;
  totalBudget: number;
}

export default function BudgetBreakdown({
  breakdown,
  totalBudget,
}: BudgetBreakdownProps) {
  const categories = [
    {
      key: "accommodation" as const,
      label: "Accommodation",
      emoji: "🏨",
      color: "bg-blue-500",
    },
    {
      key: "food" as const,
      label: "Food & Dining",
      emoji: "🍽️",
      color: "bg-green-500",
    },
    {
      key: "activities" as const,
      label: "Activities",
      emoji: "🎯",
      color: "bg-purple-500",
    },
    {
      key: "transportation" as const,
      label: "Transportation",
      emoji: "🚗",
      color: "bg-orange-500",
    },
    {
      key: "miscellaneous" as const,
      label: "Miscellaneous",
      emoji: "🎁",
      color: "bg-gray-500",
    },
  ];

  const totalEstimated = breakdown.total;
  const budgetDifference = totalEstimated - totalBudget;
  const isOverBudget = budgetDifference > 0;

  const getPercentage = (amount: number) => (amount / totalEstimated) * 100;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        💰 Budget Breakdown
      </h2>

      {/* Budget Summary */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="text-sm text-blue-600 font-medium">Total Budget</div>
          <div className="text-2xl font-bold text-blue-700">
            Rp {totalBudget.toLocaleString("id-ID")}
          </div>
        </div>
        <div
          className={`bg-gradient-to-r rounded-lg p-4 ${
            isOverBudget
              ? "from-red-50 to-red-100"
              : "from-green-50 to-green-100"
          }`}
        >
          <div className="text-sm font-medium flex items-center">
            <span className={isOverBudget ? "text-red-600" : "text-green-600"}>
              Estimated Cost
            </span>
            {isOverBudget ? (
              <span className="ml-2 bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs">
                Over Budget
              </span>
            ) : (
              <span className="ml-2 bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">
                Within Budget
              </span>
            )}
          </div>
          <div
            className={`text-2xl font-bold ${
              isOverBudget ? "text-red-700" : "text-green-700"
            }`}
          >
            Rp {totalEstimated.toLocaleString("id-ID")}
          </div>
          {budgetDifference !== 0 && (
            <div
              className={`text-sm ${
                isOverBudget ? "text-red-600" : "text-green-600"
              }`}
            >
              {isOverBudget ? "+" : ""}Rp{" "}
              {Math.abs(budgetDifference).toLocaleString("id-ID")}
              {isOverBudget ? " over" : " under"} budget
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Budget Utilization</span>
          <span>{Math.round((totalEstimated / totalBudget) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              isOverBudget ? "bg-red-500" : "bg-green-500"
            }`}
            style={{
              width: `${Math.min((totalEstimated / totalBudget) * 100, 100)}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-4">
        {categories.map((category) => (
          <div
            key={category.key}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${category.color}`}
              >
                {category.emoji}
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {category.label}
                </div>
                <div className="text-sm text-gray-500">
                  {getPercentage(breakdown[category.key]).toFixed(1)}% of total
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-900">
                Rp {breakdown[category.key].toLocaleString("id-ID")}
              </div>
              <div className="text-sm text-gray-500">
                {category.key === "accommodation" && "per stay"}
                {category.key === "food" && "per day"}
                {category.key === "activities" && "all included"}
                {category.key === "transportation" && "local transport"}
                {category.key === "miscellaneous" && "10% buffer"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Budget Tips */}
      {isOverBudget && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">💡 Budget Tips</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Consider more budget-friendly accommodation options</li>
            <li>• Look for free or low-cost activities and attractions</li>
            <li>• Try local street food for authentic and affordable meals</li>
            <li>• Use public transportation instead of taxis</li>
          </ul>
        </div>
      )}
    </div>
  );
}
