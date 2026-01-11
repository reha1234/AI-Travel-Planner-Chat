"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import {
  Plane,
  Sparkles,
  MapPin,
  Calendar,
  Users,
  Wallet,
  ArrowRight,
  Shield,
  Globe,
  Smartphone,
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    checkUser();
  }, []);

  const handleStartPlanning = () => {
    if (destination.trim()) {
      localStorage.setItem("auto_send_destination", destination.trim());
    }
    router.push("/chat");
  };

  const handleQuickDestination = (dest: string) => {
    localStorage.setItem("auto_send_destination", dest);
    router.push("/chat");
  };

  const handleGetStarted = () => {
    if (user) {
      router.push("/chat");
    } else {
      router.push("/login");
    }
  };

  const features = [
    {
      title: "AI-Powered Itinerary",
      description: "Get personalized day-by-day plans",
      icon: "🤖",
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Budget Tracking",
      description: "Realistic budget breakdown in IDR",
      icon: "💰",
      color: "from-emerald-500 to-teal-500",
    },
    {
      title: "Local Recommendations",
      description: "Authentic restaurants & hidden gems",
      icon: "🍽️",
      color: "from-orange-500 to-amber-500",
    },
    {
      title: "Share & Export",
      description: "PDF export and shareable links",
      icon: "📤",
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Multi-Device Sync",
      description: "Access plans anywhere, anytime",
      icon: "📱",
      color: "from-indigo-500 to-blue-500",
    },
    {
      title: "Secure & Private",
      description: "Your data stays safe with you",
      icon: "🔒",
      color: "from-gray-700 to-gray-900",
    },
  ];

  const quickDestinations = [
    {
      name: "Bali",
      icon: MapPin,
      color: "from-emerald-500 to-teal-600",
      popular: true,
    },
    { name: "Jakarta", icon: Calendar, color: "from-blue-500 to-cyan-600" },
    {
      name: "Yogyakarta",
      icon: Users,
      color: "from-purple-500 to-pink-600",
      popular: true,
    },
    { name: "Bandung", icon: Wallet, color: "from-orange-500 to-red-600" },
    { name: "Lombok", icon: Globe, color: "from-green-500 to-emerald-600" },
    { name: "Surabaya", icon: Smartphone, color: "from-red-500 to-pink-600" },
  ];

  const testimonials = [
    {
      quote:
        "Saved me hours of planning! The AI created a perfect 5-day Bali itinerary with local food spots I would've never found.",
      author: "Sarah, Digital Nomad",
      avatar: "👩‍💻",
    },
    {
      quote:
        "As a family with kids, the budget breakdown was incredibly helpful. We stayed within budget and had an amazing trip!",
      author: "The Chen Family",
      avatar: "👨‍👩‍👧‍👦",
    },
    {
      quote:
        "The restaurant recommendations were spot on. Every place suggested was authentic and delicious!",
      author: "David, Food Blogger",
      avatar: "👨‍🍳",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                Travel AI Planner
              </h1>
              <p className="text-xs text-gray-500">Powered by Gemini AI</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <button
                onClick={() => router.push("/chat")}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => router.push("/login")}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => router.push("/login")}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  Get Started Free
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 px-4 py-2 rounded-full mb-6">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">
              🚀 No credit card required • Free forever plan
            </span>
          </div>

          <h1 className="text-4xl md:text-7xl font-bold text-gray-800 mb-6 leading-tight">
            Your Personal
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mt-2">
              AI Travel Assistant
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Tell us your travel dreams. Get a complete, personalized itinerary
            with
            <span className="font-semibold text-blue-600">
              {" "}
              budget breakdown
            </span>{" "}
            in minutes, not hours.
          </p>

          {/* Destination Input */}
          <div className="max-w-2xl mx-auto mb-16">
            <div className="relative">
              <input
                type="text"
                placeholder="Where do you want to go? (e.g., Bali for 5 days with 3 million budget)"
                className="w-full px-8 py-5 text-lg border-3 border-gray-300 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all shadow-lg"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStartPlanning()}
              />
              <button
                onClick={handleGetStarted}
                className="absolute right-2 top-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <span className="font-semibold">Start Planning</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-3 text-center">
              Try "Bali 5 days 3 million" or click a destination below
            </p>
          </div>

          {/* Quick Destinations */}
          <div className="mb-20">
            <h3 className="text-lg font-semibold text-gray-700 mb-6">
              Popular Destinations
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {quickDestinations.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleQuickDestination(item.name)}
                  className={`bg-gradient-to-r ${item.color} text-white p-4 rounded-xl hover:scale-[1.03] transition-all hover:shadow-lg flex flex-col items-center justify-center relative group`}
                >
                  {item.popular && (
                    <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                      Popular
                    </span>
                  )}
                  <item.icon className="w-5 h-5 mb-2" />
                  <span className="font-medium">{item.name}</span>
                  <span className="text-xs opacity-80 mt-1 group-hover:underline">
                    Start planning →
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Features Grid */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-gray-800 mb-12">
              Why Choose Travel AI Planner?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div
                    className={`text-4xl mb-4 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-xl text-gray-800 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-8 md:p-12 text-white mb-20">
            <h2 className="text-3xl font-bold mb-12 text-center">
              How It Works in 3 Simple Steps
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  title: "Describe Your Trip",
                  description:
                    "Tell us where, when, and your budget. That's it!",
                },
                {
                  step: "2",
                  title: "AI Creates Your Plan",
                  description:
                    "Our AI builds a complete itinerary with activities, food, and budget",
                },
                {
                  step: "3",
                  title: "Refine & Travel",
                  description:
                    "Edit, share, export, and you're ready for your adventure!",
                },
              ].map((step) => (
                <div key={step.step} className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold mb-6 mx-auto">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-blue-100">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-gray-800 mb-12">
              Loved by Travelers Worldwide
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-2xl p-6"
                >
                  <div className="text-4xl mb-4">{testimonial.avatar}</div>
                  <p className="text-gray-700 italic mb-4">
                    "{testimonial.quote}"
                  </p>
                  <div className="font-semibold text-gray-800">
                    {testimonial.author}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-3xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Ready to Plan Your Perfect Trip?
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of travelers who save time and money with
              AI-powered trip planning.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
              >
                <Plane className="w-5 h-5" />
                <span>Start Planning Free</span>
                <Sparkles className="w-5 h-5" />
              </button>
              <button
                onClick={() => router.push("/login")}
                className="px-8 py-4 bg-white text-gray-700 font-semibold border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
              >
                Sign In to Continue
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              No credit card required • Free forever for basic features
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Plane className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-gray-800">
                    Travel AI Planner
                  </div>
                  <div className="text-sm text-gray-500">
                    Smart Travel Planning
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                AI-powered travel planning that saves you time and money.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-4">Product</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>
                  <button
                    onClick={() => router.push("/features")}
                    className="hover:text-blue-600"
                  >
                    Features
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push("/pricing")}
                    className="hover:text-blue-600"
                  >
                    Pricing
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push("/use-cases")}
                    className="hover:text-blue-600"
                  >
                    Use Cases
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push("/api")}
                    className="hover:text-blue-600"
                  >
                    API
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-4">Company</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>
                  <button
                    onClick={() => router.push("/about")}
                    className="hover:text-blue-600"
                  >
                    About
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push("/blog")}
                    className="hover:text-blue-600"
                  >
                    Blog
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push("/careers")}
                    className="hover:text-blue-600"
                  >
                    Careers
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push("/contact")}
                    className="hover:text-blue-600"
                  >
                    Contact
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>
                  <button
                    onClick={() => router.push("/privacy")}
                    className="hover:text-blue-600"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push("/terms")}
                    className="hover:text-blue-600"
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push("/cookies")}
                    className="hover:text-blue-600"
                  >
                    Cookie Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push("/gdpr")}
                    className="hover:text-blue-600"
                  >
                    GDPR
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 text-center">
            <p className="text-gray-600">
              ✨ Built with Next.js 14, Gemini AI, and Supabase • © 2024 Travel
              AI Planner
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
