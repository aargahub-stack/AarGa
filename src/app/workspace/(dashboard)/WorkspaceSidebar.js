"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browserClient";
import AargaLogo from "@/components/AargaLogo";
import {
  LayoutDashboard,
  Wrench,
  Workflow,
  User,
  Settings,
  LogOut,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Activity,
} from "lucide-react";

export default function WorkspaceSidebar({ teamMember }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/workspace/login");
    router.refresh();
  };

  const navItems = [
    { label: "Dashboard", href: "/workspace", icon: LayoutDashboard, exact: true },
    { label: "Tools Hub", href: "/workspace/tools", icon: Wrench },
    { label: "Flowcharts", href: "/workspace/flowchart", icon: Workflow },
    { label: "Profile", href: "/workspace/profile", icon: User },
    { label: "Settings", href: "/workspace/settings", icon: Settings },
  ];

  const isActive = (href) =>
    href === "/workspace" ? pathname === "/workspace" : pathname.startsWith(href);

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[260px] flex-col border-r border-slate-200 bg-white font-sans shadow-xs">
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center gap-3 px-5 border-b border-slate-200">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600/10 border border-emerald-500/20 p-1.5 shadow-xs">
          <AargaLogo className="h-full w-full object-contain" />
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-black leading-tight text-ink">
            AarGa OS
          </h1>
          <p className="text-[11px] font-semibold text-slate-500 leading-tight">Workspace</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <p className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
          Menu
        </p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                    active
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? "text-emerald-400" : "text-slate-400"}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  <ChevronRight
                    className={`h-4 w-4 shrink-0 transition-all duration-200 ${
                      active
                        ? "text-emerald-400 opacity-100 translate-x-0"
                        : "text-slate-400 opacity-0 -translate-x-1 group-hover:opacity-60 group-hover:translate-x-0"
                    }`}
                  />
                </Link>
              </li>
            );
          })}
        </ul>

        {/* System Status Card */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-extrabold text-ink">System Status</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-medium">
              <span className="text-slate-500">API Latency</span>
              <span className="font-extrabold text-emerald-600">12ms</span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-medium">
              <span className="text-slate-500">Sync Status</span>
              <span className="font-extrabold text-emerald-600">Active</span>
            </div>
          </div>
        </div>
      </nav>

      {/* User Session Card */}
      <div className="border-t border-slate-100 p-3 bg-slate-50/40">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
          <div className="relative shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-xs font-extrabold text-white">
              {teamMember?.name ? teamMember.name.split(" ").map(n => n[0]).join("") : "AG"}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-extrabold text-ink">{teamMember?.name || "Operator"}</p>
            <p className="truncate text-[10px] font-bold text-slate-500">{teamMember?.role || "Team Member"}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
