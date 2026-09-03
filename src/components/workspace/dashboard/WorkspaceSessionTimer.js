"use client";

import { useEffect, useRef, useState } from "react";

function formatDuration(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

export default function WorkspaceSessionTimer() {
  const [seconds, setSeconds] = useState(0);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();
    const interval = setInterval(() => {
      setSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);

  return (
    <div className="flex flex-col items-center justify-center py-4 font-sans">
      <div className="relative text-center">
        <div
          className="text-4xl sm:text-5xl font-black font-mono tracking-wider text-ink"
          suppressHydrationWarning
        >
          {formatDuration(seconds)}
        </div>
        <div className="mt-2 flex items-center justify-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600" />
          </span>
          <span className="text-xs font-bold text-emerald-700">Session Active</span>
        </div>
      </div>

      <div className="mt-5 flex gap-6 text-center border-t border-slate-100 pt-4 w-full justify-center">
        <div>
          <p className="text-lg font-black text-ink" suppressHydrationWarning>{h}h</p>
          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Hours</p>
        </div>
        <div className="w-px bg-slate-200" />
        <div>
          <p className="text-lg font-black text-ink" suppressHydrationWarning>{m}m</p>
          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Minutes</p>
        </div>
        <div className="w-px bg-slate-200" />
        <div>
          <p className="text-lg font-black text-emerald-700">Live</p>
          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Status</p>
        </div>
      </div>
    </div>
  );
}
