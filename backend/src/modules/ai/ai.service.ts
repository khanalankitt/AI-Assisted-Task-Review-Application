import { callGemini } from "./gemini.client";
import { AIAnalysisResult } from "./ai.types";
import { Task } from "../tasks/task.types";
import { ApiError } from "../../utils/ApiError";

function buildPrompt(task: Task): string {
  return `You are an assistant helping an operations team triage incoming tasks.
Given the task details below, respond with ONLY a JSON object (no markdown fences, no extra text) with exactly these fields:
- category: a short UPPER_SNAKE_CASE label describing the type of task (e.g. DOCUMENT_REQUEST, TECHNICAL_ISSUE, BILLING_QUERY)
- priority: one of LOW, MEDIUM, HIGH
- summary: one short sentence summarising the task
- recommendedAction: one short sentence describing the next action the operations user should take

Title: ${task.title}
Description: ${task.description}`;
}

function isValidResult(value: any): value is AIAnalysisResult {
  return (
    !!value &&
    typeof value.category === "string" &&
    ["LOW", "MEDIUM", "HIGH"].includes(value.priority) &&
    typeof value.summary === "string" &&
    typeof value.recommendedAction === "string"
  );
}

export const aiService = {
  async analyseTask(task: Task): Promise<AIAnalysisResult> {
    const prompt = buildPrompt(task);

    let rawText: string;
    try {
      rawText = await callGemini(prompt);
    } catch (err) {
      throw err instanceof ApiError
        ? err
        : new ApiError(502, "AI analysis failed");
    }

    let parsed: unknown;
    try {
      const cleaned = rawText
        .trim()
        .replace(/^```json/i, "")
        .replace(/```$/, "")
        .trim();
      parsed = JSON.parse(cleaned);
    } catch {
      throw new ApiError(502, "AI service returned an unreadable response");
    }

    if (!isValidResult(parsed)) {
      throw new ApiError(
        502,
        "AI service returned an unexpected response shape",
      );
    }

    return parsed;
  },
};
