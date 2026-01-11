import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

const MODELS_TO_TEST = [
  "gemini-2.0-flash",
  "gemini-2.5-flash",
  "gemini-pro-latest",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash-latest",
];

export async function GET(request: NextRequest) {
  const results = [];

  for (const modelName of MODELS_TO_TEST) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const prompt = 'Hello, respond with "OK" if you can hear me';
      const result = await model.generateContent(prompt);
      const response = await result.response;

      results.push({
        model: modelName,
        status: "✅ WORKING",
        response: response.text(),
      });

      // Stop at first working model
      break;
    } catch (error: any) {
      results.push({
        model: modelName,
        status: "❌ FAILED",
        error: error.message || error.toString(),
      });
    }
  }

  return NextResponse.json({
    apiKey: process.env.GOOGLE_AI_API_KEY ? "✅ Set" : "❌ Missing",
    testResults: results,
    workingModels: results.filter((r) => r.status === "✅ WORKING"),
  });
}
