import Link from "next/link";
import { getAllProjects } from "@/lib/api/projects";
import { getAllInterns, getInternStats } from "@/lib/api/interns";
import { getAllMetrics } from "@/lib/api/ecosystemMetrics";
import { getAdminSession } from "@/lib/supabase/authServer";
import TaskQueueWidget from "@/components/admin/TaskQueueWidget";

export default async function AdminOverviewPage() {
  const { supabase } = await getAdminSession();

  let projects = [];
  let interns = [];
  let internStats = { total: 0, verified: 0, avgScore: 0 };
  let allMetrics = [];
  let tasks = [];
  let clientProjects = [];
  let clients = [];

  try {
    const [pRes, iRes, iStatsRes, mRes] = await Promise.all([
      getAllProjects(),
      getAllInterns(),
      getInternStats(),
      getAllMetrics(),
    ]);

    projects = pRes || [];
    interns = iRes || [];
    internStats = iStatsRes || { total: 0, verified: 0, avgScore: 0 };
    allMetrics = mRes || [];

    const [tasksRes, clientProjectsRes, clientsRes] = await Promise.all([
      supabase
        .from("admin_tasks")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("client_projects").select("id, status"),
      supabase.from("clients").select("id"),
    ]);

    tasks = tasksRes?.data || [];
    clientProjects = clientProjectsRes?.data || [];
    clients = clientsRes?.data || [];
  } catch (err) {
    console.error("[AdminOverviewPage] Error loading dashboard data:", err);
  }

  const activeClientProjectsCount = (clientProjects || []).filter(
    (cp) => cp && (cp.status === "active" || cp.status === "onboarding")
  ).length;

  const foundationMetricsCount = (allMetrics || []).filter(
    (m) => m && m.entityType === "foundation"
  ).length;

  const commercialMetricsCount = (allMetrics || []).filter(
    (m) => m && m.entityType === "commercial"
  ).length;

  const activeProjectsCount = (projects || []).filter(
    (p) => p && (p.status === "GA" || p.status === "Beta")
  ).length;

  // Defensive system health check
  let isDegraded = false;
  for (const p of projects) {
    if (!p) continue;
    const rawVal =
      p.metrics?.uptime ||
      p.metrics?.uptimeSla ||
      p.infrastructureCapacity?.uptimeSla;
    if (rawVal) {
      const num = parseFloat(String(rawVal).replace("%", ""));
      if (!isNaN(num) && num < 99.0) {
        isDegraded = true;
        break;
      }
    }
  }

  const systemHealth = isDegraded ? "Degraded" : "Healthy";
  const healthBadge = isDegraded
    ? "bg-amber-100 text-amber-800 border-amber-200"
    : "bg-emerald-100 text-emerald-800 border-emerald-200";

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
          Executive Dashboard
        </span>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-ink">
          Ecosystem Overview &amp; Control
        </h1>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-glass">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Client Engagements
          </div>
          <div className="mt-2 font-mono text-3xl font-black text-emerald-700">
            {activeClientProjectsCount} Active
          </div>
          <div className="mt-1 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>{clients.length} registered clients</span>
            <Link
              href="/admin/clients"
              className="font-bold text-emerald-600 hover:underline shrink-0 ml-1"
            >
              View Clients →
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-glass">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Active Products
          </div>
          <div className="mt-2 font-mono text-3xl font-black text-ink">
            {activeProjectsCount} / {projects.length}
          </div>
          <div className="mt-1 text-xs font-semibold text-slate-500">
            GA &amp; Beta platform deployments
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-glass">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Showcase KPIs
          </div>
          <div className="mt-2 font-mono text-3xl font-black text-ink">
            {allMetrics.length}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>
              {foundationMetricsCount} Foundation · {commercialMetricsCount} Commercial
            </span>
            <Link
              href="/admin/ecosystem-metrics"
              className="font-bold text-emerald-600 hover:underline shrink-0 ml-1"
            >
              Manage →
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-glass">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Verified Candidates
          </div>
          <div className="mt-2 font-mono text-3xl font-black text-moss-700">
            {internStats.verified}
          </div>
          <div className="mt-1 text-xs font-semibold text-slate-500">
            Credentialed skill graphs
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-glass">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            System Health
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`inline-block rounded-full border px-3 py-1 text-sm font-black uppercase tracking-wider ${healthBadge}`}
            >
              {systemHealth}
            </span>
          </div>
          <div className="mt-2 text-xs font-semibold text-slate-500">
            Aggregate SLA threshold: &gt; 99.0%
          </div>
        </div>
      </div>

      {/* Pending Tasks Queue Widget */}
      <section className="w-full">
        <TaskQueueWidget initialTasks={tasks} />
      </section>
    </div>
  );
}
