"use client";
import { useState } from "react";
import { Itinerary, Collaborator } from "../../types"; // Hapus CollaborationInvite
import {
  UserGroupIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import ChatInterface from "./ChatInterface"; // Import ChatInterface

interface CollaborationPanelProps {
  itinerary: Itinerary;
  collaborators: Collaborator[];
  currentUser: Collaborator;
}

export default function CollaborationPanel({
  itinerary,
  collaborators,
  currentUser,
}: CollaborationPanelProps) {
  const [activeTab, setActiveTab] = useState<
    "collaborators" | "invite" | "chat"
  >("collaborators");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"editor" | "viewer">("editor");
  const [isSendingInvite, setIsSendingInvite] = useState(false);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsSendingInvite(true);
    try {
      // API call to send invitation
      const response = await fetch("/api/collaboration/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itineraryId: itinerary.id,
          email: inviteEmail,
          role: inviteRole,
        }),
      });

      if (response.ok) {
        setInviteEmail("");
        alert("Invitation sent successfully!");
      } else {
        throw new Error("Failed to send invitation");
      }
    } catch (error) {
      console.error("Error sending invite:", error);
      alert("Failed to send invitation. Please try again.");
    } finally {
      setIsSendingInvite(false);
    }
  };

  const canEdit = currentUser.role === "owner" || currentUser.role === "editor";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <UserGroupIcon className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-800">
            Collaborative Planning
          </h3>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab("collaborators")}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "collaborators"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Collaborators
          </button>
          <button
            onClick={() => setActiveTab("invite")}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "invite"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Invite
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "chat"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Chat
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === "collaborators" && (
          <div className="space-y-3">
            {collaborators.map((collaborator) => (
              <div
                key={collaborator.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {collaborator.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {collaborator.name}
                      {collaborator.id === currentUser.id && " (You)"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {collaborator.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      collaborator.role === "owner"
                        ? "bg-purple-100 text-purple-800"
                        : collaborator.role === "editor"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {collaborator.role}
                  </span>
                  {collaborator.role === "owner" && (
                    <span className="text-xs text-gray-500">Owner</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "invite" && (
          <div>
            {currentUser.role === "owner" ? (
              <form onSubmit={handleSendInvite} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="friend@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permission Level
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="role"
                        value="editor"
                        checked={inviteRole === "editor"}
                        onChange={(e) => setInviteRole("editor")}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="font-medium text-gray-900">Editor</div>
                        <div className="text-sm text-gray-500">
                          Can view and edit itinerary
                        </div>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="role"
                        value="viewer"
                        checked={inviteRole === "viewer"}
                        onChange={(e) => setInviteRole("viewer")}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="font-medium text-gray-900">Viewer</div>
                        <div className="text-sm text-gray-500">
                          Can view itinerary only
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSendingInvite}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSendingInvite ? "Sending Invite..." : "Send Invitation"}
                </button>
              </form>
            ) : (
              <div className="text-center py-8">
                <EnvelopeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Only the itinerary owner can send invitations.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "chat" && (
          <div className="space-y-4">
            <ChatInterface itineraryId={itinerary.id} />
          </div>
        )}
      </div>
    </div>
  );
}
