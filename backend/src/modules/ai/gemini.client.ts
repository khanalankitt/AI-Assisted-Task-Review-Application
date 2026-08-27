import axios from "axios";
import { config } from "../../config/env";
import { ApiError } from "../../utils/ApiError";

const geminiUrl = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

export async function callGemini(prompt: string): Promise<string> {
  if (!config.geminiApiKey) {
    throw new ApiError(500, "GEMINI_API_KEY is not configured on the server");
  }

  let response;
  try {
    response = await axios.post(
      geminiUrl(config.geminiModel),
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
        },
      },
      {
        params: { key: config.geminiApiKey },
        timeout: 15000,
      },
    );
  } catch (err) {
    throw new ApiError(502, "Failed to reach the AI service");
  }

  const text: string | undefined =
    response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new ApiError(502, "AI service returned an empty response");
  }

  return text;
}
