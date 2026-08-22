import Link from "next/link";
import { getAllProjects } from "@/lib/api/projects";
import { getMetricsByEntity, getEcosystemSynergyStats } from "@/lib/api/ecosystemMetrics";
import BentoToolCard from "@/components/BentoToolCard";

const CORE_PRODUCT_SLUGS = ["nexfix", "exora", "aarved"];

function ComingSoonTile({ slug }) {
  const formattedName = slug.charAt(0).toUpperCase() + slug.slice(1);
  return (
    <div className="bento-tile group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-dashed border-slate-300 bg-white/50 p-6 shadow-sm">
      <div>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Platform Product
          </span>
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
            Coming Soon
          </span>
        </div>
        <h3 className="mt-4 text-2xl font-extrabold tracking-tight text-ink">
          {formattedName}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Product details will appear once seeded in database.
        </p>
      </div>

      <div className="mt-6 border-t border-slate-200/60 pt-4 text-xs font-semibold text-slate-400">
        Database provisioning in progress
      </div>
    </div>
  );
}

function StatCard({ label, value, sublabel, accentColor = "text-ink" }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-glass">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </div>
      <div className={`mt-2 font-mono text-3xl font-black ${accentColor}`}>
        {value}
      </div>
      {sublabel && (
        <div className="mt-1 text-xs font-semibold text-slate-500">
          {sublabel}
        </div>
      )}
    </div>
  );
}

export default async function AdminEcosystemMirrorPage() {
  const [projects, synergyStats, foundationMetrics, commercialMetrics] =
    await Promise.all([
      getAllProjects(),
      getEcosystemSynergyStats(),
      getMetricsByEntity("foundation"),
      getMetricsByEntity("commercial"),
    ]);

  const projectMap = new Map(projects.map((p) => [p.slug.toLowerCase(), p]));

  const foundationKpis =
    foundationMetrics.length > 0
      ? foundationMetrics.slice(0, 2)
      : [
          { id: "f1", value: "0", label: "Partner organizations onboarded" },
          { id: "f2", value: "0", label: "Active field deployments" },
        ];

  const commercialKpis =
    commercialMetrics.length > 0
      ? commercialMetrics.slice(0, 2)
      : [
          { id: "c1", value: "0%", label: "Platform-wide uptime SLA" },
          { id: "c2", value: "0", label: "Products in GA" },
        ];

  return (
    <div className="space-y-12">
      {/* Header Badge */}
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-6 shadow-glass flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-extrabold text-emerald-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse-slow" />
            Live Verification Mirror
          </span>
          <h1 className="mt-2 text-2xl font-black text-ink">
            Public /ecosystem Page Mirror
          </h1>
          <p className="mt-1 text-xs text-slate-600">
            Read-only preview reflecting the exact database state rendered on the public Ecosystem page.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/projects"
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Edit Products →
          </Link>
          <Link
            href="/admin/ecosystem-metrics"
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Edit KPI Metrics →
          </Link>
        </div>
      </div>

      {/* 1. Dual Mission Showcase Mirror */}
      <section>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              Live Showcase Mirror
            </span>
            <h2 className="text-xl font-extrabold text-ink">
              Dual Mission KPIs
            </h2>
          </div>
          <Link
            href="/admin/ecosystem-metrics"
            className="text-xs font-bold text-emerald-600 hover:underline"
          >
            Edit in Ecosystem Metrics →
          </Link>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Foundation Arm Card */}
          <div className="rounded-3xl border border-moss-200 bg-moss-50/60 p-6 shadow-glass">
            <span className="text-xs font-bold uppercase tracking-widest text-moss-700">
              Grassroots NGO Arm
            </span>
            <h3 className="mt-2 text-xl font-black text-ink">
              AarGa Foundation
            </h3>

            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-moss-200/60 pt-4">
              {foundationKpis.map((m) => (
                <div key={m.id || m.key}>
                  <div className="text-2xl font-black font-mono text-ink">
                    {m.value}
                  </div>
                  <div className="mt-1 text-xs font-semibold text-slate-600">
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Commercial Arm Card */}
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-6 shadow-glass">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
              Commercial SaaS Arm
            </span>
            <h3 className="mt-2 text-xl font-black text-ink">
              AarGa Private Limited
            </h3>

            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-emerald-200/60 pt-4">
              {commercialKpis.map((m) => (
                <div key={m.id || m.key}>
                  <div className="text-2xl font-black font-mono text-ink">
                    {m.value}
                  </div>
                  <div className="mt-1 text-xs font-semibold text-slate-600">
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Core Products Bento Grid Mirror */}
      <section>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              Live Product Mirror
            </span>
            <h2 className="text-xl font-extrabold text-ink">
              Core Products Bento Grid
            </h2>
          </div>
          <Link
            href="/admin/projects"
            className="text-xs font-bold text-emerald-600 hover:underline"
          >
            Edit in Ecosystem Manager →
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {CORE_PRODUCT_SLUGS.map((slug) => {
            const tool = projectMap.get(slug);
            if (tool) {
              return <BentoToolCard key={tool.id || tool.slug} tool={tool} />;
            }
            return <ComingSoonTile key={slug} slug={slug} />;
          })}
        </div>
      </section>

      {/* 3. Live Telemetry & Synergy Mirror */}
      <section>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              Live Computed Telemetry
            </span>
            <h2 className="text-xl font-extrabold text-ink">
              Cross-Platform Synergy &amp; Metrics
            </h2>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <StatCard
            label="Global Platform Uptime"
            value={synergyStats.avgUptime}
            sublabel="Aggregate SLA across database product nodes"
            accentColor="text-emerald-600"
          />
          <StatCard
            label="Active Platform Services"
            value={`${synergyStats.activeProjects} / ${synergyStats.totalProjects}`}
            sublabel="Products in GA or public Beta status"
            accentColor="text-moss-700"
          />
          <StatCard
            label="Verified Talent Rate"
            value={`${synergyStats.verifiedPercent}%`}
            sublabel={`${synergyStats.verifiedInterns} of ${synergyStats.totalInterns} candidates credentialed`}
            accentColor="text-ink"
          />
        </div>
      </section>
    </div>
  );
}
