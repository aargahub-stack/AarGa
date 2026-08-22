import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase/server";

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

function ensureSupabase() {
  if (!isSupabaseConfigured || !supabaseServer) {
    throw new Error(
      "[ecosystemMetrics api] Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }
}

export async function getMetricsByEntity(entityType) {
  ensureSupabase();

  const { data, error } = await supabaseServer
    .from("ecosystem_metrics")
    .select("*")
    .eq("entity_type", entityType)
    .order("display_order", { ascending: true });

  if (error) {
    console.error(
      `[getMetricsByEntity] Supabase query notice for entity '${entityType}': ${error.message}`
    );
    return [];
  }

  return (data || []).map(mapMetricRow);
}

export async function getAllEcosystemMetrics() {
  ensureSupabase();

  const { data, error } = await supabaseServer
    .from("ecosystem_metrics")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    console.error(`[getAllEcosystemMetrics] Supabase notice: ${error.message}`);
    return [];
  }

  return (data || []).map(mapMetricRow);
}
