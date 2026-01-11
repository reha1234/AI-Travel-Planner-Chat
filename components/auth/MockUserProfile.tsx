// components/auth/MockUserProfile.tsx
"use client";

import { useState } from "react";
import { User, LogOut, Settings } from "lucide-react";
import { mockAuth } from "../../lib/mock-auth";

interface MockUserProfileProps {
  user: any;
}

export default function MockUserProfile({ user }: MockUserProfileProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    if (confirm("Sign out from demo mode?")) {
      await mockAuth.signOut();
      window.location.reload(); // Refresh page to update auth state
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
          {user.name?.charAt(0).toUpperCase() || "U"}
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
            {user.name || "User"}
          </div>
          <div className="text-xs text-gray-500 truncate max-w-[120px]">
            {user.isGuest ? "Guest Mode" : "Demo User"}
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-lg">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <div className="font-medium text-gray-800">
                  {user.name || "User"}
                </div>
                <div className="text-sm text-gray-500">{user.email}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {user.isGuest ? "Guest Account" : "Demo Account"}
                </div>
              </div>
            </div>
          </div>

          <div className="p-2">
            <button
              onClick={() => {
                setIsOpen(false);
                alert("Settings would open here in a real app");
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Settings (Demo)</span>
            </button>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-1"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>

          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-500">
              🔒 Demo Mode • Data stored locally
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
