import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { content, conversationId, messageId } = await request.json();

    if (!content || !conversationId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer();

    // Extract travel details
    const destination = extractDestination(content);
    const duration = extractDuration(content);
    const budget = extractBudget(content);

    const { data, error } = await supabase
      .from("itineraries")
      .insert({
        destination: destination || "Unknown",
        duration: duration || 0,
        budget: budget || "Not specified",
        itinerary_data: {
          content,
          conversation_id: conversationId,
          message_id: messageId,
          saved_at: new Date().toISOString(),
          has_schedule: content.includes("Day"),
          has_budget: !!budget,
        },
        metadata: {
          source: "chat_save",
          word_count: content.split(" ").length,
          saved_via: "user_action",
        },
      })
      .select()
      .single();

    if (error) {
      console.error("Save error:", error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      itineraryId: data.id,
      message: "Itinerary saved successfully",
      savedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Save itinerary error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to save itinerary",
      },
      { status: 500 }
    );
  }
}

function extractDestination(content: string): string | null {
  const destinations = [
    "Bali",
    "Jakarta",
    "Yogyakarta",
    "Bandung",
    "Lombok",
    "Surabaya",
    "Medan",
  ];
  for (const dest of destinations) {
    if (content.includes(dest)) return dest;
  }
  return null;
}

function extractDuration(content: string): number | null {
  const match = content.match(/Day\s*(\d+)/i) || content.match(/(\d+)\s*day/i);
  return match ? parseInt(match[1]) : null;
}

function extractBudget(content: string): string | null {
  const match =
    content.match(/Rp\s*([\d,.]+)/i) ||
    content.match(/(\d+)\s*(million|m|jt)/i) ||
    content.match(/Budget.*?(\d+[\d.,]*)/i);
  return match ? match[0] : null;
}
