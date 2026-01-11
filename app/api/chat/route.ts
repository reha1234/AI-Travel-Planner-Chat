import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");
const MODEL_NAME = "gemini-2.5-flash";

interface PromptMessage {
  role: "user" | "assistant";
  content: string;
}

// ----------------------------------------------------------------------------------
// --- HELPER FUNCTIONS ---
// ----------------------------------------------------------------------------------

function isTravelRequest(message: string): boolean {
  const lower = message.toLowerCase();

  const travelKeywords = [
    "pergi",
    "liburan",
    "wisata",
    "jalan",
    "travel",
    "trip",
    "vacation",
    "holiday",
    "destination",
    "destinasi",
    "kunjung",
    "visit",
    "explore",
    "tour",
    "hari",
    "day",
    "days",
    "weekend",
    "minggu",
    "bulan",
    "budget",
    "biaya",
    "harga",
    "cost",
    "price",
    "hotel",
    "penginapan",
    "akomodasi",
    "accommodation",
    "penerbangan",
    "flight",
    "tiket",
    "ticket",
    "pesawat",
    "rencana",
    "itinerary",
    "plan",
    "agenda",
    "bali",
    "jakarta",
    "paris",
    "tokyo",
    "london",
    "bangkok",
    "yogyakarta",
    "jogja",
    "bandung",
    "lombok",
    "surabaya",
    "singapore",
    "bangkok",
    "kuala lumpur",
    "hong kong",
  ];

  const hasTravelWord = travelKeywords.some((word) => lower.includes(word));
  const hasNumberAndWord = /\d+\s+(hari|day|days|minggu|week)/i.test(lower);

  return hasTravelWord || hasNumberAndWord;
}

function detectUserLanguage(message: string): string {
  const lower = message.toLowerCase();

  const indoWords = [
    "apa",
    "bagaimana",
    "berapa",
    "dimana",
    "kapan",
    "terima",
    "kasih",
    "tolong",
    "ya",
    "tidak",
    "mau",
    "ingin",
    "bisa",
    "pergi",
  ];
  const engWords = [
    "what",
    "how",
    "when",
    "where",
    "thank",
    "thanks",
    "please",
    "yes",
    "no",
    "want",
    "would",
    "like",
    "can",
    "go",
  ];

  let indoScore = 0,
    engScore = 0;

  indoWords.forEach((word) => {
    if (lower.includes(word)) indoScore++;
  });

  engWords.forEach((word) => {
    if (lower.includes(word)) engScore++;
  });

  return indoScore >= engScore ? "indonesian" : "english";
}

function extractTravelDetails(message: string) {
  const lower = message.toLowerCase();

  let destination = null;

  const destinations = [
    { name: "Bali", keywords: ["bali"] },
    { name: "Jakarta", keywords: ["jakarta", "jkt"] },
    { name: "Yogyakarta", keywords: ["yogyakarta", "jogja", "jogjakarta"] },
    { name: "Bandung", keywords: ["bandung", "bdg"] },
    { name: "Lombok", keywords: ["lombok"] },
    { name: "Surabaya", keywords: ["surabaya", "sby"] },
    { name: "Medan", keywords: ["medan"] },
    { name: "Paris", keywords: ["paris"] },
    { name: "Tokyo", keywords: ["tokyo"] },
    { name: "London", keywords: ["london"] },
    { name: "Bangkok", keywords: ["bangkok"] },
    { name: "Singapore", keywords: ["singapore", "singapura"] },
    { name: "Sydney", keywords: ["sydney"] },
    { name: "Kuala Lumpur", keywords: ["kuala lumpur", "kl"] },
    { name: "Hong Kong", keywords: ["hong kong", "hongkong"] },
  ];

  for (const dest of destinations) {
    if (dest.keywords.some((keyword) => lower.includes(keyword))) {
      destination = dest.name;
      break;
    }
  }

  if (!destination) {
    destination = "Bali";
  }

  let duration = 4;
  const durationMatch = lower.match(/(\d+)\s*(hari|day|days|d)/i);
  if (durationMatch) {
    duration = parseInt(durationMatch[1]);
    duration = Math.min(duration, 14);
  } else {
    const numberMatch = lower.match(/\b([1-9]|1[0-4])\b/);
    if (numberMatch) {
      duration = parseInt(numberMatch[1]);
    }
  }

  let budget = null;

  const jutaMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*(juta|jt|million|m)\b/i);
  if (jutaMatch) {
    const amount = parseFloat(
      jutaMatch[1].replace(/\./g, "").replace(",", ".")
    );
    budget = `Rp ${(amount * 1000000).toLocaleString("id-ID")}`;
  }

  if (!budget) {
    const ribuMatch = lower.match(
      /(\d+(?:[.,]\d+)?)\s*(ribu|rb|k|thousand)\b/i
    );
    if (ribuMatch) {
      const amount = parseFloat(
        ribuMatch[1].replace(/\./g, "").replace(",", ".")
      );
      budget = `Rp ${(amount * 1000).toLocaleString("id-ID")}`;
    }
  }

  if (!budget) {
    const dottedMatch = lower.match(/(\d{1,3}(?:\.\d{3})+(?:,\d+)?)/);
    if (dottedMatch) {
      const amount = parseFloat(
        dottedMatch[1].replace(/\./g, "").replace(",", ".")
      );
      budget = `Rp ${amount.toLocaleString("id-ID")}`;
    }
  }

  if (!budget) {
    const budgetMatch = lower.match(/budget\s*[:]?\s*(\d+(?:[.,]\d+)?)/i);
    if (budgetMatch) {
      const amount = parseFloat(
        budgetMatch[1].replace(/\./g, "").replace(",", ".")
      );
      budget =
        amount < 100
          ? `Rp ${(amount * 1000000).toLocaleString("id-ID")}`
          : `Rp ${amount.toLocaleString("id-ID")}`;
    }
  }

  if (!budget) {
    budget = `Rp ${(duration * 2000000).toLocaleString("id-ID")}`;
  }

  return { destination, duration, budget };
}

function getFutureDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);

  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  };

  return date.toLocaleDateString("en-US", options);
}

