"use client";
import { useState } from "react";
import { TripInput } from "../../types";

interface TripInputFormProps {
  onSubmit: (data: TripInput) => void;
  loading: boolean;
}

const travelStyles = [
  "adventure",
  "relaxation",
  "culture",
  "food",
  "shopping",
  "nightlife",
];

const interestsList = [
  "Nature",
  "Culture",
  "Food",
  "Shopping",
  "Nightlife",
  "Adventure",
  "History",
  "Art",
  "Photography",
];

export default function TripInputForm({
  onSubmit,
  loading,
}: TripInputFormProps) {
  const [formData, setFormData] = useState<Partial<TripInput>>({
    travelers: 2,
    pace: "moderate",
    travelStyle: [],
    interests: [],
  });

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    return (
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.destination ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.budgetPerPerson ||
      !formData.travelStyle?.length
    ) {
      alert("Please fill all required fields");
      return;
    }
    onSubmit(formData as TripInput);
  };

  const toggleTravelStyle = (style: string) => {
    setFormData((prev) => ({
      ...prev,
      travelStyle: prev.travelStyle?.includes(style)
        ? prev.travelStyle.filter((s) => s !== style)
        : [...(prev.travelStyle || []), style],
    }));
  };

  const toggleInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests?.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...(prev.interests || []), interest],
    }));
  };

  const days = calculateDays();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Destination */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          📍 Where are you going?
        </label>
        <input
          type="text"
          required
          placeholder="Bali, Indonesia"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={formData.destination || ""}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, destination: e.target.value }))
          }
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📅 Start Date
          </label>
          <input
            type="date"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={formData.startDate || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, startDate: e.target.value }))
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📅 End Date
          </label>
          <input
            type="date"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={formData.endDate || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, endDate: e.target.value }))
            }
          />
        </div>
      </div>
      {days > 0 && (
        <p className="text-sm text-gray-600">
          {days} days, {days - 1} nights
        </p>
      )}

      {/* Travelers */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          👥 How many travelers?
        </label>
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                travelers: Math.max(1, (prev.travelers || 2) - 1),
              }))
            }
            className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center text-xl"
          >
            -
          </button>
          <span className="text-lg font-semibold w-8 text-center">
            {formData.travelers}
          </span>
          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                travelers: Math.min(10, (prev.travelers || 2) + 1),
              }))
            }
            className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center text-xl"
          >
            +
          </button>
        </div>
      </div>

      {/* Budget */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          💰 Budget per person (IDR)
        </label>
        <input
          type="number"
          required
          placeholder="5000000"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          value={formData.budgetPerPerson || ""}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              budgetPerPerson: Number(e.target.value),
            }))
          }
        />
      </div>

      {/* Travel Style */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          🎨 What's your travel style?
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {travelStyles.map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => toggleTravelStyle(style)}
              className={`p-3 rounded-lg border-2 text-left transition-colors ${
                formData.travelStyle?.includes(style)
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-white text-gray-700"
              }`}
            >
              {style.charAt(0).toUpperCase() + style.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Interests */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          🎯 Your Interests (Optional)
        </label>
        <div className="flex flex-wrap gap-2">
          {interestsList.map((interest) => (
            <button
              key={interest}
              type="button"
              onClick={() => toggleInterest(interest)}
              className={`px-3 py-2 rounded-full border transition-colors ${
                formData.interests?.includes(interest)
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-gray-200 bg-white text-gray-700"
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>

      {/* Pace */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ⏱️ Preferred Pace
        </label>
        <select
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          value={formData.pace}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, pace: e.target.value as any }))
          }
        >
          <option value="relaxed">
            Relaxed (Fewer activities, more downtime)
          </option>
          <option value="moderate">Moderate (Balanced pace)</option>
          <option value="packed">Packed (Maximum activities)</option>
        </select>
      </div>

      {/* Dietary Restrictions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          🍽️ Dietary Restrictions (Optional)
        </label>
        <input
          type="text"
          placeholder="Vegetarian, Vegan, Gluten-free, etc."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          value={formData.dietaryRestrictions || ""}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              dietaryRestrictions: e.target.value,
            }))
          }
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
            Generating Your Itinerary...
          </>
        ) : (
          "Generate My Itinerary →"
        )}
      </button>
    </form>
  );
}
