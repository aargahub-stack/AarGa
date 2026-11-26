"use client";

<<<<<<< HEAD
import { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
=======
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import AargaLogo from "@/components/AargaLogo";
>>>>>>> 949a6bd32e64e675d969963250b774cb8a07b549

export default function GlobalNavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
<<<<<<< HEAD
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
=======
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

>>>>>>> 949a6bd32e64e675d969963250b774cb8a07b549
      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("#") &&
        href !== pathname
      ) {
<<<<<<< HEAD
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
=======
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
>>>>>>> 949a6bd32e64e675d969963250b774cb8a07b549
    </div>
  );
}
