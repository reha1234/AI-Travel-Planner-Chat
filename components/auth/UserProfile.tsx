"use client";

import { useState, useEffect } from "react";
import { supabase, signOut } from "../../lib/supabase";
import {
  User,
  LogOut,
  Settings,
  ChevronDown,
  Calendar,
  MapPin,
  Star,
} from "lucide-react";

interface UserProfileProps {
  user: any;
}

export default function UserProfile({ user }: UserProfileProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    );
  }

  const displayName =
    profile?.full_name || user?.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
          {initials}
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-gray-800">{displayName}</div>
          <div className="text-xs text-gray-500">{user?.email}</div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
            {/* Profile Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-lg">
                  {initials}
                </div>
                <div>
                  <div className="font-semibold text-gray-800">
                    {displayName}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {user?.email}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="p-4 border-b border-gray-200">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">0</div>
                  <div className="text-xs text-gray-500">Trips</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">0</div>
                  <div className="text-xs text-gray-500">Saved</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">0</div>
                  <div className="text-xs text-gray-500">Shared</div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  // Navigate to trips
                }}
                className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors"
              >
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">My Trips</span>
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  // Navigate to saved
                }}
                className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors"
              >
                <Star className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Saved Plans</span>
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  // Navigate to profile
                }}
                className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors"
              >
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Profile Settings</span>
              </button>
            </div>

            {/* Sign Out */}
            <div className="p-2 border-t border-gray-200">
              <button
                onClick={handleSignOut}
                className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-red-50 text-red-600 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
