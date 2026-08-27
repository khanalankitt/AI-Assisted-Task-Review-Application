import { GoogleGenAI } from "@google/genai";
import { config } from "../../config/env";
import { ApiError } from "../../utils/ApiError";

export async function callGemini(prompt: string): Promise<string> {
  if (!config.geminiApiKey) {
    throw new ApiError(500, "GEMINI_API_KEY is not configured on the server");
  }

  const ai = new GoogleGenAI({
    apiKey: config.geminiApiKey,
  });

  try {
    const response = await ai.models.generateContent({
      model: config.geminiModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            category: {
              type: "string",
            },
            priority: {
              type: "string",
              enum: ["LOW", "MEDIUM", "HIGH"],
            },
            summary: {
              type: "string",
            },
            recommendedAction: {
              type: "string",
            },
          },
          required: ["category", "priority", "summary", "recommendedAction"],
        },
      },
    });

    const text = response.text;

    if (!text) {
      throw new ApiError(502, "AI service returned an empty response");
    }

    return text;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }

    console.error("Gemini error:", err);

    throw new ApiError(502, "Failed to generate AI analysis");
  }
}
