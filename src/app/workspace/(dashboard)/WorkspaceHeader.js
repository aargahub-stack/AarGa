"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browserClient";
import AargaLogo from "@/components/AargaLogo";
import {
  Bell,
  LogOut,
  Workflow,
  LayoutDashboard,
  Wrench,
  User,
  Settings,
} from "lucide-react";

export default function WorkspaceHeader({ teamMember, unreadCount }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/workspace/login");
    router.refresh();
  };

  const navItems = [
    {
      label: "Dashboard",
      href: "/workspace",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Tools Hub",
      href: "/workspace/tools",
      icon: Wrench,
    },
    {
      label: "Flowcharts",
      href: "/workspace/flowchart",
      icon: Workflow,
    },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 sm:px-6 py-3 shadow-sm font-['Space_Grotesk']">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        {/* Brand & Main Navigation */}
        <div className="flex items-center gap-6">
          <Link href="/workspace" className="flex items-center gap-2.5 shrink-0">
            <AargaLogo className="h-7 w-7 text-emerald-600" />
            <div>
              <span className="text-base font-black tracking-tight text-ink">
                Aar<span className="text-emerald-600">Ga</span>
              </span>
              <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold uppercase text-emerald-800 border border-emerald-200">
                WORKSPACE
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon size={15} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right User Actions & Secondary Navigation */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Notification Bell */}
          <div className="relative">
            <button
              aria-label="Notifications"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Bell size={18} strokeWidth={2} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-black text-white shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Profile & Settings Quick Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <Link
              href="/workspace/profile"
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                pathname === "/workspace/profile"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="User Profile"
            >
              <User size={14} />
              <span className="hidden lg:inline">{teamMember.name?.split(" ")[0]}</span>
            </Link>

            <Link
              href="/workspace/settings"
              className={`flex items-center justify-center rounded-lg p-1 text-slate-600 transition-all ${
                pathname === "/workspace/settings"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "hover:text-slate-900"
              }`}
              title="Settings"
            >
              <Settings size={14} />
            </Link>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors"
          >
            <LogOut size={15} strokeWidth={2} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
