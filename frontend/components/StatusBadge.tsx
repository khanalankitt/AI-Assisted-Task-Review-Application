import { TaskStatus } from "@/lib/types";

const STYLES: Record<TaskStatus, string> = {
  NEW: "bg-amber-50 text-amber-700 ring-amber-600/20",
  IN_PROGRESS: "bg-sky-50 text-sky-700 ring-sky-600/20",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
};

const DOT: Record<TaskStatus, string> = {
  NEW: "bg-amber-500",
  IN_PROGRESS: "bg-sky-500",
  COMPLETED: "bg-emerald-500",
};

const LABELS: Record<TaskStatus, string> = {
  NEW: "New",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STYLES[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[status]}`} />
      {LABELS[status]}
    </span>
  );
}
