import { TaskPriority } from "@/lib/types";

const STYLES: Record<TaskPriority, string> = {
  LOW: "text-slate-500",
  MEDIUM: "text-amber-600",
  HIGH: "text-red-600",
};

const LABELS: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${STYLES[priority]}`}>
      <svg width="8" height="8" viewBox="0 0 8 8" className="shrink-0">
        <circle cx="4" cy="4" r="4" fill="currentColor" />
      </svg>
      {LABELS[priority]}
    </span>
  );
}