function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function cleanHTMLResponse(html: string): string {
  return html
    .replace(/```html\n?/g, "")
    .replace(/```\n?/g, "")
    .replace(/^["']|["']$/g, "")
    .trim();
}

function generateDetailedError(): string {
  return `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; color: #374151; max-width: 100%; width: 100%; padding: 20px;">

  <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 40px 30px; border-radius: 20px; margin-bottom: 30px; text-align: center;">
    <div style="font-size: 48px; margin-bottom: 15px;">⚠️</div>
    <h1 style="color: white; font-size: 32px; margin: 0 0 10px 0; font-weight: 800;">Oops! Server Error</h1>
    <p style="font-size: 18px; opacity: 0.9; margin: 0;">We're generating too much awesome content!</p>
  </div>

  <div style="background: white; padding: 30px; border-radius: 16px; border: 1px solid #e5e7eb; margin-bottom: 25px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
    <h2 style="color: #1e40af; font-size: 26px; margin: 0 0 20px 0; font-weight: 700;">🔄 Quick Solutions</h2>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 25px 0;">
      <div style="background: #f0f9ff; padding: 20px; border-radius: 12px; border: 1px solid #bae6fd; text-align: center;">
        <div style="font-size: 32px; margin-bottom: 10px;">1️⃣</div>
        <div style="color: #1e40af; font-weight: 700; margin-bottom: 8px; font-size: 18px;">Refresh Page</div>
        <div style="color: #4b5563; font-size: 14px;">Press F5 or refresh button</div>
      </div>
      
      <div style="background: #f0f9ff; padding: 20px; border-radius: 12px; border: 1px solid #bae6fd; text-align: center;">
        <div style="font-size: 32px; margin-bottom: 10px;">2️⃣</div>
        <div style="color: #1e40af; font-weight: 700; margin-bottom: 8px; font-size: 18px;">Simplify Request</div>
        <div style="color: #4b5563; font-size: 14px;">Use shorter destination names</div>
      </div>
      
      <div style="background: #f0f9ff; padding: 20px; border-radius: 12px; border: 1px solid #bae6fd; text-align: center;">
        <div style="font-size: 32px; margin-bottom: 10px;">3️⃣</div>
        <div style="color: #1e40af; font-weight: 700; margin-bottom: 8px; font-size: 18px;">Try Example</div>
        <div style="color: #4b5563; font-size: 14px;">"Bali 3 days 5 million"</div>
      </div>
    </div>
    
    <div style="text-align: center; margin-top: 30px;">
      <div style="padding: 15px 30px; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; border: none; border-radius: 10px; font-weight: 700; font-size: 16px; cursor: pointer; display: inline-flex; align-items: center; gap: 10px;">
        <span>🔄</span> Refresh & Try Again
      </div>
    </div>
  </div>

</div>`;
}

// ----------------------------------------------------------------------------------
// --- SUPER DETAILED PLAN GENERATOR ---
// ----------------------------------------------------------------------------------

async function generateSuperDetailedPlan(userMessage: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: {
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 30000, // Tetap 8000, tapi template lebih efisien
      },
    });

    const userLanguage = detectUserLanguage(userMessage);
    const isIndonesian = userLanguage === "indonesian";
    const travelDetails = extractTravelDetails(userMessage);

    const destination = travelDetails.destination || "Bali";
    const duration = Math.min(travelDetails.duration || 4, 7); // Maks 7 hari
    const budget =
      travelDetails.budget || (isIndonesian ? "Rp 8.000.000" : "IDR 8,000,000");

    // ===== PROMPT YANG LEBIH EFISIEN =====
    const prompt = `Create a COMPREHENSIVE but CONCISE travel plan for ${destination} for ${duration} days with budget ${budget}.

**CRITICAL REQUIREMENTS:**
1. Create REALISTIC hourly itineraries for EACH day
2. Include SPECIFIC budget breakdown tables
3. Recommend REAL restaurants with signature dishes
4. Keep HTML CLEAN and READABLE
5. Focus on QUALITY over QUANTITY of HTML

**RESPONSE FORMAT:**
1. Destination Overview (brief)
2. Key Attractions (bullet points)
3. Daily Itinerary Table (hourly schedule)
4. Restaurant Recommendations (table)
5. Budget Breakdown (tables)
6. Packing Tips

**RESPOND IN ${isIndonesian ? "INDONESIAN" : "ENGLISH"}**

**CREATE THIS HTML STRUCTURE (FILL ALL CONTENT):**

<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; color: #374151; max-width: 100%; width: 100%; padding: 20px;">

<!-- HEADER -->
<div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; border-radius: 15px; margin-bottom: 30px; text-align: center;">
  <h1 style="color: white; font-size: 32px; margin: 0 0 10px 0; font-weight: 800;">${destination.toUpperCase()} ${duration}-DAY ITINERARY</h1>
  <p style="font-size: 16px; opacity: 0.9; margin: 0;">Complete Travel Guide • Budget: ${budget}</p>
</div>

<!-- QUICK OVERVIEW -->
<div style="background: white; padding: 25px; border-radius: 12px; border: 1px solid #e5e7eb; margin-bottom: 25px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
  <h2 style="color: #1e40af; font-size: 24px; margin: 0 0 15px 0; font-weight: 700;">📍 Quick Overview</h2>
  <p style="color: #4b5563; margin-bottom: 15px; font-size: 16px; line-height: 1.6;">
    ${destination} is [2-3 sentences about the destination].
  </p>
  
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 20px;">
    <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; border: 1px solid #bae6fd;">
      <div style="color: #1e40af; font-weight: 600; margin-bottom: 5px;">📅 Duration</div>
      <div style="color: #4b5563; font-size: 14px;">${duration} days</div>
    </div>
    <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; border: 1px solid #bae6fd;">
      <div style="color: #1e40af; font-weight: 600; margin-bottom: 5px;">💰 Budget</div>
      <div style="color: #4b5563; font-size: 14px;">${budget}</div>
    </div>
    <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; border: 1px solid #bae6fd;">
      <div style="color: #1e40af; font-weight: 600; margin-bottom: 5px;">🏆 Best For</div>
      <div style="color: #4b5563; font-size: 14px;">[Type of travelers]</div>
    </div>
  </div>
</div>

<!-- TOP ATTRACTIONS -->
<div style="background: white; padding: 25px; border-radius: 12px; border: 1px solid #e5e7eb; margin-bottom: 25px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
  <h2 style="color: #1e40af; font-size: 24px; margin: 0 0 15px 0; font-weight: 700;">🌟 Must-Visit Attractions</h2>
  
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px;">
    <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
      <div style="color: #1e40af; font-weight: 700; margin-bottom: 8px;">1. [Attraction Name]</div>
      <p style="color: #4b5563; margin: 0; font-size: 14px; line-height: 1.5;">[Brief description - 2 sentences]</p>
      <div style="margin-top: 10px; color: #6b7280; font-size: 13px;">
        <span style="display: inline-block; background: #e0e7ff; padding: 3px 8px; border-radius: 4px; margin-right: 5px;">💰 [Price]</span>
        <span style="display: inline-block; background: #fef3c7; padding: 3px 8px; border-radius: 4px;">🕘 [Hours]</span>
      </div>
    </div>
    
    <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
      <div style="color: #1e40af; font-weight: 700; margin-bottom: 8px;">2. [Attraction Name]</div>
      <p style="color: #4b5563; margin: 0; font-size: 14px; line-height: 1.5;">[Brief description - 2 sentences]</p>
      <div style="margin-top: 10px; color: #6b7280; font-size: 13px;">
        <span style="display: inline-block; background: #e0e7ff; padding: 3px 8px; border-radius: 4px; margin-right: 5px;">💰 [Price]</span>
        <span style="display: inline-block; background: #fef3c7; padding: 3px 8px; border-radius: 4px;">🕘 [Hours]</span>
      </div>
    </div>
    
    <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
      <div style="color: #1e40af; font-weight: 700; margin-bottom: 8px;">3. [Attraction Name]</div>
      <p style="color: #4b5563; margin: 0; font-size: 14px; line-height: 1.5;">[Brief description - 2 sentences]</p>
      <div style="margin-top: 10px; color: #6b7280; font-size: 13px;">
        <span style="display: inline-block; background: #e0e7ff; padding: 3px 8px; border-radius: 4px; margin-right: 5px;">💰 [Price]</span>
        <span style="display: inline-block; background: #fef3c7; padding: 3px 8px; border-radius: 4px;">🕘 [Hours]</span>
      </div>
    </div>
  </div>
</div>

<!-- DAILY ITINERARY TABLE -->
<div style="background: white; padding: 25px; border-radius: 12px; border: 1px solid #e5e7eb; margin-bottom: 25px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
  <h2 style="color: #1e40af; font-size: 24px; margin: 0 0 15px 0; font-weight: 700;">🗓️ Daily Itinerary</h2>
  
  <div style="overflow-x: auto; margin-bottom: 20px;">
    <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; min-width: 800px;">
      <thead>
        <tr style="background: #3b82f6;">
          <th style="padding: 12px 15px; text-align: left; color: white; font-weight: 600; width: 15%;">Day</th>
          <th style="padding: 12px 15px; text-align: left; color: white; font-weight: 600; width: 20%;">Morning (7-12)</th>
          <th style="padding: 12px 15px; text-align: left; color: white; font-weight: 600; width: 20%;">Afternoon (12-5)</th>
          <th style="padding: 12px 15px; text-align: left; color: white; font-weight: 600; width: 20%;">Evening (5-10)</th>
          <th style="padding: 12px 15px; text-align: left; color: white; font-weight: 600; width: 15%;">Daily Cost</th>
        </tr>
      </thead>
      <tbody>
        ${Array.from({ length: duration }, (_, i) => {
          const dayNum = i + 1;
          return `
          <tr style="background: ${i % 2 === 0 ? "#f8fafc" : "white"};">
            <td style="padding: 12px 15px; border-bottom: 1px solid #e5e7eb; font-weight: 700; color: #1e40af;">Day ${dayNum}</td>
            <td style="padding: 12px 15px; border-bottom: 1px solid #e5e7eb; color: #4b5563;">
              <div style="font-weight: 600; color: #1f2937; margin-bottom: 5px;">• [Morning Activity 1]</div>
              <div style="font-size: 13px; color: #6b7280;">[Time] at [Location]</div>
            </td>
            <td style="padding: 12px 15px; border-bottom: 1px solid #e5e7eb; color: #4b5563;">
              <div style="font-weight: 600; color: #1f2937; margin-bottom: 5px;">• [Afternoon Activity]</div>
              <div style="font-size: 13px; color: #6b7280;">[Time] at [Location]</div>
              <div style="color: #dc2626; font-size: 13px; margin-top: 5px;">🍽️ Lunch: [Restaurant]</div>
            </td>
            <td style="padding: 12px 15px; border-bottom: 1px solid #e5e7eb; color: #4b5563;">
              <div style="font-weight: 600; color: #1f2937; margin-bottom: 5px;">• [Evening Activity]</div>
              <div style="font-size: 13px; color: #6b7280;">[Time] at [Location]</div>
              <div style="color: #059669; font-size: 13px; margin-top: 5px;">🍽️ Dinner: [Restaurant]</div>
            </td>
            <td style="padding: 12px 15px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 700; color: #1e40af;">Rp ${(1400000).toLocaleString(
              "id-ID"
            )}</td>
          </tr>
          `;
        }).join("")}
      </tbody>
    </table>
  </div>
  
  <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; border: 1px solid #bae6fd; margin-top: 15px;">
    <div style="color: #1e40af; font-weight: 700; margin-bottom: 8px; font-size: 16px;">💡 Itinerary Tips:</div>
    <ul style="color: #4b5563; margin: 0; padding-left: 20px; font-size: 14px;">
      <li>Start early to avoid crowds at popular attractions</li>
      <li>Allow 30-60 minutes travel time between locations</li>
      <li>Stay hydrated and take breaks in shaded areas</li>
      <li>Be flexible - weather or traffic may require adjustments</li>
    </ul>
  </div>
</div>

<!-- RESTAURANT RECOMMENDATIONS -->
<div style="background: white; padding: 25px; border-radius: 12px; border: 1px solid #e5e7eb; margin-bottom: 25px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
  <h2 style="color: #1e40af; font-size: 24px; margin: 0 0 15px 0; font-weight: 700;">🍽️ Must-Try Restaurants</h2>
  
  <div style="overflow-x: auto;">
    <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; min-width: 700px;">
      <thead>
        <tr style="background: #dc2626;">
          <th style="padding: 12px 15px; text-align: left; color: white; font-weight: 600;">Restaurant</th>
          <th style="padding: 12px 15px; text-align: left; color: white; font-weight: 600;">Cuisine</th>
          <th style="padding: 12px 15px; text-align: left; color: white; font-weight: 600;">Must-Try Dishes</th>
          <th style="padding: 12px 15px; text-align: left; color: white; font-weight: 600;">Price Range</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background: #f8fafc;">
          <td style="padding: 12px 15px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #1f2937;">[Restaurant 1]</td>
          <td style="padding: 12px 15px; border-bottom: 1px solid #e5e7eb; color: #4b5563;">[Cuisine type]</td>
          <td style="padding: 12px 15px; border-bottom: 1px solid #e5e7eb; color: #4b5563;">
            <div style="color: #059669; font-weight: 600;">• [Dish 1]</div>
            <div style="color: #7c3aed; font-weight: 600; margin-top: 3px;">• [Dish 2]</div>
          </td>
          <td style="padding: 12px 15px; border-bottom: 1px solid #e5e7eb; color: #dc2626; font-weight: 600;">[$$]</td>
        </tr>
        <tr style="background: white;">
          <td style="padding: 12px 15px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #1f2937;">[Restaurant 2]</td>
          <td style="padding: 12px 15px; border-bottom: 1px solid #e5e7eb; color: #4b5563;">[Cuisine type]</td>
          <td style="padding: 12px 15px; border-bottom: 1px solid #e5e7eb; color: #4b5563;">
            <div style="color: #059669; font-weight: 600;">• [Dish 1]</div>
            <div style="color: #7c3aed; font-weight: 600; margin-top: 3px;">• [Dish 2]</div>
          </td>
          <td style="padding: 12px 15px; border-bottom: 1px solid #e5e7eb; color: #dc2626; font-weight: 600;">[$$]</td>
        </tr>
        <tr style="background: #f8fafc;">
          <td style="padding: 12px 15px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #1f2937;">[Restaurant 3]</td>
          <td style="padding: 12px 15px; border-bottom: 1px solid #e5e7eb; color: #4b5563;">[Cuisine type]</td>
          <td style="padding: 12px 15px; border-bottom: 1px solid #e5e7eb; color: #4b5563;">
            <div style="color: #059669; font-weight: 600;">• [Dish 1]</div>
            <div style="color: #7c3aed; font-weight: 600; margin-top: 3px;">• [Dish 2]</div>
          </td>
          <td style="padding: 12px 15px; border-bottom: 1px solid #e5e7eb; color: #dc2626; font-weight: 600;">[$$]</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

<!-- BUDGET BREAKDOWN -->
<div style="background: white; padding: 25px; border-radius: 12px; border: 1px solid #e5e7eb; margin-bottom: 25px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
  <h2 style="color: #1e40af; font-size: 24px; margin: 0 0 15px 0; font-weight: 700;">💰 Budget Breakdown</h2>
  
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 20px;">
    <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
      <h3 style="color: #2563eb; font-size: 18px; margin: 0 0 10px 0; font-weight: 600;">📊 Daily Expenses</h3>
      <div style="margin-bottom: 10px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <span style="color: #4b5563;">Accommodation</span>
          <span style="font-weight: 600; color: #1e40af;">Rp 450.000</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <span style="color: #4b5563;">Food & Drinks</span>
          <span style="font-weight: 600; color: #dc2626;">Rp 350.000</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <span style="color: #4b5563;">Transportation</span>
          <span style="font-weight: 600; color: #7c3aed;">Rp 300.000</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <span style="color: #4b5563;">Activities</span>
          <span style="font-weight: 600; color: #059669;">Rp 200.000</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 2px solid #e5e7eb; margin-top: 5px;">
          <span style="font-weight: 700; color: #1f2937;">Daily Total</span>
          <span style="font-weight: 800; color: #1e40af;">Rp 1.300.000</span>
        </div>
      </div>
    </div>
    
    <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
      <h3 style="color: #2563eb; font-size: 18px; margin: 0 0 10px 0; font-weight: 600;">📈 Total for ${duration} Days</h3>
      <div style="text-align: center; padding: 15px;">
        <div style="font-size: 32px; font-weight: 800; color: #1e40af; margin-bottom: 5px;">Rp ${(
          1300000 * duration
        ).toLocaleString("id-ID")}</div>
        <div style="color: #6b7280; font-size: 14px;">Per person estimate</div>
      </div>
      <div style="background: #f0f9ff; padding: 10px; border-radius: 6px; margin-top: 10px;">
        <div style="color: #1e40af; font-weight: 600; font-size: 14px;">Budget Allocation:</div>
        <div style="display: flex; justify-content: space-between; margin-top: 5px;">
          <span style="color: #4b5563; font-size: 13px;">Accommodation</span>
          <span style="font-weight: 600; color: #1e40af; font-size: 13px;">35%</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #4b5563; font-size: 13px;">Food & Drinks</span>
          <span style="font-weight: 600; color: #dc2626; font-size: 13px;">27%</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #4b5563; font-size: 13px;">Transportation</span>
          <span style="font-weight: 600; color: #7c3aed; font-size: 13px;">23%</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #4b5563; font-size: 13px;">Activities</span>
          <span style="font-weight: 600; color: #059669; font-size: 13px;">15%</span>
        </div>
      </div>
    </div>
  </div>
  
  <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border: 1px solid #fbbf24;">
    <div style="color: #92400e; font-weight: 700; margin-bottom: 8px; font-size: 16px;">💡 Money-Saving Tips:</div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 10px;">
      <div style="color: #4b5563; font-size: 14px;">
        <div style="font-weight: 600; color: #1e40af;">• Accommodation</div>
        <div style="font-size: 13px;">Book homestays or guesthouses instead of hotels</div>
      </div>
      <div style="color: #4b5563; font-size: 14px;">
        <div style="font-weight: 600; color: #dc2626;">• Food</div>
        <div style="font-size: 13px;">Eat at local warungs for authentic & cheap meals</div>
      </div>
      <div style="color: #4b5563; font-size: 14px;">
        <div style="font-weight: 600; color: #7c3aed;">• Transport</div>
        <div style="font-size: 13px;">Rent scooter (Rp 70k/day) instead of private driver</div>
      </div>
    </div>
  </div>
</div>

<!-- PACKING TIPS -->
<div style="background: white; padding: 25px; border-radius: 12px; border: 1px solid #e5e7eb; margin-bottom: 25px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
  <h2 style="color: #1e40af; font-size: 24px; margin: 0 0 15px 0; font-weight: 700;">🎒 Essential Packing List</h2>
  
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
    <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
      <div style="color: #1e40af; font-weight: 600; margin-bottom: 10px;">👕 Clothing</div>
      <ul style="color: #4b5563; margin: 0; padding-left: 20px; font-size: 14px;">
        <li>Lightweight cotton clothes</li>
        <li>Swimwear & beach cover-up</li>
        <li>Comfortable walking shoes</li>
        <li>Light jacket for evenings</li>
      </ul>
    </div>
    
    <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
      <div style="color: #1e40af; font-weight: 600; margin-bottom: 10px;">💊 Essentials</div>
      <ul style="color: #4b5563; margin: 0; padding-left: 20px; font-size: 14px;">
        <li>Sunscreen SPF 50+</li>
        <li>Insect repellent</li>
        <li>Basic first aid kit</li>
        <li>Personal medication</li>
      </ul>
    </div>
    
    <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
      <div style="color: #1e40af; font-weight: 600; margin-bottom: 10px;">📱 Electronics</div>
      <ul style="color: #4b5563; margin: 0; padding-left: 20px; font-size: 14px;">
        <li>Power bank (20,000 mAh)</li>
        <li>Universal adapter</li>
        <li>Waterproof phone case</li>
        <li>Portable speaker (optional)</li>
      </ul>
    </div>
  </div>
</div>

<!-- FINAL TIPS -->
<div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 25px; border-radius: 12px; text-align: center;">
  <div style="font-size: 24px; margin-bottom: 10px;">✨</div>
  <div style="font-size: 20px; font-weight: 700; margin-bottom: 10px;">Ready for Your ${destination} Adventure!</div>
  <p style="opacity: 0.9; font-size: 16px; margin-bottom: 15px; max-width: 600px; margin-left: auto; margin-right: auto;">
    This ${duration}-day itinerary is designed to give you the best experience of ${destination} within your ${budget} budget.
  </p>
  <div style="display: inline-block; background: white; color: #059669; padding: 8px 20px; border-radius: 20px; font-weight: 700; font-size: 14px;">
    Total Estimated: Rp ${(1300000 * duration).toLocaleString("id-ID")}
  </div>
</div>

</div>

**NOW FILL ALL [BRACKETED PLACEHOLDERS] WITH REAL, SPECIFIC INFORMATION ABOUT ${destination}:**
- For Day 1-${duration}: Fill morning, afternoon, evening activities with REAL locations and times
- For Restaurants: Use REAL restaurant names from ${destination} with their REAL signature dishes
- For Attractions: Use REAL attraction names from ${destination} with brief descriptions
- Use REALISTIC prices based on ${budget} budget

**MAKE SURE ALL CONTENT IS COMPLETE AND PRACTICAL FOR TRAVELERS.**`;

    console.log("Sending efficient prompt...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("Generated efficient detailed plan");
    return cleanHTMLResponse(text);
  } catch (error) {
    console.error("Gemini error:", error);
    return generateSuperDetailedFallback(userMessage);
  }
}

