import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase/server";

/**
 * Service layer for the `interns` table (Verified Interns Registry,
 * scored by the VeriSkill telemetry engine).
 *
 * Direct Supabase queries. Throws an error if Supabase is not configured
 * or if a query fails.
 */

function mapInternRow(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.profile_slug,
    role: row.role,
    cohort: row.cohort_label,
    location: row.location,
    avatarInitials:
      row.avatar_initials ||
      (row.name || "")
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    telemetryScore: row.telemetry_score,
    verifiedSkills: row.skills || [],
    projectsShipped: row.projects_shipped || 0,
    status: row.verified_status,
    collegeInfo: row.college_info,
    joined: row.cohort_date,
    blurb: row.blurb,
    createdAt: row.created_at,
  };
}

function ensureSupabase() {
  if (!isSupabaseConfigured || !supabaseServer) {
    throw new Error(
      "[interns api] Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }
}

export async function getAllInterns() {
  ensureSupabase();

  const { data, error } = await supabaseServer
    .from("interns")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`[getAllInterns] Supabase error: ${error.message}`);
  }

  return (data || []).map(mapInternRow);
}

export async function getInternBySlug(slug) {
  ensureSupabase();

  const { data, error } = await supabaseServer
    .from("interns")
    .select("*")
    .eq("profile_slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(`[getInternBySlug] Supabase error: ${error.message}`);
  }

  return data ? mapInternRow(data) : null;
}

export async function getInternStats() {
  const interns = await getAllInterns();
  const total = interns.length;
  const verified = interns.filter((i) => i.status === "Verified").length;
  const avgScore = total
    ? Math.round(interns.reduce((sum, i) => sum + (i.telemetryScore || 0), 0) / total)
    : 0;
  return { total, verified, avgScore };
}
