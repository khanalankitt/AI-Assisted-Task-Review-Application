import { AIAnalysisResult, Task, TaskStatus } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(
      body?.message ?? `Request failed with status ${res.status}`,
    );
  }

  return res.json();
}

export const api = {
  getTasks(status?: TaskStatus | "ALL") {
    const query = status && status !== "ALL" ? `?status=${status}` : "";
    return request<Task[]>(`/tasks${query}`);
  },
  getTask(id: string) {
    return request<Task>(`/tasks/${id}`);
  },
  updateStatus(id: string, status: TaskStatus) {
    return request<Task>(`/tasks/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
  analyseTask(id: string) {
    return request<AIAnalysisResult>(`/tasks/${id}/analyse`, {
      method: "POST",
    });
  },
};
