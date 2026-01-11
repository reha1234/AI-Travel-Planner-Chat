import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="text-6xl mb-4">🧭</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Itinerary Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The travel itinerary you're looking for doesn't exist or has been
          deleted.
        </p>
        <Link
          href="/"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-block"
        >
          Create New Itinerary
        </Link>
      </div>
    </div>
  );
}
