import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { itineraryId, email, role } = await request.json();

    // Generate invitation token
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Save invitation to database
    const { data, error } = await supabase
      .from("collaboration_invites")
      .insert({
        itinerary_id: itineraryId,
        email,
        role,
        token,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Send email (in real app, integrate with email service)
    await sendInvitationEmail(email, itineraryId, token, role);

    return NextResponse.json({ success: true, inviteId: data.id });
  } catch (error) {
    console.error("Error creating invitation:", error);
    return NextResponse.json(
      { error: "Failed to create invitation" },
      { status: 500 }
    );
  }
}

function generateToken(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

async function sendInvitationEmail(
  email: string,
  itineraryId: string,
  token: string,
  role: string
): Promise<void> {
  // In real app, integrate with Resend, SendGrid, etc.
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`;

  console.log(`Invitation email to ${email}:`);
  console.log(`Invite URL: ${inviteUrl}`);
  console.log(`Role: ${role}`);

  // Simulate email sending
  await new Promise((resolve) => setTimeout(resolve, 1000));
}
