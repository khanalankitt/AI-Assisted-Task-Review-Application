import {
  AIAnalysisResult,
  PaginatedResult,
  Task,
  TaskStatus,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const PAGE_SIZE = 10;

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

export interface GetTasksParams {
  status?: TaskStatus | "ALL";
  page?: number;
  limit?: number;
}

export const api = {
  getTasks(params: GetTasksParams = {}) {
    const { status, page, limit } = params;
    const query = new URLSearchParams();
    if (status && status !== "ALL") query.set("status", status);
    if (page && page > 1) query.set("page", String(page));
    if (limit && limit !== PAGE_SIZE) query.set("limit", String(limit));
    const qs = query.toString();
    return request<PaginatedResult<Task>>(`/tasks${qs ? `?${qs}` : ""}`);
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
