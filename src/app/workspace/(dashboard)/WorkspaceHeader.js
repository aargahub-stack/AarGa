"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronRight, Zap } from "lucide-react";

export default function WorkspaceHeader({ teamMember, unreadCount }) {
  const pathname = usePathname();

  const getBreadcrumbTitle = (path) => {
    if (path === "/workspace") return "Dashboard Overview";
    if (path.startsWith("/workspace/tools")) return "Tools Hub";
    if (path.startsWith("/workspace/flowchart")) return "Flowchart Maker Canvas";
    if (path.startsWith("/workspace/profile")) return "User Profile";
    if (path.startsWith("/workspace/settings")) return "Workspace Settings";
    return "Operational Console";
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 py-3 shadow-xs font-sans">
      <div className="flex items-center justify-between gap-4">
        {/* Breadcrumb Navigation Context */}
        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="text-slate-400">Workspace</span>
          <ChevronRight size={13} className="text-slate-300" />
          <span className="text-emerald-700 font-extrabold">{getBreadcrumbTitle(pathname)}</span>
        </div>

        {/* Top Right Live Session Indicator & Notifications */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full text-xs font-extrabold text-emerald-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <Zap size={12} className="text-emerald-600" />
            <span>Auto Presence Active</span>
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              aria-label="Notifications"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Bell size={17} strokeWidth={2} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-black text-white shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
