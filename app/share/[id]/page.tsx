"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Plane,
  Calendar,
  MapPin,
  Users,
  Wallet,
  Download,
  Share2,
  Clock,
  Eye,
  Copy,
  Check,
} from "lucide-react";

interface SharedItinerary {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  views: number;
  expiresAt: string;
}

export default function SharePage() {
  const params = useParams();
  const shareId = params.shareId as string;

  const [itinerary, setItinerary] = useState<SharedItinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchItinerary();
  }, [shareId]);

  const fetchItinerary = async () => {
    try {
      const response = await fetch(`/api/share/${shareId}`);
      const data = await response.json();

      if (data.success) {
        setItinerary(data.itinerary);
      } else {
        setError(data.error || "Itinerary not found");
      }
    } catch (err) {
      setError("Failed to load itinerary");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const formatContent = (content: string) => {
    return content.split("\n").map((line, i) => {
      if (line.startsWith("# ")) {
        return (
          <h1 key={i} className="text-2xl font-bold text-blue-800 mt-6 mb-4">
            {line.substring(2)}
          </h1>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h2 key={i} className="text-xl font-semibold text-blue-600 mt-5 mb-3">
            {line.substring(3)}
          </h2>
        );
      }
      if (line.startsWith("### ")) {
        return (
          <h3 key={i} className="text-lg font-medium text-blue-500 mt-4 mb-2">
            {line.substring(4)}
          </h3>
        );
      }
      if (line.startsWith("• ") || line.startsWith("- ")) {
        return (
          <li key={i} className="flex items-start ml-4 mb-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span>{line.substring(2)}</span>
          </li>
        );
      }
      if (line.includes("**")) {
        const parts = line.split("**");
        return (
          <p key={i} className="mb-3">
            {parts.map((part, idx) =>
              idx % 2 === 1 ? (
                <strong key={idx} className="font-semibold text-gray-800">
                  {part}
                </strong>
              ) : (
                <span key={idx}>{part}</span>
              )
            )}
          </p>
        );
      }
      if (line.trim() === "") {
        return <div key={i} className="h-3"></div>;
      }
      return (
        <p key={i} className="mb-3">
          {line}
        </p>
      );
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shared itinerary...</p>
        </div>
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plane className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">
            Itinerary Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "The itinerary may have expired or been deleted."}
          </p>
          <a
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create New Itinerary
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Plane className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Travel AI Planner
                </h1>
                <p className="text-xs text-gray-500">Shared Itinerary</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Copy Link</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Print/PDF</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Itinerary Info */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {itinerary.title}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Created:{" "}
                    {new Date(itinerary.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>
                    Expires:{" "}
                    {new Date(itinerary.expiresAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>Views: {itinerary.views}</span>
                </div>
              </div>
            </div>

            <a
              href="/"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              <Plane className="w-4 h-4" />
              Create Your Own
            </a>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="prose prose-lg max-w-none">
              {formatContent(itinerary.content)}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Create Your Own Itinerary</h2>
          <p className="mb-6 opacity-90">
            Get personalized AI travel planning for your next adventure
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            <Plane className="w-5 h-5" />
            Start Free Planning
          </a>
        </div>
      </main>

      <footer className="border-t border-gray-200 py-8 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">
            ✨ Shared via Travel AI Planner • Powered by Gemini AI
          </p>
          <p className="text-sm text-gray-500 mt-2">
            This link expires on{" "}
            {new Date(itinerary.expiresAt).toLocaleDateString()}
          </p>
        </div>
      </footer>
    </div>
  );
}
