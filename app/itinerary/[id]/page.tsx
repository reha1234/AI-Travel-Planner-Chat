import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import ItineraryView from "../../../components/itinerary/ItineraryView";
import { Itinerary } from "../../../types";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

interface PageProps {
  params: {
    id: string;
  };
}

export default async function ItineraryPage({ params }: PageProps) {
  const { data: itinerary, error } = await supabase
    .from("itineraries")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !itinerary) {
    notFound();
  }

  return <ItineraryView itinerary={itinerary as Itinerary} />;
}

export async function generateMetadata({ params }: PageProps) {
  const { data: itinerary } = await supabase
    .from("itineraries")
    .select("trip_input, days") // TAMBAHKAN 'days' di sini
    .eq("id", params.id)
    .single();

  if (!itinerary) {
    return {
      title: "Itinerary Not Found",
    };
  }

  const destination = itinerary.trip_input.destination;
  const days = itinerary.days?.length || 0;

  return {
    title: `${days} Days in ${destination} - Travel Itinerary`,
    description: `AI-generated travel itinerary for ${days} days in ${destination}. Complete day-by-day plan with activities, restaurants, and budget breakdown.`,
  };
}
