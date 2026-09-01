"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import AargaLogo from "@/components/AargaLogo";

export default function GlobalNavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Finish loading whenever route changes
    setLoading(false);
    setProgress(100);

    const timer = setTimeout(() => {
      setProgress(0);
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  useEffect(() => {
    // Intercept standard anchor link clicks to show instant visual progress
    const handleAnchorClick = (e) => {
      const target = e.currentTarget;
      const href = target.getAttribute("href");

      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("#") &&
        href !== pathname
      ) {
        setLoading(true);
        setProgress(25);

        // Increment progress over time
        const interval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) {
              clearInterval(interval);
              return 90;
            }
            return prev + 15;
          });
        }, 100);
      }
    };

    const links = document.querySelectorAll("a[href]");
    links.forEach((link) => link.addEventListener("click", handleAnchorClick));

    return () => {
      links.forEach((link) => link.removeEventListener("click", handleAnchorClick));
    };
  }, [pathname]);

  if (!loading && progress === 0) return null;

  return (
    <div className="pointer-events-none fixed top-0 left-0 right-0 z-[99999] flex flex-col">
      {/* Top Glowing Progress Bar */}
      <div className="h-1 w-full bg-slate-200/20 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.8)] transition-all duration-200 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Floating Modern Loader Pill */}
      {loading && (
        <div className="absolute top-4 right-4 flex items-center gap-2.5 rounded-full border border-emerald-500/30 bg-slate-950/85 px-4 py-2 text-xs font-bold text-white shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="relative flex h-4 w-4 items-center justify-center">
            <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <AargaLogo className="h-3.5 w-3.5 text-emerald-400 animate-spin" />
          </div>
          <span className="tracking-wide">Loading...</span>
        </div>
      )}
    </div>
  );
}
