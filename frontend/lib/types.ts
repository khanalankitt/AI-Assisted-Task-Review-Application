export type TaskStatus = "NEW" | "IN_PROGRESS" | "COMPLETED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
  analysis: AIAnalysisResult | null;
}

export interface AIAnalysisResult {
  category: string;
  priority: TaskPriority;
  summary: string;
  recommendedAction: string;
}
