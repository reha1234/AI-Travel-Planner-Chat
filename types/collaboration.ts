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

export interface ItineraryChange {
  id: string;
  itineraryId: string;
  userId: string;
  type:
    | "activity_added"
    | "activity_modified"
    | "activity_removed"
    | "budget_updated";
  description: string;
  previousValue?: any;
  newValue?: any;
  createdAt: string;
}
