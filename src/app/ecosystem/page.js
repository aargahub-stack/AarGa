import Link from "next/link";
import { getAllProjects, getProjectStats } from "@/lib/api/projects";
import { getInternStats } from "@/lib/api/interns";
import BentoToolCard from "@/components/BentoToolCard";

export const revalidate = 60;

export const metadata = {
  title: "Ecosystem Command Center — AarGa",
  description:
    "Live, unified command center showing AarGa's grassroots NGO foundation work and commercial SaaS platform side-by-side.",
};

const CORE_PRODUCT_SLUGS = ["nexfix", "exora", "aarved"];

/**
 * Placeholder tile rendered when a core product is not yet seeded in the database.
 * Uses generic placeholder text with no invented static copy.
 */
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
        Database provisioning in progress · Access via Tech Hub
      </div>
    </div>
  );
}

/**
 * Local StatCard matching existing enterprise dashboard aesthetic.
 */
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

/**
 * Local GatewayCard for the Action Gateways section.
 */
function GatewayCard({ title, audience, description, href, ctaText, badgeColor = "bg-emerald-100 text-emerald-800" }) {
  return (
    <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white/70 p-8 shadow-glass transition-transform hover:-translate-y-1">
      <div>
        <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${badgeColor}`}>
          {audience}
        </span>
        <h3 className="mt-4 text-2xl font-extrabold tracking-tight text-ink">
          {title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          {description}
        </p>
      </div>

      <div className="mt-8">
        <Link
          href={href}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-bold text-white shadow-glass transition-transform hover:scale-[1.02] hover:bg-moss-800"
        >
          {ctaText}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}

export default async function EcosystemPage() {
  const [projects, projectStats, internStats] = await Promise.all([
    getAllProjects(),
    getProjectStats(),
    getInternStats(),
  ]);

  // Map database projects by lowercase slug for fast lookup
  const projectMap = new Map(
    projects.map((p) => [p.slug.toLowerCase(), p])
  );

  const verifiedPercent = internStats.total > 0
    ? Math.round((internStats.verified / internStats.total) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-7xl px-6 pt-28 pb-24 lg:px-8">
      {/* 1. Page Header */}
      <header className="max-w-4xl">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
          Ecosystem Command Center
        </span>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-ink sm:text-5xl lg:text-6xl text-balance">
          One Ecosystem. Every Mission, One View.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-600 text-balance">
          A live, unified view of AarGa&apos;s grassroots foundation operations
          and commercial enterprise SaaS platform running side-by-side on a
          single platform core.
        </p>
      </header>

      {/* 2. Dual Mission Showcase (100% Database-Driven Stats) */}
      <section className="mt-16">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* AarGa Foundation Card */}
          <div className="relative overflow-hidden rounded-3xl border border-moss-200 bg-moss-50/60 p-8 shadow-glass">
            <span className="text-xs font-bold uppercase tracking-widest text-moss-700">
              Grassroots NGO Arm
            </span>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              AarGa Foundation
            </h2>
            <p className="mt-4 text-slate-700 leading-relaxed">
              Empowering local cooperatives, field workers, and educational
              communities with zero-cost operational tools and skill-verification
              pathways.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-moss-200/60 pt-6">
              <div>
                <div className="text-3xl font-black tracking-tight text-ink">
                  {internStats.total}
                </div>
                <div className="mt-1 text-xs font-semibold text-slate-600">
                  Registered Interns
                </div>
              </div>
              <div>
                <div className="text-3xl font-black tracking-tight text-moss-700">
                  {internStats.verified}
                </div>
                <div className="mt-1 text-xs font-semibold text-slate-600">
                  Verified Skill Credentials
                </div>
              </div>
            </div>
          </div>

          {/* AarGa Private Limited Card */}
          <div className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-emerald-50/60 p-8 shadow-glass">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
              Commercial SaaS Arm
            </span>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              AarGa Private Limited
            </h2>
            <p className="mt-4 text-slate-700 leading-relaxed">
              Engineering high-availability SaaS infrastructure that powers
              enterprise workflows while directly funding foundation field
              deployments.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-emerald-200/60 pt-6">
              <div>
                <div className="text-3xl font-black tracking-tight text-ink">
                  {projectStats.avgUptime}
                </div>
                <div className="mt-1 text-xs font-semibold text-slate-600">
                  Platform Uptime SLA
                </div>
              </div>
              <div>
                <div className="text-3xl font-black tracking-tight text-emerald-700">
                  {projectStats.active}
                </div>
                <div className="mt-1 text-xs font-semibold text-slate-600">
                  Active Products (GA / Beta)
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Product Bento Grid (Filtered from DB by CORE_PRODUCT_SLUGS) */}
      <section className="mt-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              Platform Core
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Core Products
            </h2>
          </div>
          <Link
            href="/tech"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            View full Tech Hub <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {CORE_PRODUCT_SLUGS.map((slug) => {
            const tool = projectMap.get(slug);
            if (tool) {
              return <BentoToolCard key={tool.id || tool.slug} tool={tool} />;
            }
            return <ComingSoonTile key={slug} slug={slug} />;
          })}
        </div>
      </section>

      {/* 4. Live Telemetry & Synergy Section (100% Database-Driven) */}
      <section className="mt-24">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse-slow" />
            Live Telemetry Bus
          </span>
        </div>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Cross-Platform Synergy &amp; Metrics
        </h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Real-time platform telemetry aggregated across foundation field sites and
          enterprise product nodes.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Global Platform Uptime"
            value={projectStats.avgUptime}
            sublabel="Aggregate SLA across database product nodes"
            accentColor="text-emerald-600"
          />
          <StatCard
            label="Active Platform Services"
            value={`${projectStats.active} / ${projectStats.total}`}
            sublabel="Products in GA or public Beta status"
            accentColor="text-moss-700"
          />
          <StatCard
            label="Verified Talent Rate"
            value={`${verifiedPercent}%`}
            sublabel={`${internStats.verified} of ${internStats.total} candidates credentialed`}
            accentColor="text-ink"
          />
        </div>
      </section>

      {/* 5. Action Gateways */}
      <section className="mt-24">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
          Pathways
        </span>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Action Gateways
        </h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Select your entry point into the AarGa ecosystem.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <GatewayCard
            title="Enterprise SaaS Solutions"
            audience="For Businesses"
            description="Explore our high-availability product suites, infrastructure capabilities, and engineering architecture."
            href="/tech"
            ctaText="Explore Tech Hub"
            badgeColor="bg-emerald-100 text-emerald-800"
          />
          <GatewayCard
            title="Verified Talent & Learning"
            audience="For Students & Candidates"
            description="Join learning pathways in AarVed or view candidates scored by the VeriSkill telemetry engine."
            href="/interns"
            ctaText="View Interns Registry"
            badgeColor="bg-moss-100 text-moss-800"
          />
          <GatewayCard
            title="Grassroots Foundation"
            audience="For NGO Partners"
            description="Partner with our foundation team to deploy zero-cost operational tools in your community."
            href="/#mission"
            ctaText="Discover Mission"
            badgeColor="bg-gold-400/20 text-gold-600"
          />
        </div>
      </section>
    </div>
  );
}
