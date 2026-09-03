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
  ShieldCheck,
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
    {
      label: "User Profile",
      href: "/workspace/profile",
      icon: User,
    },
    {
      label: "Settings",
      href: "/workspace/settings",
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 bg-white flex flex-col justify-between h-screen sticky top-0 font-sans z-30 shadow-sm">
      {/* Top Brand Header & Navigation Section */}
      <div>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <Link href="/workspace" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-emerald-400 group-hover:scale-105 transition-transform shadow-sm">
              <AargaLogo className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-sm font-black font-['Space_Grotesk'] text-ink tracking-tight flex items-center gap-1.5">
                Aar<span className="text-emerald-600">Ga</span> OS
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Workspace Portal
              </div>
            </div>
          </Link>
        </div>

        {/* Main Navigation Links */}
        <div className="p-4 space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 mb-2">
            Main Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={16}
                    className={isActive ? "text-emerald-400" : "text-slate-400"}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight size={14} className="text-emerald-400" />}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom User Profile Card & Sign Out */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between gap-3 mb-3 p-2 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2.5 truncate">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs shrink-0">
              {teamMember.name?.charAt(0).toUpperCase()}
            </div>
            <div className="truncate">
              <div className="text-xs font-extrabold text-ink truncate">
                {teamMember.name}
              </div>
              <div className="text-[10px] font-semibold text-slate-500 truncate flex items-center gap-1">
                <ShieldCheck size={11} className="text-emerald-600 shrink-0" />
                <span>{teamMember.role?.split(" ")[0]}</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors shadow-xs"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
