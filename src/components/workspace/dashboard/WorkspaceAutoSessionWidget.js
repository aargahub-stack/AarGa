"use client";

import { useState, useEffect } from "react";
import { Activity, Clock, ShieldCheck, Timer, Zap } from "lucide-react";
import { autoSyncSessionAction } from "@/app/workspace/(dashboard)/dashboardActions";

export default function WorkspaceAutoSessionWidget({ initialActiveSession, totalLoggedHours = 32 }) {
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Initialize automatic presence session on mount
  useEffect(() => {
    let isMounted = true;
    const startMs = Date.now();
    setSessionStartTime(startMs);

    // Trigger automatic background heartbeat sync
    autoSyncSessionAction("Automatic active presence session").catch(() => {});

    const interval = setInterval(() => {
      if (isMounted) {
        setElapsedSeconds(Math.floor((Date.now() - startMs) / 1000));
      }
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const formatTimer = (totalSec) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startTimeString = sessionStartTime
    ? new Date(sessionStartTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "--:--";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm font-sans text-ink">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
            <Zap size={16} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-ink">Active Workspace Session</h3>
            <p className="text-[11px] font-medium text-slate-500">Auto presence tracking enabled</p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-200 px-3 py-1 text-[10px] font-black uppercase text-emerald-800">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Live Presence
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        {/* Live Timer Display */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-white">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
            <Timer size={14} className="text-emerald-400" />
            <span>Current Session Duration</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono tracking-wider text-emerald-400" suppressHydrationWarning>
            {formatTimer(elapsedSeconds)}
          </div>
          <div className="text-[10px] font-medium text-slate-400 mt-1" suppressHydrationWarning>
            Auto-started at {startTimeString}
          </div>
        </div>

        {/* Status Metrics */}
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <Activity size={14} className="text-emerald-600" />
              <span className="font-semibold text-slate-600">Session Status</span>
            </div>
            <span className="font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px]">
              Active Sync
            </span>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-sky-600" />
              <span className="font-semibold text-slate-600">Weekly Total</span>
            </div>
            <span className="font-extrabold text-ink text-[11px]">
              {totalLoggedHours} Logged Hours
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
