"use client";
import { useState, useRef } from "react";
import { Itinerary } from "../../types";
import {
  XMarkIcon,
  LinkIcon,
  DocumentArrowDownIcon,
  QrCodeIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import { generatePDF } from "../../lib/pdf-generator";

interface ShareOptionsProps {
  itinerary: Itinerary;
  onClose: () => void;
}

export default function ShareOptions({
  itinerary,
  onClose,
}: ShareOptionsProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const shareUrl = `${window.location.origin}/share/${itinerary.id}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      await generatePDF(itinerary);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Failed to download PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const shareViaWhatsApp = () => {
    const text = `Check out my ${itinerary.days.length}-day trip to ${itinerary.tripInput.destination}!`;
    const url = `https://wa.me/?text=${encodeURIComponent(
      text + "\n" + shareUrl
    )}`;
    window.open(url, "_blank");
  };

  const shareViaEmail = () => {
    const subject = `My ${itinerary.days.length}-Day ${itinerary.tripInput.destination} Itinerary`;
    const body = `Check out my travel itinerary for ${itinerary.tripInput.destination}:\n\n${shareUrl}`;
    const url = `mailto:?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.open(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            Share Your Itinerary
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Share Link */}
        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔗 Shareable Link
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm"
              >
                <LinkIcon className="w-4 h-4" />
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Anyone with this link can view your itinerary (read-only)
            </p>
          </div>

          {/* Share via Apps */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              📱 Share via
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={shareViaWhatsApp}
                className="p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center space-x-2"
              >
                <ShareIcon className="w-4 h-4" />
                <span className="text-sm">WhatsApp</span>
              </button>
              <button
                onClick={shareViaEmail}
                className="p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2"
              >
                <ShareIcon className="w-4 h-4" />
                <span className="text-sm">Email</span>
              </button>
            </div>
          </div>

          {/* Download Options */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              📄 Download Options
            </h3>
            <div className="space-y-3">
              <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-3 disabled:opacity-50"
              >
                <DocumentArrowDownIcon className="w-5 h-5 text-red-500" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">
                    Download as PDF
                  </div>
                  <div className="text-sm text-gray-500">
                    Printable format with all details
                  </div>
                </div>
                {downloading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 ml-auto"></div>
                )}
              </button>

              <button className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-3">
                <QrCodeIcon className="w-5 h-5 text-purple-500" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">QR Code</div>
                  <div className="text-sm text-gray-500">
                    Quick access on mobile
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
