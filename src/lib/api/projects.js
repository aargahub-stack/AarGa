import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase/server";

/**
 * Service layer for the `projects` table (the ecosystem tools: NexFix,
 * Exora, AarVed, and anything added later).
 *
 * Direct Supabase queries with safe fallback handling.
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

export async function getAllProjects() {
  if (!isSupabaseConfigured || !supabaseServer) {
    console.warn("[projects api] Supabase is not configured.");
    return [];
  }

  try {
    const { data, error } = await supabaseServer
      .from("projects")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.warn(`[getAllProjects] Supabase query notice: ${error.message}`);
      return [];
    }

    return (data || []).map(mapProjectRow);
  } catch (err) {
    console.error("[getAllProjects] Error fetching projects:", err);
    return [];
  }
}

export async function getProjectBySlug(slug) {
  if (!isSupabaseConfigured || !supabaseServer) {
    return null;
  }

  try {
    const { data, error } = await supabaseServer
      .from("projects")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.warn(`[getProjectBySlug] Supabase query notice: ${error.message}`);
      return null;
    }

    return data ? mapProjectRow(data) : null;
  } catch (err) {
    console.error("[getProjectBySlug] Error fetching project by slug:", err);
    return null;
  }
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
