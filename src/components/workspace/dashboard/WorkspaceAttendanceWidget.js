"use client";

import { useState, useEffect } from "react";
import { Clock, Play, Square, CheckCircle2, History, Timer } from "lucide-react";
import { clockInAction, clockOutAction } from "@/app/workspace/(dashboard)/dashboardActions";

export default function WorkspaceAttendanceWidget({ initialActiveSession, initialHistory = [] }) {
  const [activeSession, setActiveSession] = useState(initialActiveSession);
  const [history, setHistory] = useState(initialHistory);
  const [loading, setLoading] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Live timer tick when active session exists
  useEffect(() => {
    if (!activeSession?.clock_in) {
      setElapsedSeconds(0);
      return;
    }

    const startTime = new Date(activeSession.clock_in).getTime();

    const updateTimer = () => {
      const seconds = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
      setElapsedSeconds(seconds);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const formatTimer = (totalSec) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleClockIn = async () => {
    setLoading(true);
    const res = await clockInAction("Daily active work shift");
    setLoading(false);
    if (res.success) {
      setActiveSession(res.data);
    }
  };

  const handleClockOut = async () => {
    setLoading(true);
    const res = await clockOutAction(activeSession?.id, "Shift ended");
    setLoading(false);
    if (res.success) {
      setActiveSession(null);
      setHistory((prev) => [res.data, ...prev.filter((h) => h.id !== res.data.id)]);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm font-sans">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
            <Clock size={16} />
          </div>
          <div>
            <h3 className="text-sm font-black text-ink">Attendance &amp; Working Hours</h3>
            <p className="text-[11px] text-slate-500 font-semibold">Track daily active shifts &amp; duration</p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
            activeSession
              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
              : "bg-slate-100 text-slate-600 border border-slate-200"
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${activeSession ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
          {activeSession ? "Shift Active" : "Offline"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        {/* Live Timer Counter */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-white">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
            <Timer size={14} className="text-emerald-400" />
            <span>Active Shift Duration</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black tracking-mono font-mono text-emerald-400" suppressHydrationWarning>
            {activeSession ? formatTimer(elapsedSeconds) : "00:00:00"}
          </div>
          <div className="text-[10px] text-slate-400 mt-1" suppressHydrationWarning>
            {activeSession
              ? `Started shift today`
              : "Click 'Clock In' to log active working hours"}
          </div>
        </div>

        {/* Action Controls & Quick Stats */}
        <div className="space-y-3">
          {activeSession ? (
            <button
              onClick={handleClockOut}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs px-4 py-3 transition-colors shadow-sm disabled:opacity-50"
            >
              <Square size={14} fill="white" />
              <span>{loading ? "Clocking Out..." : "Clock Out of Shift"}</span>
            </button>
          ) : (
            <button
              onClick={handleClockIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-3 transition-colors shadow-sm disabled:opacity-50"
            >
              <Play size={14} fill="white" />
              <span>{loading ? "Clocking In..." : "Clock In for Today"}</span>
            </button>
          )}

          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <span className="flex items-center gap-1 text-[11px]">
              <History size={13} className="text-slate-400" /> Recent Shifts
            </span>
            <span className="text-[11px] font-bold text-ink">
              {history.length} Logged Today
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
