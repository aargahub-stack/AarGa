"use client";

import { useRef } from "react";

/**
 * Interactive mouse-hover matrix/grid reveal.
 * A faint grid + "AARGA" watermark sits beneath the hero copy.
 * A radial mask tied to CSS custom properties (--mx / --my) follows the
 * cursor, brightening the grid and glow only near the pointer.
 */
export default function MatrixHero({ children }) {
  const containerRef = useRef(null);

  function handlePointerMove(e) {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--mx", `${x}%`);
    el.style.setProperty("--my", `${y}%`);
  }

  function handlePointerLeave() {
    const el = containerRef.current;
    if (!el) return;
    el.style.setProperty("--mx", `50%`);
    el.style.setProperty("--my", `-20%`);
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
      className="relative overflow-hidden bg-paper"
      style={{ "--mx": "50%", "--my": "20%" }}
    >
      {/* Base static grid, very subtle, always visible */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15,122,72,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(15,122,72,0.06) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden="true"
      />

      {/* Single smooth radial spotlight following the cursor */}
      <div className="matrix-spotlight" aria-hidden="true" />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
