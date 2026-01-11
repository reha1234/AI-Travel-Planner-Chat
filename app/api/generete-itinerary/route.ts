import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { TripInput, ItineraryResponse } from "../../../types";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const tripInput: TripInput = await request.json();

    // Generate itinerary using available AI provider
    const itinerary = await generateItineraryWithAI(tripInput);

    // Save to Supabase
    const { data, error } = await supabase
      .from("itineraries")
      .insert({
        trip_input: tripInput,
        days: itinerary.days,
        budget_breakdown: itinerary.budget_breakdown,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      itineraryId: data.id,
      itinerary: data,
    });
  } catch (error) {
    console.error("Error generating itinerary:", error);
    return NextResponse.json(
      { error: "Failed to generate itinerary. Please try again." },
      { status: 500 }
    );
  }
}

async function generateItineraryWithAI(
  tripInput: TripInput
): Promise<ItineraryResponse> {
  // Try Gemini first, then fallback to mock data
  try {
    if (process.env.GOOGLE_AI_API_KEY) {
      return await generateWithGemini(tripInput);
    }
  } catch (error) {
    console.error("Gemini failed, using mock data:", error);
  }

  // Fallback to mock data
  return generateMockItinerary(tripInput);
}

// Google Gemini Implementation (FREE)
async function generateWithGemini(
  tripInput: TripInput
): Promise<ItineraryResponse> {
  const prompt = createPrompt(tripInput);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4000,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Gemini API error: ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  const content = data.candidates[0].content.parts[0].text;

  // Extract JSON from response
  const jsonMatch =
    content.match(/```json\n([\s\S]*?)\n```/) || content.match(/{[\s\S]*}/);
  const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content;

  try {
    return JSON.parse(jsonString);
  } catch (parseError) {
    console.error("Failed to parse Gemini response. Raw content:", content);
    throw new Error("Invalid response format from AI");
  }
}

function createPrompt(tripInput: TripInput): string {
  const days =
    Math.ceil(
      (new Date(tripInput.endDate).getTime() -
        new Date(tripInput.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1;

  return `Generate a ${days}-day travel itinerary for ${tripInput.destination}.

Constraints:
- Budget: Rp ${tripInput.budgetPerPerson.toLocaleString()} per person (${
    tripInput.travelers
  } people)
- Travel style: ${tripInput.travelStyle.join(", ")}
- Pace: ${tripInput.pace}
- Interests: ${tripInput.interests?.join(", ") || "General"}
- Dietary restrictions: ${tripInput.dietaryRestrictions || "None"}

IMPORTANT: Return ONLY valid JSON, no other text.

JSON Structure:
{
  "days": [
    {
      "day": 1,
      "date": "${tripInput.startDate}",
      "activities": {
        "morning": {
          "name": "Activity name",
          "description": "Detailed description with practical tips",
          "duration": "2-3 hours",
          "cost": 150000
        },
        "lunch": {
          "name": "Restaurant name",
          "description": "Cuisine type and highlights",
          "duration": "1 hour",
          "cost": 200000
        },
        "afternoon": {
          "name": "Activity name",
          "description": "Detailed description",
          "duration": "3 hours",
          "cost": 100000
        },
        "dinner": {
          "name": "Restaurant name",
          "description": "Cuisine type and highlights",
          "duration": "1.5 hours",
          "cost": 300000
        },
        "evening": {
          "name": "Optional activity",
          "description": "Description",
          "duration": "2 hours",
          "cost": 50000
        }
      }
    }
  ],
  "budget_breakdown": {
    "accommodation": 3200000,
    "food": 3000000,
    "activities": 2000000,
    "transportation": 1000000,
    "miscellaneous": 300000,
    "total": 9500000
  }
}

Make sure the total budget is approximately Rp ${(
    tripInput.budgetPerPerson * tripInput.travelers
  ).toLocaleString()} for ${tripInput.travelers} people.`;
}

// Mock data fallback
function generateMockItinerary(tripInput: TripInput): ItineraryResponse {
  const days =
    Math.ceil(
      (new Date(tripInput.endDate).getTime() -
        new Date(tripInput.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1;

  const totalBudget = tripInput.budgetPerPerson * tripInput.travelers;

  return {
    days: Array.from({ length: days }, (_, i) => ({
      day: i + 1,
      date: new Date(
        new Date(tripInput.startDate).getTime() + i * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .split("T")[0],
      activities: {
        morning: {
          name: `${tripInput.destination} City Exploration`,
          description: `Start your day exploring the highlights of ${tripInput.destination}. Visit local landmarks and get familiar with the area.`,
          duration: "3-4 hours",
          cost: 50000,
        },
        lunch: {
          name: "Local Cuisine Experience",
          description: `Enjoy authentic ${tripInput.destination} cuisine at a recommended local restaurant.`,
          duration: "1 hour",
          cost: 150000,
        },
        afternoon: {
          name: "Cultural & Historical Sites",
          description: `Discover the rich culture and history of ${tripInput.destination} through its museums, temples, or historical sites.`,
          duration: "3 hours",
          cost: 75000,
        },
        dinner: {
          name: "Evening Dining",
          description: `Relax and enjoy dinner at a well-rated restaurant featuring local specialties.`,
          duration: "1.5 hours",
          cost: 250000,
        },
        evening: {
          name: "Night Market & Local Life",
          description: `Experience the local night life, visit markets, or take a relaxing evening walk.`,
          duration: "2 hours",
          cost: 50000,
        },
      },
    })),
    budget_breakdown: {
      accommodation: Math.round(totalBudget * 0.4),
      food: Math.round(totalBudget * 0.3),
      activities: Math.round(totalBudget * 0.15),
      transportation: Math.round(totalBudget * 0.1),
      miscellaneous: Math.round(totalBudget * 0.05),
      total: totalBudget,
    },
  };
}