// async function generateSuperDetailedPlan(userMessage: string): Promise<string> {
//   try {
//     const model = genAI.getGenerativeModel({
//       model: MODEL_NAME,
//       generationConfig: {
//         temperature: 0.9, // Tingkatkan temperature untuk lebih kreatif
//         topK: 50,
//         topP: 0.95,
//         maxOutputTokens: 12000, // Tambah token untuk lebih detail
//       },
//     });

//     const userLanguage = detectUserLanguage(userMessage);
//     const isIndonesian = userLanguage === "indonesian";
//     const travelDetails = extractTravelDetails(userMessage);

//     const destination = travelDetails.destination || "Bali";
//     const duration = travelDetails.duration || 4;
//     const budget =
//       travelDetails.budget || (isIndonesian ? "Rp 8.000.000" : "IDR 8,000,000");

//     // Get future dates for the itinerary
//     const futureDates: string[] = Array.from({ length: duration }, (_, i) => {
//       return getFutureDate(i + 1);
//     });

//     // ===== PROMPT YANG LEBIH SPECIFIC =====
//     const prompt = `Create an EXTREMELY DETAILED travel plan with rich content. User wants ${duration} days in ${destination} with budget ${budget}.

// **CRITICAL REQUIREMENTS - YOU MUST:**
// 1. Fill ALL template placeholders with REAL, SPECIFIC information about ${destination}
// 2. Create COMPLETE daily itineraries with hourly activities
// 3. Include DETAILED budget breakdown tables with real numbers
// 4. Recommend REAL restaurants with specific dish names and prices
// 5. Mention REAL upcoming events in ${destination} for next 3 months
// 6. Make it PRACTICAL and USEFUL for travelers

