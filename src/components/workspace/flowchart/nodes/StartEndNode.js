"use client";

import { Handle, Position } from "@xyflow/react";

// Start / End terminal node — pill/oval shape in teal/green
export default function StartEndNode({ data, selected }) {
  const isEnd =
    (data.label || "").toLowerCase() === "end" ||
    (data.label || "").toLowerCase() === "stop";

  return (
    <div
      style={{
        minWidth: 100,
        position: "relative",
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !border-2 !border-white"
        style={{ background: "#10b981" }}
      />
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !border-2 !border-white"
        style={{ background: "#10b981" }}
      />

      <div
        style={{
          background: selected
            ? "linear-gradient(135deg,#34d399,#10b981)"
            : "linear-gradient(135deg,#10b981,#059669)",
          borderRadius: 999,
          padding: "12px 28px",
          boxShadow: selected
            ? "0 0 0 2.5px #6ee7b7, 0 8px 24px rgba(16,185,129,0.5)"
            : "0 4px 14px rgba(16,185,129,0.4)",
          textAlign: "center",
          color: "#ffffff",
          fontSize: 13,
          fontWeight: 700,
          fontFamily: "Urbanist, sans-serif",
          letterSpacing: "0.03em",
          cursor: "grab",
          transition: "box-shadow 0.15s",
          whiteSpace: "nowrap",
        }}
      >
        {data.label || (isEnd ? "End" : "Start")}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !border-2 !border-white"
        style={{ background: "#10b981" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !border-2 !border-white"
        style={{ background: "#10b981" }}
      />
    </div>
  );
}
