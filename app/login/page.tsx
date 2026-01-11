"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plane,
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [demoCredentials, setDemoCredentials] = useState(false);

  // Auto-fill demo credentials
  useEffect(() => {
    if (demoCredentials) {
      setEmail("demo@example.com");
      setPassword("demo123");
    }
  }, [demoCredentials]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Set guest mode dan langsung redirect ke chat
    localStorage.setItem("guest_mode", "true");

    // Simpan user info sederhana di localStorage
    const userInfo = {
      id: `user_${Date.now()}`,
      email: email || "guest@example.com",
      name: email.split("@")[0] || "Guest User",
      isGuest: true,
      loggedInAt: new Date().toISOString(),
    };
    localStorage.setItem("mock_user", JSON.stringify(userInfo));

    // Redirect ke chat
    router.push("/chat");
  };

  const handleQuickLogin = () => {
    setLoading(true);

    // Auto fill dengan demo credentials
    setEmail("demo@example.com");
    setPassword("demo123");
    setDemoCredentials(true);

    // Delay sedikit untuk efek loading
    setTimeout(() => {
      localStorage.setItem("guest_mode", "true");

      const userInfo = {
        id: `demo_user_${Date.now()}`,
        email: "demo@example.com",
        name: "Demo User",
        isDemo: true,
        loggedInAt: new Date().toISOString(),
      };
      localStorage.setItem("mock_user", JSON.stringify(userInfo));

      router.push("/chat");
    }, 600);
  };

  const handleGuestLogin = () => {
    setLoading(true);

    // Delay untuk efek loading
    setTimeout(() => {
      localStorage.setItem("guest_mode", "true");

      const userInfo = {
        id: `guest_${Date.now()}`,
        email: "guest@travelai.com",
        name: "Guest Traveler",
        isGuest: true,
        loggedInAt: new Date().toISOString(),
      };
      localStorage.setItem("mock_user", JSON.stringify(userInfo));

      router.push("/chat");
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="absolute top-6 left-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Plane className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-800">Travel AI</span>
        </Link>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md">
        {/* Welcome Card */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Plane className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome to Travel AI
          </h1>
          <p className="text-gray-600">AI-powered travel planning assistant</p>
        </div>

        {/* Quick Action Buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={handleQuickLogin}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Quick Start (Demo)
              </>
            )}
          </button>

          <button
            onClick={handleGuestLogin}
            disabled={loading}
            className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-700 font-medium rounded-xl hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            <ArrowRight className="w-5 h-5" />
            Continue as Guest
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 bg-white text-gray-500 text-sm">
              Or sign in manually
            </span>
          </div>
        </div>

        {/* Form (Optional - for show) */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                    placeholder="your@email.com"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    {mode === "login"
                      ? "Sign In & Continue"
                      : "Create Account & Continue"}
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Mode Toggle */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-sm text-blue-600 hover:text-blue-800"
              disabled={loading}
            >
              {mode === "login"
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>

        {/* Demo Notice */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-3 h-3 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-700">
                <strong>Demo Mode:</strong> No real authentication required.
                Click any button to start planning your trip instantly!
              </p>
            </div>
          </div>
        </div>

        {/* Skip Login Option */}
        <div className="mt-4 text-center">
          <Link
            href="/chat"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            Skip login and go directly to chat
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-center">
        <p className="text-sm text-gray-500">
          For presentation purposes only • No real authentication
        </p>
      </div>
    </div>
  );
}
