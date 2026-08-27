"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { AIAnalysisResult, Task, TaskStatus } from "@/lib/types";
import { PriorityBadge } from "@/components/PriorityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { Skeleton } from "@/components/Skeleton";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Sparkles,
  Check,
  Loader2,
} from "lucide-react";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "NEW", label: "New" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "COMPLETED", label: "Completed" },
];

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [analysing, setAnalysing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  async function loadTask() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getTask(id);
      setTask(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load task");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleStatusChange(status: TaskStatus) {
    if (!task) return;
    setUpdatingStatus(true);
    try {
      const updated = await api.updateStatus(task.id, status);
      setTask(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handleAnalyse() {
    if (!task) return;
    setAnalysing(true);
    setAnalysisError(null);
    try {
      const result = await api.analyseTask(task.id);
      setAnalysis(result);
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : "AI analysis failed");
    } finally {
      setAnalysing(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-8 py-10">
        <Skeleton className="mb-6 h-4 w-24" />
        <Skeleton className="mb-3 h-7 w-2/3" />
        <Skeleton className="mb-8 h-4 w-1/3" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="mx-auto max-w-3xl px-8 py-10">
        <Link
          href="/task"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" /> Back to tasks
        </Link>
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error ?? "Task not found"}
          </div>
          <button
            onClick={loadTask}
            className="font-medium underline underline-offset-2 hover:text-red-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <Link
        href="/task"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" /> Back to tasks
      </Link>

      <div className="overflow-hidden rounded-xl border border-[var(--app-border)] bg-white shadow-sm shadow-black/[0.02]">
        <div className="border-b border-[var(--app-border)] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={task.status} />
                <span className="text-xs text-slate-400">{task.id}</span>
              </div>
              <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
                {task.title}
              </h1>
              <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Created {formatDate(task.createdAt)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  Priority <PriorityBadge priority={task.priority} />
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-7 px-6 py-6">
          <div>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Description
            </h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
              {task.description}
            </p>
          </div>

          <div className="border-t border-[var(--app-border)] pt-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Update status
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              {STATUS_OPTIONS.map((opt) => {
                const selected = task.status === opt.value;
                return (
                  <button
                    key={opt.value}
                    disabled={updatingStatus}
                    onClick={() => handleStatusChange(opt.value)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
                      selected
                        ? "border-[var(--app-accent)] bg-[var(--app-accent-soft)] text-[var(--app-accent-strong)]"
                        : "border-[var(--app-border)] bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                    }`}
                  >
                    {selected && <Check className="h-4 w-4" />}
                    {opt.label}
                  </button>
                );
              })}
              {updatingStatus && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-[var(--app-accent)]" />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-[var(--app-accent)]/25 bg-white shadow-sm shadow-black/[0.02]">
        <div className="flex flex-col gap-4 border-b border-[var(--app-border)] bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--app-accent)] text-white shadow-sm shadow-[var(--app-accent)]/30">
              <Sparkles className="h-5 w-5" strokeWidth={2} />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                AI analysis
              </h2>
              <p className="text-xs text-slate-400">
                Get a suggested category, priority and next action.
              </p>
            </div>
          </div>
          <button
            onClick={handleAnalyse}
            disabled={analysing}
            className="group relative inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--app-accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[var(--app-accent)]/30 transition-all hover:bg-[var(--app-accent-strong)] hover:shadow-lg hover:shadow-[var(--app-accent)]/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Sparkles
              className={`h-4 w-4 ${analysing ? "animate-pulse" : ""}`}
              strokeWidth={2}
            />
            {analysing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analysing…
              </>
            ) : analysis ? (
              "Re-analyse with AI"
            ) : (
              "Analyze with AI"
            )}
          </button>
        </div>

        <div className="px-6 py-5">
          {analysing && (
            <div className="space-y-3">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          )}

          {!analysing && analysisError && (
            <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {analysisError}
              </div>
              <button
                onClick={handleAnalyse}
                className="font-medium underline underline-offset-2 hover:text-red-800"
              >
                Retry
              </button>
            </div>
          )}

          {!analysing && !analysisError && !analysis && (
            <div className="flex flex-col items-center rounded-lg border border-dashed border-slate-200 px-6 py-10 text-center">
              <Sparkles className="mb-3 h-6 w-6 text-slate-300" />
              <p className="text-sm font-medium text-slate-500">
                No analysis yet
              </p>
              <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-400">
                Click <span className="font-semibold text-[var(--app-accent-strong)]">Analyze with AI</span> to
                automatically suggest a category, priority, and next action for
                this task.
              </p>
            </div>
          )}

          {!analysing && !analysisError && analysis && (
            <dl className="grid grid-cols-1 gap-x-6 gap-y-5 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Category
                </dt>
                <dd className="mt-1.5 font-medium text-slate-900">
                  {analysis.category}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Suggested priority
                </dt>
                <dd className="mt-1.5">
                  <PriorityBadge priority={analysis.priority} />
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Summary
                </dt>
                <dd className="mt-1.5 leading-relaxed text-slate-600">
                  {analysis.summary}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Recommended action
                </dt>
                <dd className="mt-1.5 rounded-lg border border-[var(--app-accent)]/20 bg-[var(--app-accent-soft)] px-3.5 py-2.5 text-[var(--app-accent-strong)]">
                  {analysis.recommendedAction}
                </dd>
              </div>
            </dl>
          )}
        </div>
      </div>
    </div>
  );
}
