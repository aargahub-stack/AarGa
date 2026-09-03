"use client";

import { Handle, Position } from "@xyflow/react";

export default function DatabaseNode({ data, selected }) {
  return (
    <div className="relative min-w-[150px]">
      <div
        className={`rounded-t-full h-4 border-2 border-b-0 bg-sky-950/80 backdrop-blur-md ${
          selected ? "border-sky-400" : "border-sky-500/30"
        }`}
      />
      <div
        className={`border-x-2 bg-slate-900/90 backdrop-blur-md px-5 py-3 text-center ${
          selected
            ? "border-sky-400 shadow-[0_0_20px_-4px_rgba(14,165,233,0.5)]"
            : "border-sky-500/30 hover:border-sky-400/60"
        }`}
      >
        <Handle type="target" position={Position.Top} className="!bg-sky-400 !w-3 !h-3" />
        <span className="text-sm font-semibold text-sky-200 font-['Space_Grotesk']">{data.label || "Database"}</span>
        <Handle type="source" position={Position.Bottom} className="!bg-sky-400 !w-3 !h-3" />
      </div>
      <div
        className={`rounded-b-full h-4 border-2 border-t-0 bg-sky-950/80 backdrop-blur-md ${
          selected ? "border-sky-400" : "border-sky-500/30"
        }`}
      />
    </div>
  );
}