// **IMPORTANT: DO NOT LEAVE ANY PLACEHOLDERS LIKE [ACTIVITY 1]. YOU MUST REPLACE ALL WITH REAL CONTENT.**

// **RESPOND IN ${isIndonesian ? "INDONESIAN" : "ENGLISH"}**

// **DESTINATION SPECIFIC GUIDELINES FOR ${destination}:**
// - Research actual attractions, restaurants, and activities in ${destination}
// - Use realistic prices based on ${budget}
// - Create logical daily schedules that make geographical sense
// - Include transportation times between locations
// - Add specific time slots for each activity
// - Calculate realistic daily budgets

// **START YOUR RESPONSE WITH THIS EXACT HTML (but fill ALL placeholders):**

// <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; color: #374151; max-width: 100%; width: 100%;">

//   <!-- DESTINATION OVERVIEW -->
//   <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 40px 30px; border-radius: 20px; margin-bottom: 40px; width: 100%;">
//     <h1 style="color: white; font-size: 36px; margin: 0 0 15px 0; font-weight: 800;">${destination.toUpperCase()} ${duration}-DAY JOURNEY</h1>
//     <p style="font-size: 18px; opacity: 0.9; margin: 0;">Complete Travel Guide with Detailed Recommendations</p>
//   </div>

//   <!-- DESTINATION INTRODUCTION -->
//   <div style="background: white; padding: 35px; border-radius: 16px; border: 1px solid #e5e7eb; margin-bottom: 35px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); width: 100%;">
//     <h2 style="color: #1e40af; font-size: 28px; margin: 0 0 20px 0; font-weight: 700;">Discover ${destination}</h2>
//     <p style="font-size: 17px; color: #4b5563; margin-bottom: 20px; line-height: 1.8;">
//       ${destination} is [WRITE 2-3 PARAGRAPHS ABOUT THE DESTINATION]
//     </p>

//     <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 25px;">
//       <div style="background: #f0f9ff; padding: 20px; border-radius: 12px; border: 1px solid #bae6fd;">
//         <div style="color: #1e40af; font-weight: 600; margin-bottom: 8px;">🏆 Best For</div>
//         <div style="color: #4b5563;">[e.g., Culture lovers, Foodies, Nature enthusiasts, Adventure seekers]</div>
//       </div>
//       <div style="background: #f0f9ff; padding: 20px; border-radius: 12px; border: 1px solid #bae6fd;">
//         <div style="color: #1e40af; font-weight: 600; margin-bottom: 8px;">📅 Ideal Duration</div>
//         <div style="color: #4b5563;">${duration} days minimum</div>
//       </div>
//       <div style="background: #f0f9ff; padding: 20px; border-radius: 12px; border: 1px solid #bae6fd;">
//         <div style="color: #1e40af; font-weight: 600; margin-bottom: 8px;">💰 Budget Level</div>
//         <div style="color: #4b5563;">${budget} (mid-range)</div>
//       </div>
//     </div>
//   </div>

//   <!-- UPCOMING EVENTS & FESTIVALS -->
//   <div style="background: #fef3c7; padding: 30px; border-radius: 16px; border: 2px solid #fbbf24; margin-bottom: 35px; width: 100%;">
//     <h2 style="color: #92400e; font-size: 26px; margin: 0 0 20px 0; font-weight: 700;">🎉 Upcoming Events in ${destination}</h2>
//     <div style="background: white; padding: 25px; border-radius: 12px; margin-top: 15px;">
//       <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 20px;">[NAME OF REAL EVENT IN ${destination}]</h3>
//       <p style="color: #4b5563; margin-bottom: 12px;"><strong>📅 Date:</strong> [Specific dates in next 3 months]</p>
//       <p style="color: #4b5563; margin-bottom: 12px;"><strong>📍 Location:</strong> [Venue name and area]</p>
//       <p style="color: #4b5563; margin-bottom: 15px;"><strong>🎪 Description:</strong> [Detailed 3-4 sentence description]</p>
//       <p style="color: #4b5563;"><strong>💡 Tips:</strong> [How to get tickets, best time to go]</p>
//     </div>
//   </div>

//   <!-- DETAILED DAILY ITINERARY - THIS IS THE MOST IMPORTANT PART -->
//   <div style="background: white; padding: 35px; border-radius: 16px; border: 1px solid #e5e7eb; margin-bottom: 35px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); width: 100%;">
//     <h2 style="color: #1e40af; font-size: 28px; margin: 0 0 25px 0; font-weight: 700;">🗓️ Detailed ${duration}-Day Itinerary</h2>

