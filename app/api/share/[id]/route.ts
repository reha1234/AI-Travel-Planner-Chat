import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: { shareId: string } }
) {
  try {
    const { shareId } = params;

    // Ambil data dari database
    const { data: itinerary, error } = await supabaseAdmin
      .from("shared_itineraries")
      .select("*")
      .eq("share_id", shareId)
      .single();

    if (error || !itinerary) {
      return NextResponse.json(
        { error: "Itinerary not found or expired" },
        { status: 404 }
      );
    }

    // Update view count
    await supabaseAdmin
      .from("shared_itineraries")
      .update({ views: (itinerary.views || 0) + 1 })
      .eq("share_id", shareId);

    // Simpan view tracking (opsional)
    const userAgent = request.headers.get("user-agent");
    const ip = request.headers.get("x-forwarded-for") || "unknown";

    await supabaseAdmin.from("itinerary_views").insert({
      share_id: shareId,
      user_agent: userAgent,
      ip_address: ip,
    });

    return NextResponse.json({
      success: true,
      itinerary: {
        id: itinerary.id,
        title: itinerary.title,
        content: itinerary.content,
        createdAt: itinerary.created_at,
        views: (itinerary.views || 0) + 1,
        expiresAt: itinerary.expires_at,
      },
    });
  } catch (error) {
    console.error("Get Share API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch shared itinerary" },
      { status: 500 }
    );
  }
}
