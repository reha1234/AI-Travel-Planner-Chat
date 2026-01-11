// lib/gemini-api.ts
async function generateItineraryWithGemini(
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
          maxOutputTokens: 4096,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Gemini API request failed");
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
    console.error("Failed to parse Gemini response:", jsonString);
    throw new Error("Invalid response format from AI");
  }
}
