"use client";
import { useState } from "react";

export default function TestAPIPage() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "3 days in Bali with 2 million budget",
        }),
      });

      const data = await response.json();
      setResult(data.reply);
    } catch (error) {
      setResult("Error: " + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Gemini API</h1>
      <button
        onClick={testAPI}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        disabled={loading}
      >
        {loading ? "Testing..." : "Test API"}
      </button>

      {result && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h2 className="font-bold mb-2">API Response:</h2>
          <pre className="whitespace-pre-wrap text-sm">{result}</pre>
        </div>
      )}
    </div>
  );
}
