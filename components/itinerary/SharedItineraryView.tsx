"use client";
import { useState } from "react";
import { Share2, Download, Copy, Eye } from "lucide-react";

interface SharedItineraryProps {
  itinerary: {
    title: string;
    content: string;
    created_at: string;
    view_count: number;
    share_token: string;
  };
}

export default function SharedItineraryView({
  itinerary,
}: SharedItineraryProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/share/${itinerary.share_token}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch("/api/download-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itinerary: itinerary.content,
          title: itinerary.title,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const link = document.createElement("a");
        link.href = `data:application/pdf;base64,${data.pdfBase64}`;
        link.download = data.fileName;
        link.click();
      }
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download PDF");
    }
  };

  const shareOnWhatsApp = () => {
    const text = `Check out this travel itinerary: ${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {itinerary.title}
            </h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <span>
                Shared on {new Date(itinerary.created_at).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {itinerary.view_count} views
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              {copied ? "Copied!" : "Copy Link"}
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              PDF
            </button>
            <button
              onClick={shareOnWhatsApp}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Itinerary Content */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
        <div className="prose prose-lg max-w-none">
          <div className="whitespace-pre-wrap">
            {itinerary.content.split("**").map((part, i) =>
              i % 2 === 1 ? (
                <strong key={i} className="font-bold text-gray-800">
                  {part}
                </strong>
              ) : (
                <span key={i} className="text-gray-700">
                  {part}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* Share Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <h3 className="font-semibold text-blue-800 mb-3">
          🔗 Share This Itinerary
        </h3>
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3 py-2 border border-blue-300 rounded-lg bg-white text-sm"
            />
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="text-sm text-blue-700">
            Anyone with this link can view this itinerary. The link expires in
            30 days.
          </p>
        </div>
      </div>
    </div>
  );
}