//     ${Array.from({ length: duration }, (_, dayIndex) => {
//       const dayNum = dayIndex + 1;
//       const dayThemes = [
//         "Cultural Exploration & Temple Tour",
//         "Nature Adventure & Beach Day",
//         "Food Journey & Local Markets",
//         "Historical Tour & City Highlights",
//         "Mountain Views & Waterfalls",
//         "Island Hopping & Snorkeling",
//         "Wellness & Relaxation Day",
//       ];
//       const theme = dayThemes[dayIndex % dayThemes.length];

//       return `
//       <div style="background: ${
//         dayIndex % 2 === 0 ? "#f8fafc" : "white"
//       }; padding: 30px; border-radius: 16px; margin-bottom: 25px; border: 2px solid #e5e7eb;">
//         <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
//           <h3 style="color: #1e40af; font-size: 24px; margin: 0; font-weight: 700;">Day ${dayNum}: ${theme}</h3>
//           <div style="background: #3b82f6; color: white; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 14px;">${
//             futureDates[dayIndex]
//           }</div>
//         </div>

//         <!-- MORNING ACTIVITIES -->
//         <div style="margin-bottom: 25px;">
//           <h4 style="color: #2563eb; font-size: 20px; margin: 0 0 15px 0; font-weight: 600;">🌅 Morning (07:00 - 12:00)</h4>

//           <div style="background: white; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb; margin-bottom: 15px;">
//             <div style="color: #1f2937; font-weight: 700; margin-bottom: 8px; font-size: 17px;">07:30 - Breakfast at Local Warung</div>
//             <p style="color: #4b5563; margin-bottom: 12px; line-height: 1.6;">Start your day with authentic local breakfast. Try Nasi Campur with various side dishes or Bubur Ayam (chicken porridge) with traditional condiments.</p>
//             <div style="display: flex; gap: 20px; color: #6b7280; font-size: 14px;">
//               <span><strong>📍 Location:</strong> Warung Local near your hotel</span>
//               <span><strong>💰 Cost:</strong> Rp 25.000 - 40.000</span>
//               <span><strong>⏰ Duration:</strong> 45 minutes</span>
//             </div>
//           </div>

//           <div style="background: white; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb; margin-bottom: 15px;">
//             <div style="color: #1f2937; font-weight: 700; margin-bottom: 8px; font-size: 17px;">08:30 - Visit [SPECIFIC ATTRACTION IN ${destination}]</div>
//             <p style="color: #4b5563; margin-bottom: 12px; line-height: 1.6;">[DESCRIBE THE ATTRACTION IN DETAIL - What to see, historical significance, what makes it special]</p>
//             <div style="display: flex; gap: 20px; color: #6b7280; font-size: 14px;">
//               <span><strong>📍 Location:</strong> [Exact location]</span>
//               <span><strong>💰 Entry Fee:</strong> [Price]</span>
//               <span><strong>⏰ Duration:</strong> [1.5-2 hours]</span>
//               <span><strong>⭐ Highlight:</strong> [Main attraction feature]</span>
//             </div>
//           </div>
//         </div>

//         <!-- AFTERNOON ACTIVITIES -->
//         <div style="margin-bottom: 25px;">
//           <h4 style="color: #2563eb; font-size: 20px; margin: 0 0 15px 0; font-weight: 600;">☀️ Afternoon (12:00 - 17:00)</h4>

//           <div style="color: #dc2626; background: #fee2e2; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #dc2626;">
//             <strong>🍽️ 12:30 - Lunch at [SPECIFIC RESTAURANT IN ${destination}]</strong><br>
//             Try their signature [DISH NAME] which is famous for [REASON]. The restaurant is known for [SPECIALTY].
//           </div>

//           <div style="background: white; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb; margin-bottom: 15px;">
//             <div style="color: #1f2937; font-weight: 700; margin-bottom: 8px; font-size: 17px;">14:00 - [AFTERNOON ACTIVITY IN ${destination}]</div>
//             <p style="color: #4b5563; margin-bottom: 12px; line-height: 1.6;">[DESCRIBE THE ACTIVITY - What you'll do, experience details, what to bring]</p>
//             <div style="display: flex; gap: 20px; color: #6b7280; font-size: 14px;">
//               <span><strong>📍 Location:</strong> [Area]</span>
//               <span><strong>💰 Cost:</strong> [Price]</span>
//               <span><strong>⏰ Duration:</strong> [2-3 hours]</span>
//             </div>
//           </div>
//         </div>

//         <!-- EVENING ACTIVITIES -->
//         <div style="margin-bottom: 25px;">
//           <h4 style="color: #2563eb; font-size: 20px; margin: 0 0 15px 0; font-weight: 600;">🌃 Evening (17:00 - 22:00)</h4>

//           <div style="background: white; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb; margin-bottom: 15px;">
//             <div style="color: #1f2937; font-weight: 700; margin-bottom: 8px; font-size: 17px;">17:30 - Sunset Viewing at [SUNSET SPOT IN ${destination}]</div>
//             <p style="color: #4b5563; margin-bottom: 12px; line-height: 1.6;">[DESCRIBE THE SUNSET EXPERIENCE - Best viewing spots, atmosphere, photo opportunities]</p>
//           </div>

//           <div style="background: white; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb; margin-bottom: 15px;">
//             <div style="color: #1f2937; font-weight: 700; margin-bottom: 8px; font-size: 17px;">19:30 - Dinner at [SPECIFIC RESTAURANT IN ${destination}]</div>
//             <p style="color: #4b5563; margin-bottom: 12px; line-height: 1.6;">[DESCRIBE THE RESTAURANT - Ambiance, cuisine type, must-try dishes]</p>
//             <div style="color: #059669; background: #d1fae5; padding: 10px 15px; border-radius: 8px; margin-top: 10px; border-left: 4px solid #059669;">
//               <strong>✨ Must-Try:</strong> [SIGNATURE DISH] - [DESCRIPTION OF DISH]
//             </div>
//           </div>
//         </div>

//         <!-- DAILY BUDGET BREAKDOWN -->
//         <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
//           <h4 style="color: #1e40af; font-size: 20px; margin: 0 0 15px 0; font-weight: 600;">💰 Daily Budget Breakdown - Day ${dayNum}</h4>
//           <div style="overflow-x: auto;">
//             <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; min-width: 700px;">
//               <thead>
//                 <tr style="background: #3b82f6;">
//                   <th style="padding: 14px 18px; text-align: left; color: white; font-weight: 600;">Category</th>
//                   <th style="padding: 14px 18px; text-align: left; color: white; font-weight: 600;">Details</th>
//                   <th style="padding: 14px 18px; text-align: right; color: white; font-weight: 600;">Estimated Cost</th>
//                   <th style="padding: 14px 18px; text-align: center; color: white; font-weight: 600;">Notes</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 <tr style="background: #f8fafc;">
//                   <td style="padding: 12px 18px; border-bottom: 1px solid #e5e7eb;">🏨 Accommodation</td>
//                   <td style="padding: 12px 18px; border-bottom: 1px solid #e5e7eb;">Mid-range hotel in ${destination}</td>
//                   <td style="padding: 12px 18px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #1e40af;">Rp 450.000</td>
//                   <td style="padding: 12px 18px; border-bottom: 1px solid #e5e7eb; text-align: center;">
//                     <span style="background: #d1fae5; color: #065f46; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;">Per night</span>
//                   </td>
//                 </tr>
//                 <tr style="background: white;">
//                   <td style="padding: 12px 18px; border-bottom: 1px solid #e5e7eb;">🍽️ Food & Drinks</td>
//                   <td style="padding: 12px 18px; border-bottom: 1px solid #e5e7eb;">Breakfast, lunch, dinner, snacks</td>
//                   <td style="padding: 12px 18px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #dc2626;">Rp 350.000</td>
//                   <td style="padding: 12px 18px; border-bottom: 1px solid #e5e7eb; text-align: center;">
//                     <span style="background: #fef3c7; color: #92400e; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;">Includes drinks</span>
//                   </td>
//                 </tr>
//                 <tr style="background: #f8fafc;">
//                   <td style="padding: 12px 18px; border-bottom: 1px solid #e5e7eb;">🚗 Transportation</td>
//                   <td style="padding: 12px 18px; border-bottom: 1px solid #e5e7eb;">Private driver/taxi for day tour</td>
//                   <td style="padding: 12px 18px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #7c3aed;">Rp 300.000</td>
//                   <td style="padding: 12px 18px; border-bottom: 1px solid #e5e7eb; text-align: center;">
//                     <span style="background: #e0e7ff; color: #3730a3; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;">10 hours</span>
//                   </td>
//                 </tr>
//                 <tr style="background: white;">
//                   <td style="padding: 12px 18px; border-bottom: 1px solid #e5e7eb;">🎫 Activities & Tickets</td>
//                   <td style="padding: 12px 18px; border-bottom: 1px solid #e5e7eb;">Entrance fees, tours, experiences</td>
//                   <td style="padding: 12px 18px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #059669;">Rp 200.000</td>
//                   <td style="padding: 12px 18px; border-bottom: 1px solid #e5e7eb; text-align: center;">
//                     <span style="background: #fce7f3; color: #9d174d; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;">Tickets</span>
//                   </td>
//                 </tr>
//                 <tr style="background: white;">
//                   <td style="padding: 12px 18px; border-bottom: 1px solid #e5e7eb;">🛍️ Souvenirs & Extras</td>
//                   <td style="padding: 12px 18px; border-bottom: 1px solid #e5e7eb;">Shopping, tips, miscellaneous</td>
//                   <td style="padding: 12px 18px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #92400e;">Rp 100.000</td>
//                   <td style="padding: 12px 18px; border-bottom: 1px solid #e5e7eb; text-align: center;">
//                     <span style="background: #fef3c7; color: #92400e; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;">Optional</span>
//                   </td>
//                 </tr>
//                 <tr style="background: #f0f9ff; font-weight: bold; border-top: 2px solid #3b82f6;">
//                   <td style="padding: 14px 18px; color: #1e40af;">📊 Daily Total</td>
//                   <td style="padding: 14px 18px; color: #1e40af;">All expenses combined</td>
//                   <td style="padding: 14px 18px; text-align: right; color: #1e40af; font-size: 18px;">Rp 1.400.000</td>
//                   <td style="padding: 14px 18px; text-align: center; color: #1e40af;">
//                     <span style="background: #1e40af; color: white; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;">Day ${dayNum}</span>
//                   </td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>

