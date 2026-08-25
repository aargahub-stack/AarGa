import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase/server";
import { getProjectStats } from "./projects";
import { getInternStats } from "./interns";

/**
 * Service layer for the `ecosystem_metrics` table.
 * Stores ecosystem-level KPIs for foundation and commercial entities.
 */

function mapMetricRow(row) {
  return {
    id: row.id,
    entityType: row.entity_type,
    key: row.metric_key,
    label: row.metric_label,
    value: row.metric_value,
    displayOrder: row.display_order,
  };
}

export async function getMetricsByEntity(entityType) {
  if (!isSupabaseConfigured || !supabaseServer) {
    return [];
  }

  try {
    const { data, error } = await supabaseServer
      .from("ecosystem_metrics")
      .select("*")
      .eq("entity_type", entityType)
      .order("display_order", { ascending: true });

    if (error) {
      return [];
    }

    return (data || []).map(mapMetricRow);
  } catch (err) {
    console.error("[getMetricsByEntity] Exception:", err);
    return [];
  }
}

export async function getAllEcosystemMetrics() {
  if (!isSupabaseConfigured || !supabaseServer) {
    return [];
  }

  try {
    const { data, error } = await supabaseServer
      .from("ecosystem_metrics")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      return [];
    }

    return (data || []).map(mapMetricRow);
  } catch (err) {
    console.error("[getAllEcosystemMetrics] Exception:", err);
    return [];
  }
}

// Alias for convenience
export const getAllMetrics = getAllEcosystemMetrics;

/**
 * Shared calculation helper for Cross-Platform Telemetry & Synergy Stats.
 * Used by both public /ecosystem page and admin live mirror page to ensure 100% calculation parity.
 */
export async function getEcosystemSynergyStats() {
  const [projectStats, internStats] = await Promise.all([
    getProjectStats(),
    getInternStats(),
  ]);

  const verifiedPercent =
    internStats.total > 0
      ? Math.round((internStats.verified / internStats.total) * 100)
      : 0;

  return {
    avgUptime: projectStats.avgUptime,
    activeProjects: projectStats.active,
    totalProjects: projectStats.total,
    verifiedPercent,
    totalInterns: internStats.total,
    verifiedInterns: internStats.verified,
  };
}
