"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";
import PortalSidebar from "@/components/PortalSidebar";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace("/portal");
      return;
    }
    setSession(s);
    setChecked(true);
  }, [router]);

  if (!checked) {
    return (
      <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-paper">
        <p className="text-sm font-semibold text-slate-400">
          Verifying founder session…
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-72px)] bg-paper">
      <PortalSidebar />
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white/60 px-8 py-4 backdrop-blur-xl">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Signed in as
            </p>
            <p className="text-sm font-bold text-ink">{session?.email}</p>
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
            Live Session
          </span>
        </header>
        <div className="px-8 py-8">{children}</div>
      </div>
    </div>
  );
}
