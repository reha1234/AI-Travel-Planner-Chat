import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  try {
    const { content, title = "Travel Itinerary" } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Generate unique share ID
    const shareId = nanoid(10); // 10 karakter random

    // Simpan ke database
    const { data, error } = await supabaseAdmin
      .from("shared_itineraries")
      .insert({
        share_id: shareId,
        title: title,
        content: content,
        metadata: {
          generated_at: new Date().toISOString(),
          source: "travel-ai-planner",
        },
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }

    // Buat share URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const shareUrl = `${baseUrl}/share/${shareId}`;

    return NextResponse.json({
      success: true,
      shareId: shareId,
      shareUrl: shareUrl,
      expiresAt: data.expires_at,
      message: "Share link created successfully",
    });
  } catch (error) {
    console.error("Share API Error:", error);
    return NextResponse.json(
      { error: "Failed to create share link" },
      { status: 500 }
    );
  }
}
