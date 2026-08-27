"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Task, TaskStatus } from "@/lib/types";
import { PriorityBadge } from "@/components/PriorityBadge";
import { Skeleton } from "@/components/Skeleton";
import {
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from "lucide-react";

const FILTERS: { label: string; value: TaskStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "New", value: "NEW" },
  { label: "In progress", value: "IN_PROGRESS" },
  { label: "Completed", value: "COMPLETED" },
];

const PAGE_SIZE = 10;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function TaskListPage() {
  const [filter, setFilter] = useState<TaskStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadCounts = useCallback(async () => {
    const all = await api.getTasks({ limit: 1 });
    const next: Record<string, number> = {
      ALL: all.total,
    };
    await Promise.all(
      (["NEW", "IN_PROGRESS", "COMPLETED"] as TaskStatus[]).map(
        async (status) => {
          const res = await api.getTasks({ status, limit: 1 });
          next[status] = res.total;
        },
      ),
    );
    setCounts(next);
  }, []);

  const load = useCallback(
    async (currentFilter: TaskStatus | "ALL", targetPage: number) => {
      setLoading(true);
      setError(null);
      try {
        const [data] = await Promise.all([
          api.getTasks({
            status: currentFilter,
            page: targetPage,
            limit: PAGE_SIZE,
          }),
          loadCounts(),
        ]);
        setTasks(data.data);
        setPage(data.page);
        setTotal(data.total);
        setTotalPages(Math.max(1, data.totalPages));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tasks");
      } finally {
        setLoading(false);
      }
    },
    [loadCounts],
  );

  useEffect(() => {
    load(filter, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function goToPage(targetPage: number) {
    if (targetPage < 1 || targetPage > totalPages) return;
    await load(filter, targetPage);
  }

  async function handleStatusChange(id: string, status: TaskStatus) {
    setUpdatingId(id);
    try {
      const updated = await api.updateStatus(id, status);
      setTasks(
        (prev) => prev?.map((t) => (t.id === id ? updated : t)) ?? null,
      );
      loadCounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  }

  const start =
    total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Tasks
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review the task inbox and triage items by status.
          </p>
        </div>
      </header>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => {
          const active = filter === f.value;
          const count = counts[f.value] ?? 0;
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              aria-pressed={active}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer ${
                active
                  ? "bg-[var(--app-accent)] text-white shadow-sm"
                  : "border border-[var(--app-border)] bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
              }`}
            >
              {f.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${
                  active
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {loading ? "…" : count}
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
          <button
            onClick={() => load(filter, page)}
            className="font-medium underline underline-offset-2 hover:text-red-800"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && total > 0 && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500 tabular-nums">
            Showing{" "}
            <span className="font-semibold text-slate-700">{start}</span>–
            <span className="font-semibold text-slate-700">{end}</span> of{" "}
            <span className="font-semibold text-slate-700">{total}</span> tasks
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1 || loading}
              aria-label="Previous page"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--app-border)] bg-white text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 text-sm font-medium text-slate-600 tabular-nums">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages || loading}
              aria-label="Next page"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--app-border)] bg-white text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-[var(--app-border)] bg-white shadow-sm shadow-black/[0.02]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--app-border)] bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-6 py-3 font-semibold">Task</th>
              <th className="px-6 py-3 font-semibold">Priority</th>
              <th className="hidden px-6 py-3 font-semibold md:table-cell">
                Created
              </th>
              <th className="px-6 py-3 text-right font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4">
                    <Skeleton className="h-4 w-48" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </td>
                  <td className="hidden px-6 py-4 md:table-cell">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="ml-auto h-7 w-28 rounded-md" />
                  </td>
                </tr>
              ))}

            {!loading && tasks?.length === 0 && (
              <tr>
                <td colSpan={4}>
                  <div className="flex flex-col items-center px-6 py-16 text-center">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <Inbox className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-medium text-slate-500">
                      No tasks here
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Try a different filter to see more tasks.
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {!loading &&
              tasks?.map((task) => (
                <tr
                  key={task.id}
                  className="group transition-colors hover:bg-slate-50/70"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/task/${task.id}`}
                      className="inline-flex items-center gap-1.5 font-medium text-slate-900 hover:text-[var(--app-accent-strong)]"
                    >
                      {task.title}
                      <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <PriorityBadge priority={task.priority} />
                  </td>
                  <td className="hidden px-6 py-4 text-slate-500 md:table-cell">
                    {formatDate(task.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <select
                        value={task.status}
                        disabled={updatingId === task.id}
                        onChange={(e) =>
                          handleStatusChange(
                            task.id,
                            e.target.value as TaskStatus,
                          )
                        }
                        className="rounded-md border border-[var(--app-border)] bg-white px-2 py-1 text-xs font-medium text-slate-700 disabled:opacity-50"
                      >
                        <option value="NEW">New</option>
                        <option value="IN_PROGRESS">In progress</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                      {updatingId === task.id && (
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-[var(--app-accent)]" />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
