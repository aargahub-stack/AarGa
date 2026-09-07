"use client";

import { Handle, Position } from "@xyflow/react";

export default function ProcessNode({ data, selected }) {
  return (
    <div
      className="relative"
      style={{
        minWidth: 140,
        minHeight: 52,
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !border-2 !border-white"
        style={{ background: "#6366f1" }}
      />
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !border-2 !border-white"
        style={{ background: "#6366f1" }}
      />

      <div
        style={{
          background: selected
            ? "linear-gradient(135deg,#818cf8,#6366f1)"
            : "linear-gradient(135deg,#6366f1,#4f46e5)",
          borderRadius: 10,
          padding: "12px 20px",
          boxShadow: selected
            ? "0 0 0 2px #a5b4fc, 0 8px 24px rgba(99,102,241,0.45)"
            : "0 4px 14px rgba(99,102,241,0.35)",
          textAlign: "center",
          color: "#ffffff",
          fontSize: 13,
          fontWeight: 600,
          fontFamily: "Urbanist, sans-serif",
          letterSpacing: "0.01em",
          lineHeight: 1.3,
          cursor: "grab",
          transition: "box-shadow 0.15s",
          minWidth: 140,
        }}
      >
        {data.label || "Process"}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !border-2 !border-white"
        style={{ background: "#6366f1" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !border-2 !border-white"
        style={{ background: "#6366f1" }}
      />
    </div>
  );
}
