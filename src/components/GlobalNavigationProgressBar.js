"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function GlobalNavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const fadeTimerRef = useRef(null);

  // Complete and gracefully fade out whenever the route/URL changes
  useEffect(() => {
    if (visible) {
      setProgress(100);
      fadeTimerRef.current = setTimeout(() => {
        setVisible(false);
        setTimeout(() => setProgress(0), 300);
      }, 200);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleAnchorClick = (e) => {
      // Skip if modified click (Ctrl/Cmd) or default prevented
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }

      const target = e.currentTarget;
      const href = target.getAttribute("href");

      // Only handle internal navigation to different routes
      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("#") &&
        href !== pathname
      ) {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);

        setVisible(true);
        setProgress(28);

        // Smooth stepped progression
        timerRef.current = setTimeout(() => {
          setProgress(65);
          timerRef.current = setTimeout(() => {
            setProgress(84);
            timerRef.current = setTimeout(() => {
              setProgress(92);
            }, 500);
          }, 350);
        }, 150);
      }
    };

    const attachListeners = () => {
      const links = document.querySelectorAll("a[href]");
      links.forEach((link) => link.addEventListener("click", handleAnchorClick));
      return () => {
        links.forEach((link) => link.removeEventListener("click", handleAnchorClick));
      };
    };

    const cleanup = attachListeners();
    const observer = new MutationObserver(attachListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      cleanup();
      observer.disconnect();
    };
  }, [pathname]);

  if (!visible && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 right-0 z-[99999] h-[2.5px] overflow-visible"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 250ms ease-in-out",
      }}
    >
      {/* Precision Gradient Loading Beam */}
      <div
        className="h-full bg-gradient-to-r from-[#109A70] via-[#00F076] to-[#00F076] relative"
        style={{
          width: `${progress}%`,
          transition:
            progress === 100
              ? "width 180ms ease-out"
              : "width 350ms cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow:
            "0 0 12px rgba(0, 240, 118, 0.7), 0 0 4px rgba(16, 154, 112, 0.4)",
        }}
      >
        {/* Leading edge optical light flare */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-[3px] bg-white rounded-full blur-[1px] opacity-85" />
      </div>
    </div>
  );
}
