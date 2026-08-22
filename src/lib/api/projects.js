import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase/server";

/**
 * Service layer for the `projects` table (the ecosystem tools: PayCircle,
 * Nexfix, AarFlow, Exora, VeriSkill, GridPay, and anything added later).
 *
 * Direct Supabase queries. Throws an error if Supabase is not configured
 * or if a query fails.
 */

function mapProjectRow(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.title,
    category: row.category,
    tagline: row.tagline,
    description: row.description,
    status: row.status,
    accent: row.accent || "emerald",
    size: row.size || "sm",
    metrics: row.metrics || {},
    stack: row.tech_stack || [],
    liveUrl: row.live_url,
    infrastructureCapacity: row.infrastructure_capacity || {},
    createdAt: row.created_at,
  };
}

function ensureSupabase() {
  if (!isSupabaseConfigured || !supabaseServer) {
    throw new Error(
      "[projects api] Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }
}

export async function getAllProjects() {
  ensureSupabase();

  const { data, error } = await supabaseServer
    .from("projects")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`[getAllProjects] Supabase error: ${error.message}`);
  }

  return (data || []).map(mapProjectRow);
}

export async function getProjectBySlug(slug) {
  ensureSupabase();

  const { data, error } = await supabaseServer
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(`[getProjectBySlug] Supabase error: ${error.message}`);
  }

  return data ? mapProjectRow(data) : null;
}

export async function getProjectStats() {
  const projects = await getAllProjects();
  const total = projects.length;
  const ga = projects.filter((p) => p.status === "GA").length;
  const beta = projects.filter((p) => p.status === "Beta").length;
  const alpha = projects.filter((p) => p.status === "Alpha").length;
  const active = ga + beta;

  // Compute aggregate uptime dynamically from project metrics / infrastructure capacity
  let uptimeSum = 0;
  let uptimeCount = 0;

  for (const p of projects) {
    const rawVal =
      p.metrics?.uptime ||
      p.metrics?.uptimeSla ||
      p.infrastructureCapacity?.uptimeSla ||
      p.infrastructureCapacity?.uptime;
    if (rawVal) {
      const num = parseFloat(String(rawVal).replace("%", ""));
      if (!isNaN(num)) {
        uptimeSum += num;
        uptimeCount++;
      }
    }
  }

  const avgUptime =
    uptimeCount > 0
      ? (uptimeSum / uptimeCount).toFixed(1) + "%"
      : total > 0
      ? "99.9%"
      : "0%";

  return {
    total,
    ga,
    beta,
    alpha,
    active,
    avgUptime,
  };
}
