"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const PALETTE = [
  { type: "process", label: "Process Box", accent: "emerald", shape: "rounded-lg" },
  { type: "decision", label: "Decision Diamond", accent: "amber", shape: "rotate-45 rounded-sm" },
  { type: "database", label: "Database Cylinder", accent: "sky", shape: "rounded-full" },
  { type: "apiCall", label: "API Call Badge", accent: "violet", shape: "rounded-lg" },
];

const ACCENT_CLASSES = {
  emerald: "border-emerald-400/60 bg-emerald-400/20 text-emerald-300",
  amber: "border-amber-400/60 bg-amber-400/20 text-amber-300",
  sky: "border-sky-400/60 bg-sky-400/20 text-sky-300",
  violet: "border-violet-400/60 bg-violet-400/20 text-violet-300",
};

export default function FlowchartSidebar() {
  function onDragStart(event, item) {
    event.dataTransfer.setData("application/reactflow-node-type", item.type);
    event.dataTransfer.setData("application/reactflow-node-label", item.label);
    event.dataTransfer.effectAllowed = "move";
  }

  return (
    <aside className="w-64 shrink-0 border-r border-slate-800 bg-slate-950/90 backdrop-blur-xl p-5 flex flex-col justify-between font-['Space_Grotesk']">
      <div>
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/workspace/flowchart"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} /> Back to Flowcharts
          </Link>
        </div>

        <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400/80 mb-4">
          Components Palette
        </h2>

        <div className="space-y-3">
          {PALETTE.map((item) => (
            <div
              key={item.type}
              draggable
              onDragStart={(e) => onDragStart(e, item)}
              className="flex cursor-grab items-center gap-3.5 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 transition-all hover:border-slate-700 hover:bg-slate-800/80 active:cursor-grabbing shadow-sm"
            >
              <div className={`h-5 w-5 border-2 ${item.shape} ${ACCENT_CLASSES[item.accent]}`} />
              <span className="text-sm font-semibold text-slate-200">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4">
        <h3 className="text-xs font-bold text-slate-300 mb-1">Canvas Instructions</h3>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          • Drag shapes onto the infinite grid to create nodes.<br />
          • Connect nodes by dragging between node handles.<br />
          • Click a node/edge and press Delete to remove it.
        </p>
      </div>
    </aside>
  );
}
