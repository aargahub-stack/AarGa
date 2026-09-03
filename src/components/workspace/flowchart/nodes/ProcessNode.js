"use client";

import { Handle, Position } from "@xyflow/react";

export default function ProcessNode({ data, selected }) {
  return (
    <div
      className={`rounded-xl border-2 bg-slate-900/90 backdrop-blur-md px-5 py-3 min-w-[160px] text-center transition-all ${
        selected
          ? "border-emerald-400 shadow-[0_0_20px_-4px_rgba(16,185,129,0.5)]"
          : "border-emerald-500/30 hover:border-emerald-400/60"
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-emerald-400 !w-3 !h-3" />
      <span className="text-sm font-semibold text-white font-['Space_Grotesk']">{data.label || "Process"}</span>
      <Handle type="source" position={Position.Bottom} className="!bg-emerald-400 !w-3 !h-3" />
    </div>
  );
}
