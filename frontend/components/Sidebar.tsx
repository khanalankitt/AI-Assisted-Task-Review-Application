"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListChecks,
  ClipboardCheck,
  LifeBuoy,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/task", label: "Tasks", icon: ListChecks },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-[var(--app-border)] bg-white">
      <div className="flex h-16 items-center gap-3 border-b border-[var(--app-border)] px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--app-accent)] text-white shadow-sm shadow-[var(--app-accent)]/30">
          <ClipboardCheck className="h-5 w-5" strokeWidth={2} />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-tight text-slate-900">
            Task Review
          </p>
          <p className="text-[11px] font-medium text-slate-400">
            Operations Console
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Menu
        </p>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-[var(--app-accent-soft)] text-[var(--app-accent-strong)]"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-[var(--app-accent)]" />
              )}
              <Icon
                className={`h-[18px] w-[18px] ${
                  active
                    ? "text-[var(--app-accent)]"
                    : "text-slate-400 group-hover:text-slate-600"
                }`}
                strokeWidth={2}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-[var(--app-border)] px-5 py-4">
        <Link
          href="#"
          className="flex items-center gap-3 rounded-lg px-1 py-1 text-xs font-medium text-slate-500 transition-colors hover:text-slate-800"
        >
          <LifeBuoy className="h-4 w-4 text-slate-400" />
          Help &amp; support
        </Link>
        <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
            OP
          </div>
          <div className="leading-tight">
            <p className="text-xs font-semibold text-slate-800">Ops Team</p>
            <p className="text-[11px] text-slate-400">Reviewer · Main</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
