"use client";

import { Handle, Position } from "@xyflow/react";

export default function DecisionNode({ data, selected }) {
  const size = 110;

  return (
    <div
      style={{
        width: size * 1.55,
        height: size,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Diamond SVG shape */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 170 110"
        style={{ position: "absolute", inset: 0 }}
      >
        <polygon
          points="85,4 166,55 85,106 4,55"
          fill={selected ? "#3b82f6" : "#60a5fa"}
          stroke={selected ? "#1d4ed8" : "#3b82f6"}
          strokeWidth={selected ? 2.5 : 1.5}
          style={{
            filter: selected
              ? "drop-shadow(0 0 8px rgba(59,130,246,0.7))"
              : "drop-shadow(0 4px 10px rgba(59,130,246,0.4))",
            transition: "all 0.15s",
          }}
        />
      </svg>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !border-2 !border-white"
        style={{ background: "#3b82f6" }}
      />
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !border-2 !border-white"
        style={{ background: "#3b82f6" }}
      />

      {/* Label */}
      <span
        style={{
          position: "relative",
          zIndex: 1,
          fontSize: 12,
          fontWeight: 700,
          color: "#ffffff",
          fontFamily: "Urbanist, sans-serif",
          textAlign: "center",
          maxWidth: 110,
          lineHeight: 1.3,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        {data.label || "Decision?"}
      </span>

      <Handle
        type="source"
        position={Position.Right}
        id="yes"
        className="!w-3 !h-3 !border-2 !border-white"
        style={{ background: "#3b82f6" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="no"
        className="!w-3 !h-3 !border-2 !border-white"
        style={{ background: "#3b82f6" }}
      />
    </div>
  );
}
