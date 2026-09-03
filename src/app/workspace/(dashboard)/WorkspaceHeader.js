"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell, ChevronRight, Search } from "lucide-react";

function Breadcrumbs({ pathname }) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  const crumbs = segments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1),
    href: "/" + segments.slice(0, i + 1).join("/"),
  }));

  return (
    <nav className="flex items-center gap-1.5 text-xs font-bold font-sans">
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-300" />}
          <Link
            href={crumb.href}
            className={
              i === crumbs.length - 1
                ? "font-extrabold text-emerald-700"
                : "text-slate-500 hover:text-slate-900 transition-colors"
            }
          >
            {crumb.label}
          </Link>
        </span>
      ))}
    </nav>
  );
}

export default function WorkspaceHeader({ teamMember, unreadCount = 0 }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-6 backdrop-blur-md font-sans shadow-xs">
      <div className="flex items-center gap-4">
        <Breadcrumbs pathname={pathname} />
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <button className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:flex">
          <Search className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">Quick search...</span>
          <kbd className="ml-2 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-400">
            ⌘K
          </kbd>
        </button>

        {/* Live Presence Indicator */}
        <div className="hidden items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 md:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
          </span>
          <span className="text-xs font-semibold text-slate-600">
            <span className="text-emerald-700 font-extrabold">142</span> operators online
          </span>
        </div>

        {/* Notifications */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 shadow-xs">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-emerald-600 ring-2 ring-white" />
          )}
        </button>
      </div>
    </header>
  );
}