//           <div style="background: #f0f9ff; padding: 15px; border-radius: 10px; margin-top: 15px; border: 1px solid #bae6fd;">
//             <div style="color: #1e40af; font-weight: 700; margin-bottom: 8px; font-size: 16px;">💡 Budget Tips for Day ${dayNum}:</div>
//             <ul style="color: #4b5563; margin: 0; padding-left: 20px; font-size: 14px;">
//               <li>Save money by having breakfast at local warungs instead of hotel</li>
//               <li>Book activities in advance online for 10-20% discount</li>
//               <li>Use ride-hailing apps for shorter trips instead of private driver</li>
//               <li>Carry water bottle to avoid buying expensive drinks</li>
//             </ul>
//           </div>
//         </div>

//         <!-- DAILY TIPS -->
//         <div style="background: #f0f9ff; padding: 18px; border-radius: 12px; border: 1px solid #bae6fd; margin-top: 20px;">
//           <div style="color: #1e40af; font-weight: 700; margin-bottom: 8px; font-size: 16px;">💡 Practical Tips for Day ${dayNum}</div>
//           <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
//             <li><strong>What to wear:</strong> Comfortable walking shoes, light clothing, hat</li>
//             <li><strong>What to bring:</strong> Sunscreen, water, camera, power bank</li>
//             <li><strong>Transport tip:</strong> Leave early to avoid traffic, use Gojek/Grab for short trips</li>
//             <li><strong>Food tip:</strong> Try local street food for authentic experience</li>
//             <li><strong>Photo tip:</strong> Best lighting in morning and late afternoon</li>
//           </ul>
//         </div>
//       </div>
//       `;
//     }).join("")}
//   </div>

//   <!-- COMPREHENSIVE BUDGET SUMMARY -->
//   <div style="background: white; padding: 35px; border-radius: 16px; border: 1px solid #e5e7eb; margin-bottom: 35px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); width: 100%;">
//     <h2 style="color: #1e40af; font-size: 28px; margin: 0 0 25px 0; font-weight: 700;">💰 Total Budget Summary for ${duration} Days</h2>

//     <div style="overflow-x: auto; margin-bottom: 30px;">
//       <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; min-width: 900px;">
//         <thead>
//           <tr style="background: linear-gradient(to right, #1e40af, #3b82f6);">
//             <th style="padding: 18px 22px; text-align: left; color: white; font-weight: 600;">Category</th>
//             <th style="padding: 18px 22px; text-align: right; color: white; font-weight: 600;">Daily Average</th>
//             <th style="padding: 18px 22px; text-align: right; color: white; font-weight: 600;">Total (${duration} days)</th>
//             <th style="padding: 18px 22px; text-align: center; color: white; font-weight: 600;">% of Budget</th>
//             <th style="padding: 18px 22px; text-align: left; color: white; font-weight: 600;">Saving Tips</th>
//           </tr>
//         </thead>
//         <tbody>
//           <tr style="background: #f8fafc;">
//             <td style="padding: 16px 22px; border-bottom: 1px solid #e5e7eb;">
//               <div style="font-weight: 700; color: #1f2937;">🏨 Accommodation</div>
//               <div style="color: #6b7280; font-size: 14px; margin-top: 4px;">Hotel/Resort stay</div>
//             </td>
//             <td style="padding: 16px 22px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 700; color: #1e40af;">Rp 450.000</td>
//             <td style="padding: 16px 22px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 700; color: #1e40af;">Rp ${(
//               450000 * duration
//             ).toLocaleString("id-ID")}</td>
//             <td style="padding: 16px 22px; border-bottom: 1px solid #e5e7eb; text-align: center;">
//               <div style="background: #dbeafe; color: #1e40af; padding: 6px 12px; border-radius: 20px; font-weight: 700; display: inline-block;">${Math.round(
//                 (450000 * duration * 100) /
//                   parseInt(budget.replace(/[^0-9]/g, ""))
//               )}%</div>
//             </td>
//             <td style="padding: 16px 22px; border-bottom: 1px solid #e5e7eb; color: #4b5563;">
//               • Book 2+ months early for 20% discount<br>
//               • Consider homestays/villas for better value
//             </td>
//           </tr>
//           <tr style="background: white;">
//             <td style="padding: 16px 22px; border-bottom: 1px solid #e5e7eb;">
//               <div style="font-weight: 700; color: #1f2937;">✈️ Transportation</div>
//               <div style="color: #6b7280; font-size: 14px; margin-top: 4px;">Local transport, taxis, driver</div>
//             </td>
//             <td style="padding: 16px 22px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 700; color: #7c3aed;">Rp 300.000</td>
//             <td style="padding: 16px 22px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 700; color: #7c3aed;">Rp ${(
//               300000 * duration
//             ).toLocaleString("id-ID")}</td>
//             <td style="padding: 16px 22px; border-bottom: 1px solid #e5e7eb; text-align: center;">
//               <div style="background: #e0e7ff; color: #3730a3; padding: 6px 12px; border-radius: 20px; font-weight: 700; display: inline-block;">${Math.round(
//                 (300000 * duration * 100) /
//                   parseInt(budget.replace(/[^0-9]/g, ""))
//               )}%</div>
//             </td>
//             <td style="padding: 16px 22px; border-bottom: 1px solid #e5e7eb; color: #4b5563;">
//               • Use ride-hailing apps for better prices<br>
//               • Rent scooter for Rp 70.000/day
//             </td>
//           </tr>
//           <tr style="background: #f8fafc;">
//             <td style="padding: 16px 22px; border-bottom: 1px solid #e5e7eb;">
//               <div style="font-weight: 700; color: #1f2937;">🍽️ Food & Drinks</div>
//               <div style="color: #6b7280; font-size: 14px; margin-top: 4px;">Meals, snacks, beverages</div>
//             </td>
//             <td style="padding: 16px 22px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 700; color: #dc2626;">Rp 350.000</td>
//             <td style="padding: 16px 22px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 700; color: #dc2626;">Rp ${(
//               350000 * duration
//             ).toLocaleString("id-ID")}</td>
//             <td style="padding: 16px 22px; border-bottom: 1px solid #e5e7eb; text-align: center;">
//               <div style="background: #fee2e2; color: #991b1b; padding: 6px 12px; border-radius: 20px; font-weight: 700; display: inline-block;">${Math.round(
//                 (350000 * duration * 100) /
//                   parseInt(budget.replace(/[^0-9]/g, ""))
//               )}%</div>
//             </td>
//             <td style="padding: 16px 22px; border-bottom: 1px solid #e5e7eb; color: #4b5563;">
//               • Eat at local warungs (Rp 25.000-50.000)<br>
//               • Avoid tourist restaurants near attractions
//             </td>
//           </tr>
//           <tr style="background: white;">
//             <td style="padding: 16px 22px; border-bottom: 1px solid #e5e7eb;">
//               <div style="font-weight: 700; color: #1f2937;">🎫 Activities & Tickets</div>
//               <div style="color: #6b7280; font-size: 14px; margin-top: 4px;">Entrance fees, tours, experiences</div>
//             </td>
//             <td style="padding: 16px 22px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 700; color: #059669;">Rp 200.000</td>
//             <td style="padding: 16px 22px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 700; color: #059669;">Rp ${(
//               200000 * duration
//             ).toLocaleString("id-ID")}</td>
//             <td style="padding: 16px 22px; border-bottom: 1px solid #e5e7eb; text-align: center;">
//               <div style="background: #d1fae5; color: #065f46; padding: 6px 12px; border-radius: 20px; font-weight: 700; display: inline-block;">${Math.round(
//                 (200000 * duration * 100) /
//                   parseInt(budget.replace(/[^0-9]/g, ""))
//               )}%</div>
//             </td>
//             <td style="padding: 16px 22px; border-bottom: 1px solid #e5e7eb; color: #4b5563;">
//               • Book online in advance for discounts<br>
//               • Some temples have free entry days
//             </td>
//           </tr>
//           <tr style="background: #f8fafc;">
//             <td style="padding: 16px 22px;">
//               <div style="font-weight: 700; color: #1f2937;">🛍️ Miscellaneous</div>
//               <div style="color: #6b7280; font-size: 14px; margin-top: 4px;">Souvenirs, tips, insurance</div>
//             </td>
//             <td style="padding: 16px 22px; text-align: right; font-weight: 700; color: #92400e;">Rp 100.000</td>
//             <td style="padding: 16px 22px; text-align: right; font-weight: 700; color: #92400e;">Rp ${(
//               100000 * duration
//             ).toLocaleString("id-ID")}</td>
//             <td style="padding: 16px 22px; text-align: center;">
//               <div style="background: #fef3c7; color: #92400e; padding: 6px 12px; border-radius: 20px; font-weight: 700; display: inline-block;">${Math.round(
//                 (100000 * duration * 100) /
//                   parseInt(budget.replace(/[^0-9]/g, ""))
//               )}%</div>
//             </td>
//             <td style="padding: 16px 22px; color: #4b5563;">
//               • Buy souvenirs at local markets (bargain!)<br>
//               • Travel insurance: Rp 50.000/day
//             </td>
//           </tr>
//           <tr style="background: linear-gradient(to right, #f0f9ff, #e0f2fe); font-weight: bold; border-top: 3px solid #3b82f6;">
//             <td style="padding: 20px 22px; color: #1e40af; font-size: 18px;">📊 TOTAL ESTIMATED BUDGET</td>
//             <td style="padding: 20px 22px; text-align: right; color: #1e40af; font-size: 18px;">Rp 1.400.000</td>
//             <td style="padding: 20px 22px; text-align: right; color: #1e40af; font-size: 18px;">Rp ${(
//               1400000 * duration
//             ).toLocaleString("id-ID")}</td>
//             <td style="padding: 20px 22px; text-align: center; color: #1e40af; font-size: 18px;">
//               <div style="background: #1e40af; color: white; padding: 8px 16px; border-radius: 20px; font-weight: 700;">100%</div>
//             </td>
//             <td style="padding: 20px 22px; color: #1e40af; font-size: 16px;">
//               <strong>Per person • ${duration} days • Mid-range travel</strong>
//             </td>
//           </tr>
//         </tbody>
//       </table>
//     </div>

