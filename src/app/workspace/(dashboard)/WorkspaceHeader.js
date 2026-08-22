"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browserClient";
import AargaLogo from "@/components/AargaLogo";
import { Bell, LogOut, CheckCircle } from "lucide-react";

export default function WorkspaceHeader({ teamMember, unreadCount }) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/workspace/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 py-4 shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/workspace" className="flex items-center gap-2.5">
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

        <div className="flex items-center gap-5">
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

          {/* User Badge */}
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-ink">{teamMember.name}</div>
            <div className="text-[10px] font-semibold text-slate-500">
              {teamMember.role}
            </div>
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
