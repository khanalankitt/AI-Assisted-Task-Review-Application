import request from "supertest";
import { v4 as uuidv4 } from "uuid";
import app from "../src/app";
import { taskRepository } from "../src/modules/tasks/task.repository";
import { TaskPriority, TaskStatus } from "../src/modules/tasks/task.types";

// Mock the Gemini client so tests never make a real network call.
jest.mock("../src/modules/ai/gemini.client", () => ({
  callGemini: jest.fn(),
}));

import { callGemini } from "../src/modules/ai/gemini.client";

describe("Task API", () => {
  let taskId: string;

  beforeEach(() => {
    (callGemini as jest.Mock).mockClear();
    taskId = uuidv4();
    taskRepository.create({
      id: taskId,
      title: "Test task",
      description: "Test description",
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.NEW,
      createdAt: new Date().toISOString(),
    });
  });

  describe("PATCH /tasks/:id/status", () => {
    it("accepts a valid status and updates the task", async () => {
      const res = await request(app)
        .patch(`/tasks/${taskId}/status`)
        .send({ status: "IN_PROGRESS" });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("IN_PROGRESS");
    });

    it("rejects an unsupported status value", async () => {
      const res = await request(app)
        .patch(`/tasks/${taskId}/status`)
        .send({ status: "DONE" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/invalid status/i);
    });

    it("returns 404 for a task that does not exist", async () => {
      const res = await request(app)
        .patch(`/tasks/does-not-exist/status`)
        .send({ status: "NEW" });

      expect(res.status).toBe(404);
    });
  });

  describe("GET /tasks", () => {
    it("filters tasks by status", async () => {
      const res = await request(app).get("/tasks").query({ status: "NEW" });
      expect(res.status).toBe(200);
      expect(res.body.data.every((t: any) => t.status === "NEW")).toBe(true);
      expect(res.body.total).toBe(res.body.data.length);
    });

    it("rejects an invalid status filter", async () => {
      const res = await request(app).get("/tasks").query({ status: "BOGUS" });
      expect(res.status).toBe(400);
    });

    it("paginates results 10 at a time and exposes total", async () => {
      // Create 24 more NEW tasks so we have enough to exercise multiple pages.
      for (let i = 0; i < 24; i++) {
        taskRepository.create({
          id: uuidv4(),
          title: `Bulk task ${i}`,
          description: "Description",
          priority: TaskPriority.LOW,
          status: TaskStatus.NEW,
          createdAt: new Date().toISOString(),
        });
      }

      const page1 = await request(app)
        .get("/tasks")
        .query({ status: "NEW", page: 1, limit: 10 });
      expect(page1.status).toBe(200);
      expect(page1.body.data.length).toBe(10);
      expect(page1.body.page).toBe(1);
      expect(page1.body.limit).toBe(10);
      expect(page1.body.total).toBeGreaterThanOrEqual(25);
      expect(page1.body.totalPages).toBe(
        Math.ceil(page1.body.total / page1.body.limit),
      );

      const page2 = await request(app)
        .get("/tasks")
        .query({ status: "NEW", page: 2, limit: 10 });
      expect(page2.status).toBe(200);
      expect(page2.body.data.length).toBe(10);
      expect(page2.body.page).toBe(2);

      // Pages must not contain the same task.
      const ids1 = new Set(page1.body.data.map((t: any) => t.id));
      const ids2 = page2.body.data.map((t: any) => t.id);
      expect(ids2.some((id: string) => ids1.has(id))).toBe(false);

      // The last page holds the remainder.
      const lastPage = page1.body.totalPages;
      const last = await request(app)
        .get("/tasks")
        .query({ status: "NEW", page: lastPage, limit: 10 });
      expect(last.body.page).toBe(lastPage);
      expect(last.body.data.length).toBeGreaterThan(0);
      expect(last.body.data.length).toBeLessThanOrEqual(10);
    });
  });

  describe("POST /tasks/:id/analyse", () => {
    it("returns the AI analysis when the AI call succeeds", async () => {
      (callGemini as jest.Mock).mockResolvedValueOnce(
        JSON.stringify({
          category: "DOCUMENT_REQUEST",
          priority: "HIGH",
          summary: "Customer needs to provide a payslip.",
          recommendedAction: "Request the missing payslip.",
        }),
      );

      const res = await request(app).post(`/tasks/${taskId}/analyse`);

      expect(res.status).toBe(200);
      expect(res.body.category).toBe("DOCUMENT_REQUEST");
      expect(res.body.recommendedAction).toBeDefined();
    });

    it("handles an AI service failure gracefully without crashing the server", async () => {
      (callGemini as jest.Mock).mockRejectedValueOnce(
        new Error("network error"),
      );

      const res = await request(app).post(`/tasks/${taskId}/analyse`);

      expect(res.status).toBe(502);
      expect(res.body.message).toBeDefined();

      // The server should still be responsive after the failure.
      const healthRes = await request(app).get("/health");
      expect(healthRes.status).toBe(200);
    });

    it("persists the analysis and reuses it without calling AI again", async () => {
      (callGemini as jest.Mock).mockResolvedValueOnce(
        JSON.stringify({
          category: "LOGIN_ISSUE",
          priority: "MEDIUM",
          summary: "Customer cannot log in after a password reset.",
          recommendedAction: "Reset the customer's session tokens.",
        }),
      );

      const firstRes = await request(app).post(`/tasks/${taskId}/analyse`);
      expect(firstRes.status).toBe(200);
      expect(callGemini).toHaveBeenCalledTimes(1);

      // A second call should reuse the stored analysis, not hit Gemini again.
      const secondRes = await request(app).post(`/tasks/${taskId}/analyse`);
      expect(secondRes.status).toBe(200);
      expect(secondRes.body.category).toBe("LOGIN_ISSUE");
      expect(callGemini).toHaveBeenCalledTimes(1);

      // The persisted analysis is also returned with the task object.
      const getRes = await request(app).get(`/tasks/${taskId}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body.analysis.category).toBe("LOGIN_ISSUE");
    });
  });
});