//     <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 25px;">
//       <div style="background: #f0f9ff; padding: 20px; border-radius: 12px; border: 1px solid #bae6fd;">
//         <div style="color: #1e40af; font-weight: 700; margin-bottom: 10px; font-size: 18px;">📈 Budget Optimization</div>
//         <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
//           <li><strong>Economy Option:</strong> Rp 800.000/day = Rp ${(
//             800000 * duration
//           ).toLocaleString("id-ID")}</li>
//           <li><strong>Mid-range (this plan):</strong> Rp 1.400.000/day = Rp ${(
//             1400000 * duration
//           ).toLocaleString("id-ID")}</li>
//           <li><strong>Luxury Option:</strong> Rp 2.500.000+/day = Rp ${(
//             2500000 * duration
//           ).toLocaleString("id-ID")}+</li>
//         </ul>
//       </div>

//       <div style="background: #fef3c7; padding: 20px; border-radius: 12px; border: 1px solid #fbbf24;">
//         <div style="color: #92400e; font-weight: 700; margin-bottom: 10px; font-size: 18px;">💡 Money-Saving Tips</div>
//         <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
//           <li>Travel in group of 4 to split transportation costs</li>
//           <li>Visit during shoulder season (Apr-Jun, Sep-Nov)</li>
//           <li>Book flights 2-3 months in advance</li>
//           <li>Use local SIM card with data package</li>
//         </ul>
//       </div>
//     </div>
//   </div>

//   <!-- FINAL TIPS -->
//   <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 40px; border-radius: 20px; margin-bottom: 30px; width: 100%;">
//     <div style="text-align: center;">
//       <div style="font-size: 28px; margin-bottom: 15px;">🌟</div>
//       <div style="font-size: 22px; font-weight: 700; margin-bottom: 10px;">Ready for Your ${destination} Adventure!</div>
//       <p style="opacity: 0.9; font-size: 17px; max-width: 800px; margin: 0 auto 20px auto;">
//         This ${duration}-day itinerary includes detailed hourly activities, specific restaurant recommendations,
//         comprehensive budget breakdowns, and practical travel tips for ${destination}.
//       </p>
//       <div style="margin-top: 20px; font-size: 18px; font-weight: 600;">Total Estimated Budget: ${budget}</div>
//       <div style="margin-top: 10px; font-size: 16px; opacity: 0.9;">Per person estimate • ${duration} days • Mid-range experience</div>
//     </div>
//   </div>

// </div>

// **NOW YOU MUST FILL ALL PLACEHOLDERS WITH REAL INFORMATION ABOUT ${destination}:**
// 1. Write REAL attraction names from ${destination}
// 2. Include REAL restaurant names and their signature dishes
// 3. Add REAL upcoming events in ${destination}
// 4. Create REALISTIC hourly itineraries
// 5. Calculate REALISTIC budget numbers
// 6. Provide PRACTICAL tips based on actual travel experience in ${destination}

// **DO NOT LEAVE ANY [BRACKETED PLACEHOLDERS] IN YOUR RESPONSE.**`;

//     console.log("Sending detailed prompt with placeholders...");
//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const text = response.text();

//     console.log("Generated super detailed plan with itineraries");
//     return cleanHTMLResponse(text);
//   } catch (error) {
//     console.error("Gemini error:", error);
//     return generateSuperDetailedFallback(userMessage);
//   }
// }

function generateSuperDetailedFallback(message: string): string {
  const details = extractTravelDetails(message);
  const dest = details.destination || "Bali";
  const days = details.duration || 5;
  const budget = details.budget || "Rp 10.000.000";

  return `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; color: #374151; max-width: 100%; width: 100%; padding: 20px;">

  <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 40px 30px; border-radius: 20px; margin-bottom: 40px; text-align: center;">
    <h1 style="color: white; font-size: 36px; margin: 0 0 15px 0; font-weight: 800;">${dest.toUpperCase()} TRAVEL GUIDE</h1>
    <p style="font-size: 18px; opacity: 0.9; margin: 0;">${days} Days • ${budget} Budget • Complete Experience</p>
  </div>

  <div style="background: white; padding: 30px; border-radius: 16px; border: 1px solid #e5e7eb; margin-bottom: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
    <h2 style="color: #1e40af; font-size: 28px; margin: 0 0 20px 0; font-weight: 700;">⚠️ Quick Note</h2>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.7;">
      Our AI is currently generating an <strong>extremely detailed travel plan</strong> for ${dest}. 
      This will include specific restaurant recommendations, detailed activity descriptions, 
      upcoming events, and comprehensive budget breakdowns.
    </p>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.7; margin-top: 15px;">
      <strong>What you'll get:</strong>
    </p>
    <ul style="color: #4b5563; margin: 15px 0; padding-left: 20px;">
      <li>📍 <strong>Specific place recommendations</strong> with detailed descriptions</li>
      <li>🍽️ <strong>Restaurant guide</strong> with signature dishes and prices</li>
      <li>🎉 <strong>Upcoming events & festivals</strong> in ${dest}</li>
      <li>🗓️ <strong>Hour-by-hour itinerary</strong> for all ${days} days</li>
      <li>💰 <strong>Comprehensive budget tables</strong> with daily breakdowns</li>
      <li>💡 <strong>Local tips</strong> from experienced travelers</li>
    </ul>
    
    <div style="background: #f0f9ff; padding: 20px; border-radius: 12px; border: 1px solid #bae6fd; margin-top: 25px;">
      <div style="color: #1e40af; font-weight: 700; margin-bottom: 10px; font-size: 18px;">🔄 Try Again</div>
      <p style="color: #4b5563; margin: 0;">
        Please refresh the page and try your request again. The AI needs a moment to generate all the detailed content for your amazing ${dest} trip!
      </p>
    </div>
  </div>

</div>`;
}

