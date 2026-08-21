import { getAllTools } from "@/data/ecosystemTools";
import { getInternStats } from "@/data/interns";

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-glass">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="mt-2 font-mono text-3xl font-black text-ink">{value}</div>
      {sub && <div className="mt-1 text-xs font-medium text-slate-500">{sub}</div>}
    </div>
  );
}

export default function DashboardOverviewPage() {
  const tools = getAllTools();
  const internStats = getInternStats();
  const gaCount = tools.filter((t) => t.status === "GA").length;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">
          Ecosystem Overview
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Skeleton dashboard — wire these cards to your live metrics service.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Products in GA" value={gaCount} sub={`of ${tools.length} total`} />
        <StatCard label="Verified Interns" value={internStats.verified} sub={`of ${internStats.total} total`} />
        <StatCard label="Avg. Telemetry Score" value={internStats.avgScore} sub="VeriSkill engine" />
        <StatCard label="Platform Uptime" value="99.9%" sub="Trailing 30 days" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-glass xl:col-span-2">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
            Product Status
          </h2>
          <div className="mt-4 space-y-3">
            {tools.map((tool) => (
              <div
                key={tool.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-bold text-ink">{tool.name}</p>
                  <p className="text-xs text-slate-500">{tool.category}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                    tool.status === "GA"
                      ? "bg-emerald-100 text-emerald-800"
                      : tool.status === "Beta"
                      ? "bg-gold-400/20 text-gold-600"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {tool.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-glass">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
            Quick Actions
          </h2>
          <div className="mt-4 space-y-3">
            {[
              "Publish impact report",
              "Review pending intern verifications",
              "Approve AarFlow disbursement queue",
              "Export ledger reconciliation",
            ].map((action) => (
              <button
                key={action}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-600 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
