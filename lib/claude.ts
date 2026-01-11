import { Anthropic } from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function generateItinerary(tripDetails: any) {
  try {
    const prompt = `
    // ... prompt content sama seperti sebelumnya
    `;

    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 4000,
      temperature: 0.7,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0];
    if ("text" in content) {
      return JSON.parse(content.text);
    } else {
      throw new Error("Invalid response format from Claude");
    }
  } catch (error) {
    console.error("Error generating itinerary:", error);
    throw error;
  }
}
