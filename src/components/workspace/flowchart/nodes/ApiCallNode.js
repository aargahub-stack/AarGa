"use client";

import { Handle, Position } from "@xyflow/react";
import { Zap } from "lucide-react";

export default function ApiCallNode({ data, selected }) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl border-2 bg-slate-900/90 backdrop-blur-md px-4 py-3 min-w-[160px] transition-all ${
        selected
          ? "border-violet-400 shadow-[0_0_20px_-4px_rgba(139,92,246,0.5)]"
          : "border-violet-500/30 hover:border-violet-400/60"
      }`}
    >
      <Handle type="target" position={Position.Left} className="!bg-violet-400 !w-3 !h-3" />
      <Zap size={18} className="text-violet-400 shrink-0 fill-violet-400/20" />
      <span className="text-sm font-semibold text-violet-200 font-['Space_Grotesk']">{data.label || "API Call"}</span>
      <Handle type="source" position={Position.Right} className="!bg-violet-400 !w-3 !h-3" />
    </div>
  );
}
