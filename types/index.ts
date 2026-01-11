export interface TripInput {
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budgetPerPerson: number;
  travelStyle: string[];
  pace: "relaxed" | "moderate" | "packed";
  interests: string[];
  dietaryRestrictions?: string;
}

export interface Activity {
  name: string;
  description: string;
  duration: string;
  cost: number;
  type: "morning" | "lunch" | "afternoon" | "dinner" | "evening";
}

export interface DayPlan {
  day: number;
  date: string;
  activities: {
    morning: Activity;
    lunch: Activity;
    afternoon: Activity;
    dinner: Activity;
    evening?: Activity;
  };
}

export interface BudgetBreakdown {
  accommodation: number;
  food: number;
  activities: number;
  transportation: number;
  miscellaneous: number;
  total: number;
}

export interface Itinerary {
  id: string;
  tripInput: TripInput;
  days: DayPlan[];
  budgetBreakdown: BudgetBreakdown;
  createdAt: string;
}

export interface ItineraryResponse {
  days: DayPlan[];
  budget_breakdown: BudgetBreakdown;
}

export interface Collaborator {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: "owner" | "editor" | "viewer";
  joinedAt: string;
}

export interface CollaborationInvite {
  id: string;
  itineraryId: string;
  email: string;
  role: "editor" | "viewer";
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface ItineraryComment {
  id: string;
  itineraryId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  day?: number;
  activityType?: string;
  createdAt: string;
  updatedAt: string;
}
