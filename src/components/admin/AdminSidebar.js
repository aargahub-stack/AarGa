"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browserClient";
import AargaLogo from "@/components/AargaLogo";
import {
  LayoutDashboard,
  Building2,
  ListTree,
  ClipboardCheck,
  Users,
  Eye,
  Package,
  Activity,
  GraduationCap,
  LogOut,
} from "lucide-react";

const ADMIN_NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/clients", label: "Clients & Onboarding", icon: Building2 },
  { href: "/admin/sop-templates", label: "SOP Templates", icon: ListTree },
  { href: "/admin/sop", label: "SOP Review Queue", icon: ClipboardCheck },
  { href: "/admin/team", label: "Team Workload", icon: Users },
  { href: "/admin/ecosystem", label: "Ecosystem Mirror", icon: Eye },
  { href: "/admin/projects", label: "Ecosystem Manager", icon: Package },
  { href: "/admin/ecosystem-metrics", label: "Ecosystem Metrics", icon: Activity },
  { href: "/admin/interns", label: "Talent Registry", icon: GraduationCap },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside className="flex flex-col justify-between w-64 border-r border-slate-200 bg-white/80 p-6 shadow-sm min-h-screen">
      <div>
        <Link href="/admin" className="flex items-center gap-2.5 px-2">
          <AargaLogo className="h-7 w-7 text-emerald-600" />
          <div>
            <span className="text-base font-black tracking-tight text-ink">
              Aar<span className="text-emerald-600">Ga</span>
            </span>
            <span className="ml-2 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
              ADMIN
            </span>
          </div>
        </Link>

        <nav className="mt-8 space-y-1.5">
          {ADMIN_NAV.map((item) => {
            const isActive = pathname === item.href;
            const IconComponent = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-bold transition-colors ${
                  isActive
                    ? "bg-ink text-white shadow-glass"
                    : "text-slate-600 hover:bg-slate-100 hover:text-ink"
                }`}
              >
                <IconComponent size={18} strokeWidth={2} className="shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-200 pt-4">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors"
        >
          <span className="flex items-center gap-2.5">
            <LogOut size={16} strokeWidth={2} />
            <span>Sign Out</span>
          </span>
          <span>→</span>
        </button>
      </div>
    </aside>
  );
}
