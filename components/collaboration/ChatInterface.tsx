"use client";
import { useState, useEffect, useRef } from "react";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline"; // Tambahkan import ini

interface ChatMessage {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  timestamp: Date;
  day?: number;
  activityType?: string;
}

interface ChatInterfaceProps {
  itineraryId: string;
}

export default function ChatInterface({ itineraryId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages
  useEffect(() => {
    loadMessages();
  }, [itineraryId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = async () => {
    try {
      // Simulated API call - replace dengan data real
      const mockMessages: ChatMessage[] = [
        {
          id: "1",
          text: "What do you think about the Day 2 morning activity?",
          userId: "user1",
          userName: "Alice",
          timestamp: new Date(Date.now() - 3600000),
          day: 2,
          activityType: "morning",
        },
        {
          id: "2",
          text: "I found a better restaurant for lunch on Day 3!",
          userId: "user2",
          userName: "Bob",
          timestamp: new Date(Date.now() - 1800000),
          day: 3,
          activityType: "lunch",
        },
        {
          id: "3",
          text: "The budget looks good for our planned activities.",
          userId: "user3",
          userName: "Charlie",
          timestamp: new Date(Date.now() - 600000),
          day: 1,
        },
      ];

      setMessages(mockMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      text: newMessage,
      userId: "current-user", // In real app, get from auth
      userName: "You",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");

    // In real app, send to API
    try {
      await fetch("/api/collaboration/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itineraryId,
          text: newMessage,
        }),
      });
    } catch (error) {
      console.error("Error sending message:", error);
      // Optional: Remove message from UI if send fails
      setMessages((prev) => prev.filter((m) => m.id !== message.id));
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-96 flex flex-col border border-gray-200 rounded-lg">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p>No messages yet. Start the conversation!</p>
            <p className="text-sm mt-1">
              Discuss activities, budget, and plans with your team.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.userId === "current-user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  message.userId === "current-user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white text-gray-900 rounded-bl-none border border-gray-200"
                }`}
              >
                {message.userId !== "current-user" && (
                  <div className="font-medium text-sm mb-1 flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                      {message.userName.charAt(0)}
                    </div>
                    <span>{message.userName}</span>
                  </div>
                )}
                <p className="text-sm">{message.text}</p>
                <div
                  className={`text-xs mt-1 flex items-center space-x-2 ${
                    message.userId === "current-user"
                      ? "text-blue-100"
                      : "text-gray-500"
                  }`}
                >
                  <span>{formatTime(message.timestamp)}</span>
                  {(message.day || message.activityType) && (
                    <>
                      <span>•</span>
                      {message.day && <span>Day {message.day}</span>}
                      {message.activityType && (
                        <span className="capitalize">
                          {message.activityType}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form
        onSubmit={handleSendMessage}
        className="border-t border-gray-200 p-4 bg-white"
      >
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
