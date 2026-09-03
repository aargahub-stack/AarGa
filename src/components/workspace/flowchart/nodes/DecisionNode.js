"use client";

import { Handle, Position } from "@xyflow/react";

export default function DecisionNode({ data, selected }) {
  return (
    <div className="relative flex items-center justify-center min-w-[140px] min-h-[100px]">
      <div
        className={`absolute inset-0 border-2 bg-slate-900/90 backdrop-blur-md transition-all ${
          selected
            ? "border-amber-400 shadow-[0_0_20px_-4px_rgba(245,158,11,0.5)]"
            : "border-amber-500/30 hover:border-amber-400/60"
        }`}
        style={{ transform: "rotate(45deg)", borderRadius: "12px" }}
      />
      <Handle type="target" position={Position.Top} className="!bg-amber-400 !w-3 !h-3" />
      <span className="relative z-10 px-4 text-center text-xs font-bold text-amber-200 font-['Space_Grotesk']">
        {data.label || "Decision?"}
      </span>
      <Handle type="source" position={Position.Bottom} id="yes" className="!bg-amber-400 !w-3 !h-3" />
      <Handle type="source" position={Position.Right} id="no" className="!bg-amber-400 !w-3 !h-3" />
    </div>
  );
}
