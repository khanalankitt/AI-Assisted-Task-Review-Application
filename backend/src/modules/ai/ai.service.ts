import { callGemini } from "./gemini.client";
import { AIAnalysisResult } from "./ai.types";
import { Task } from "../tasks/task.types";
import { taskRepository } from "../tasks/task.repository";
import { ApiError } from "../../utils/ApiError";

function buildPrompt(task: Task): string {
  return `You are an assistant helping an operations team triage incoming tasks.

Given the task details below, generate an analysis with:
- category: a short UPPER_SNAKE_CASE label describing the type of task
- priority: one of LOW, MEDIUM, HIGH
- summary: one short sentence summarising the task
- recommendedAction: one short sentence describing the next action the operations user should take

Title: ${task.title}
Description: ${task.description}`;
}

function isValidResult(value: unknown): value is AIAnalysisResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const result = value as Record<string, unknown>;

  return (
    typeof result.category === "string" &&
    ["LOW", "MEDIUM", "HIGH"].includes(result.priority as string) &&
    typeof result.summary === "string" &&
    typeof result.recommendedAction === "string"
  );
}

export const aiService = {
  async analyseTask(task: Task): Promise<AIAnalysisResult> {
    if (task.analysis) {
      return task.analysis;
    }

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
      parsed = JSON.parse(rawText);
    } catch {
      throw new ApiError(502, "AI service returned an unreadable response");
    }

    if (!isValidResult(parsed)) {
      throw new ApiError(
        502,
        "AI service returned an unexpected response shape",
      );
    }

    // Persist the analysis on the task so subsequent requests reuse it and
    // don't call Gemini again.
    taskRepository.saveAnalysis(task.id, parsed);

    return parsed;
  },
};
