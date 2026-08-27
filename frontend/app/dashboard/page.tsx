"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Task } from "@/lib/types";
import { PriorityBadge } from "@/components/PriorityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { Skeleton } from "@/components/Skeleton";
import {
  AlertCircle,
  ArrowRight,
  Inbox,
  Loader,
  CheckCircle2,
  Layers,
  Sparkles,
} from "lucide-react";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const ACCENT_COLORS: Record<Task["priority"], string> = {
  LOW: "bg-slate-300",
  MEDIUM: "bg-amber-400",
  HIGH: "bg-red-400",
};

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getTasks({ limit: 1000 });
      setTasks(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const counts = {
    NEW: tasks?.filter((t) => t.status === "NEW").length ?? 0,
    IN_PROGRESS: tasks?.filter((t) => t.status === "IN_PROGRESS").length ?? 0,
    COMPLETED: tasks?.filter((t) => t.status === "COMPLETED").length ?? 0,
  };
  const total = tasks?.length ?? 0;
  const completionPct =
    total === 0 ? 0 : Math.round((counts.COMPLETED / total) * 100);
  const recent = tasks?.slice(0, 5) ?? [];

  const stats = [
    { label: "Total tasks", value: total, icon: Layers, accent: "text-slate-700 bg-slate-100" },
    { label: "New", value: counts.NEW, icon: Inbox, accent: "text-amber-600 bg-amber-50" },
    { label: "In progress", value: counts.IN_PROGRESS, icon: Loader, accent: "text-sky-600 bg-sky-50" },
    { label: "Completed", value: counts.COMPLETED, icon: CheckCircle2, accent: "text-emerald-600 bg-emerald-50" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            A live overview of the task inbox and workflow progress.
          </p>
        </div>
        <Link
          href="/task"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--app-accent)] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--app-accent-strong)]"
        >
          Review tasks
          <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      {error && (
        <div className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
          <button
            onClick={load}
            className="font-medium underline underline-offset-2 hover:text-red-800"
          >
            Retry
          </button>
        </div>
      )}

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-[var(--app-border)] bg-white p-5 shadow-sm shadow-black/[0.02]"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.accent}`}>
                <stat.icon className="h-4 w-4" strokeWidth={2} />
              </span>
            </div>
            {loading ? (
              <Skeleton className="mt-3 h-8 w-10" />
            ) : (
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                {stat.value}
              </p>
            )}
          </div>
        ))}
      </div>

      <section className="mb-8 rounded-xl border border-[var(--app-border)] bg-white shadow-sm shadow-black/[0.02]">
        <div className="border-b border-[var(--app-border)] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Completion progress
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Share of the inbox that has been cleared.
              </p>
            </div>
            <span className="text-sm font-semibold text-[var(--app-accent)]">
              {loading ? "—" : `${completionPct}%`}
            </span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <div
                className="h-full rounded-full bg-[var(--app-accent)] transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            )}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-[var(--app-border)] bg-white shadow-sm shadow-black/[0.02]">
        <div className="flex items-center justify-between border-b border-[var(--app-border)] px-6 py-4">
          <h2 className="text-sm font-semibold text-slate-900">Recent tasks</h2>
          <Link
            href="/task"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--app-accent-strong)] hover:text-[var(--app-accent)]"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {loading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="ml-auto h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            ))}

          {!loading && recent.length === 0 && !error && (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Inbox className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-slate-500">No tasks yet</p>
              <p className="mt-1 text-xs text-slate-400">
                New operations tasks will appear here.
              </p>
            </div>
          )}

          {!loading &&
            recent.map((task) => (
              <Link
                key={task.id}
                href={`/task/${task.id}`}
                className="group flex items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-50/70"
              >
                <span className={`h-9 w-1 shrink-0 rounded-full ${ACCENT_COLORS[task.priority]}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900 group-hover:text-[var(--app-accent-strong)]">
                    {task.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Created {formatDate(task.createdAt)}
                  </p>
                </div>
                <div className="hidden sm:block">
                  <PriorityBadge priority={task.priority} />
                </div>
                <StatusBadge status={task.status} />
                <Sparkles className="hidden h-4 w-4 text-slate-300 group-hover:text-[var(--app-accent)] lg:block" />
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
