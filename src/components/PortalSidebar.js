"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";
import AargaLogo from "./AargaLogo";

const NAV_ITEMS = [
  { href: "/portal/dashboard", label: "Overview", icon: "◧" },
  { href: "/portal/dashboard", label: "Ecosystem Health", icon: "◨" },
  { href: "/portal/dashboard", label: "Verified Interns", icon: "◩" },
  { href: "/portal/dashboard", label: "Ledger & Payments", icon: "◪" },
  { href: "/portal/dashboard", label: "Settings", icon: "⚙" },
];

export default function PortalSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleSignOut() {
    signOut();
    router.push("/portal");
  }

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white/70 backdrop-blur-xl">
      <div className="flex items-center gap-2.5 border-b border-slate-200 px-6 py-5">
        <AargaLogo className="h-8 w-8" />
        <span className="text-base font-extrabold tracking-tight text-ink">
          Founder Portal
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-6">
        {NAV_ITEMS.map((item, i) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
              i === 0 && pathname === item.href
                ? "bg-emerald-100 text-emerald-800"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span aria-hidden="true">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <button
          onClick={handleSignOut}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