async function handleDetailedChat(message: string): Promise<string> {
  const isIndonesian = detectUserLanguage(message) === "indonesian";

  return isIndonesian
    ? `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; color: #374151; max-width: 100%; width: 100%; padding: 20px;">

  <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 40px 30px; border-radius: 20px; margin-bottom: 30px; text-align: center;">
    <h1 style="color: white; font-size: 32px; margin: 0 0 10px 0; font-weight: 800;">AI TRAVEL PLANNER PRO</h1>
    <p style="font-size: 18px; opacity: 0.9; margin: 0;">Rencana Perjalanan Super Detail & Komprehensif</p>
  </div>

  <div style="background: white; padding: 30px; border-radius: 16px; border: 1px solid #e5e7eb; margin-bottom: 25px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
    <h2 style="color: #1e40af; font-size: 26px; margin: 0 0 20px 0; font-weight: 700;">👋 Halo! Saya Travel AI Assistant</h2>
    <p style="color: #4b5563; font-size: 17px; line-height: 1.7; margin-bottom: 20px;">
      Saya akan buatkan <strong>rencana perjalanan super detail</strong> yang mencakup segala hal yang perlu Anda ketahui untuk trip yang sempurna!
    </p>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 25px 0;">
      <div style="background: #f0f9ff; padding: 20px; border-radius: 12px; border: 1px solid #bae6fd;">
        <div style="color: #1e40af; font-weight: 700; margin-bottom: 8px; font-size: 18px;">📍 Detail Tempat</div>
        <div style="color: #4b5563;">Nama tempat spesifik + deskripsi lengkap + tips pengalaman</div>
      </div>
      <div style="background: #f0f9ff; padding: 20px; border-radius: 12px; border: 1px solid #bae6fd;">
        <div style="color: #1e40af; font-weight: 700; margin-bottom: 8px; font-size: 18px;">🍽️ Rekomendasi Makanan</div>
        <div style="color: #4b5563;">Restoran spesifik + signature dishes + range harga</div>
      </div>
      <div style="background: #f0f9ff; padding: 20px; border-radius: 12px; border: 1px solid #bae6fd;">
        <div style="color: #1e40af; font-weight: 700; margin-bottom: 8px; font-size: 18px;">💰 Budget Detail</div>
        <div style="color: #4b5563;">Tabel lengkap per hari + analisis + tips penghematan</div>
      </div>
    </div>
    
    <div style="background: #fef3c7; padding: 25px; border-radius: 12px; border: 2px solid #fbbf24; margin-top: 20px;">
      <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 22px;">🎯 Contoh Request Detail</h3>
      <div style="color: #4b5563; font-size: 16px;">
        <div style="margin-bottom: 10px;"><strong>• "Bali 7 hari budget 20 juta untuk pasangan"</strong></div>
        <div style="margin-bottom: 10px;"><strong>• "Paris 5 hari musim semi dengan aktivitas budaya"</strong></div>
        <div style="margin-bottom: 10px;"><strong>• "Tokyo 4 hari winter trip untuk food hunting"</strong></div>
        <div><strong>• "Lombok 3 hari adventure trip dengan budget 8 juta"</strong></div>
      </div>
    </div>
  </div>

  <div style="text-align: center; margin-top: 30px; padding: 25px; background: #f8fafc; border-radius: 16px; border: 1px solid #e5e7eb;">
    <div style="font-size: 24px; margin-bottom: 15px;">🌍</div>
    <div style="color: #1e40af; font-size: 20px; font-weight: 700; margin-bottom: 10px;">Mau pergi ke mana?</div>
    <p style="color: #6b7280; margin: 0;">Sebutkan destinasi, berapa hari, dan budget Anda!</p>
  </div>

</div>`
    : `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; color: #374151; max-width: 100%; width: 100%; padding: 20px;">

  <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 40px 30px; border-radius: 20px; margin-bottom: 30px; text-align: center;">
    <h1 style="color: white; font-size: 32px; margin: 0 0 10px 0; font-weight: 800;">AI TRAVEL PLANNER PRO</h1>
    <p style="font-size: 18px; opacity: 0.9; margin: 0;">Super Detailed & Comprehensive Travel Plans</p>
  </div>

  <div style="background: white; padding: 30px; border-radius: 16px; border: 1px solid #e5e7eb; margin-bottom: 25px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
    <h2 style="color: #1e40af; font-size: 26px; margin: 0 0 20px 0; font-weight: 700;">👋 Hello! I'm Your Travel AI Assistant</h2>
    <p style="color: #4b5563; font-size: 17px; line-height: 1.7; margin-bottom: 20px;">
      I'll create <strong>super detailed travel plans</strong> that cover everything you need to know for the perfect trip!
    </p>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 25px 0;">
      <div style="background: #f0f9ff; padding: 20px; border-radius: 12px; border: 1px solid #bae6fd;">
        <div style="color: #1e40af; font-weight: 700; margin-bottom: 8px; font-size: 18px;">📍 Specific Places</div>
        <div style="color: #4b5563;">Specific locations + detailed descriptions + experience tips</div>
      </div>
      <div style="background: #f0f9ff; padding: 20px; border-radius: 12px; border: 1px solid #bae6fd;">
        <div style="color: #1e40af; font-weight: 700; margin-bottom: 8px; font-size: 18px;">🍽️ Food Recommendations</div>
        <div style="color: #4b5563;">Specific restaurants + signature dishes + price ranges</div>
      </div>
      <div style="background: #f0f9ff; padding: 20px; border-radius: 12px; border: 1px solid #bae6fd;">
        <div style="color: #1e40af; font-weight: 700; margin-bottom: 8px; font-size: 18px;">💰 Detailed Budget</div>
        <div style="color: #4b5563;">Comprehensive daily tables + analysis + saving tips</div>
      </div>
    </div>
    
    <div style="background: #fef3c7; padding: 25px; border-radius: 12px; border: 2px solid #fbbf24; margin-top: 20px;">
      <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 22px;">🎯 Example Detailed Requests</h3>
      <div style="color: #4b5563; font-size: 16px;">
        <div style="margin-bottom: 10px;"><strong>• "Bali 7 days with 20 million budget for couple"</strong></div>
        <div style="margin-bottom: 10px;"><strong>• "Paris 5 days spring trip with cultural activities"</strong></div>
        <div style="margin-bottom: 10px;"><strong>• "Tokyo 4 days winter trip for food hunting"</strong></div>
        <div><strong>• "Lombok 3 days adventure trip with 8 million budget"</strong></div>
      </div>
    </div>
  </div>

  <div style="text-align: center; margin-top: 30px; padding: 25px; background: #f8fafc; border-radius: 16px; border: 1px solid #e5e7eb;">
    <div style="font-size: 24px; margin-bottom: 15px;">🌍</div>
    <div style="color: #1e40af; font-size: 20px; font-weight: 700; margin-bottom: 10px;">Where would you like to go?</div>
    <p style="color: #6b7280; margin: 0;">Tell me the destination, how many days, and your budget!</p>
  </div>

</div>`;
}

// ----------------------------------------------------------------------------------
// --- MAIN API HANDLER ---
// ----------------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const {
      message,
      conversationId: existingConvId,
      history = [],
    } = await request.json();
    const conversationId = existingConvId || generateConversationId();

    console.log("Processing:", message.substring(0, 100));

    let aiResponse: string;

    if (isTravelRequest(message)) {
      console.log("🚀 GENERATING SUPER DETAILED PLAN WITH ITINERARIES...");
      aiResponse = await generateSuperDetailedPlan(message);
    } else {
      console.log("💬 HANDLING CHAT...");
      aiResponse = await handleDetailedChat(message);
    }

    return NextResponse.json({
      success: true,
      reply: aiResponse,
      conversationId: conversationId,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({
      success: false,
      reply: generateDetailedError(),
      conversationId: generateConversationId(),
    });
  }
}
