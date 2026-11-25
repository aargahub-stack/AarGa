"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import AargaLogo from "./AargaLogo";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/ecosystem", label: "Ecosystem" },
  { href: "/tech", label: "Tech Hub" },
  { href: "/interns", label: "Verified Interns" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mainOrigin, setMainOrigin] = useState("");

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      setScrolled(scrollY > 8);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hostname === "portal.aarga.org") {
      setMainOrigin("https://aarga.org");
    }
  }, []);

  const getLinkHref = (href) => {
    if (mainOrigin && (href === "/" || href === "/ecosystem" || href === "/tech")) {
      return `${mainOrigin}${href}`;
    }
    return href;
  };

  // Hide public site header completely on all admin and workspace routes
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/workspace")) {
    return null;
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 -mb-[72px] ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-md border-b border-slate-200"
          : "bg-transparent border-b border-transparent shadow-none"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        {/* Left: Brand */}
        <div className="flex flex-1 items-center">
          <Link href={getLinkHref("/")} className="flex items-center gap-2.5 group">
            <AargaLogo className="h-8 w-8" />
            <span className="text-lg font-extrabold tracking-tight text-ink">
              Aar<span className="text-[#109A70]">Ga</span>
            </span>
          </Link>
        </div>

        {/* Center: Main Navigation */}
        <nav className="hidden items-center justify-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={getLinkHref(link.href)}
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Sign In Link (Plain text nav style, no oval button) */}
        <div className="hidden flex-1 items-center justify-end md:flex">
          <a
            href="https://portal.aarga.org/admin"
            className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-ink"
          >
            Sign In
          </a>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 md:hidden"
        >
          <span className="sr-only">Menu</span>
          <div className="space-y-1.5">
            <span className={`block h-0.5 w-5 bg-ink transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`block h-0.5 w-5 bg-ink transition-opacity ${open ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-5 bg-ink transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
          </div>
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {open && (
        <div className="bg-white border-t border-slate-200 px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={getLinkHref(link.href)}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
            <a
              href="https://portal.aarga.org/admin"
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-ink"
            >
              Sign In
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
