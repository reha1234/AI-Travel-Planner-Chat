import React from "react";
import { Map, Share2, Download, PlusCircle, Save, Menu, X } from "lucide-react";

interface ChatNavbarProps {
  conversationId: string;
  hasItinerary: boolean;
  showMap: boolean;
  setShowMap: (show: boolean) => void;
  onExport: () => void;
  onSave: () => void;
  onNewChat: () => void;
  saving: boolean;
}

const ChatNavbar: React.FC<ChatNavbarProps> = ({
  conversationId,
  hasItinerary,
  showMap,
  setShowMap,
  onExport,
  onSave,
  onNewChat,
  saving,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);

  return (
    <>
      {/* Desktop Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 hidden md:block">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">✈️</span>
                </div>
                <h1 className="font-bold text-gray-800 text-lg">
                  Travel AI Planner
                </h1>
              </div>

              {conversationId && (
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  ID: {conversationId.substring(0, 8)}...
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {hasItinerary && (
                <>
                  <button
                    onClick={() => setShowMap(!showMap)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      showMap
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Map className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {showMap ? "Hide Map" : "Show Map"}
                    </span>
                  </button>

                  <button
                    onClick={onExport}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-sm font-medium">Export</span>
                  </button>

                  <button
                    onClick={onSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {saving ? "Saving..." : "Save"}
                    </span>
                  </button>
                </>
              )}

              <button
                onClick={onNewChat}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="text-sm font-medium">New Chat</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 md:hidden">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                {showMenu ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">✈️</span>
                </div>
                <h1 className="font-bold text-gray-800">Travel AI</h1>
              </div>
            </div>

            <button
              onClick={onNewChat}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg text-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New</span>
            </button>
          </div>

          {/* Mobile Menu */}
          {showMenu && hasItinerary && (
            <div className="mt-4 pb-3 border-t border-gray-200 pt-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setShowMap(!showMap);
                    setShowMenu(false);
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg ${
                    showMap
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  <Map className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">
                    {showMap ? "Hide Map" : "Map"}
                  </span>
                </button>

                <button
                  onClick={() => {
                    onExport();
                    setShowMenu(false);
                  }}
                  className="flex flex-col items-center justify-center p-3 bg-blue-500 text-white rounded-lg"
                >
                  <Download className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">Export</span>
                </button>

                <button
                  onClick={() => {
                    onSave();
                    setShowMenu(false);
                  }}
                  disabled={saving}
                  className="flex flex-col items-center justify-center p-3 bg-green-500 text-white rounded-lg disabled:opacity-50"
                >
                  <Save className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">
                    {saving ? "Saving..." : "Save"}
                  </span>
                </button>

                <button
                  onClick={() => {
                    onNewChat();
                    setShowMenu(false);
                  }}
                  className="flex flex-col items-center justify-center p-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg"
                >
                  <PlusCircle className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">New Chat</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default ChatNavbar;
