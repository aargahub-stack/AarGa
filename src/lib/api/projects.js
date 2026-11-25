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

export const DEFAULT_PROJECTS = [
  {
    id: "proj-aarcode",
    slug: "aarcode",
    name: "AarCode",
    category: "Developer Assessment & Coding",
    tagline: "Competitive programming & algorithmic skill verification",
    description: "Interactive coding environment, automated test suites, and algorithmic challenges powering technical talent evaluation.",
    status: "Beta",
    accent: "emerald",
    size: "lg",
    metrics: { challengesSolved: "120K+", activeCoders: "18K+", judgeLatency: "180ms" },
    stack: ["Isolated Sandbox", "Docker", "Node.js", "PostgreSQL"],
    liveUrl: "https://aarcode.aarga.org",
    infrastructureCapacity: { uptimeSla: "99.9%" },
  },
  {
    id: "proj-nexfix",
    slug: "nexfix",
    name: "NexFix",
    category: "Operations & Finance",
    tagline: "Operations & financial ledger engine for field deployments",
    description: "Enterprise operations platform with dual-entry ledger and continuous audit logging for cooperatives and field technicians.",
    status: "GA",
    accent: "emerald",
    size: "md",
    metrics: { uptime: "99.98%", transactions: "1.4M+", latency: "14ms" },
    stack: ["Cloudflare Workers", "Supabase", "OpenNext"],
    liveUrl: "https://nexfix.aarga.org",
    infrastructureCapacity: { uptimeSla: "99.9%" },
  },
  {
    id: "proj-exora",
    slug: "exora",
    name: "Exora",
    category: "Security & AI",
    tagline: "Autonomous examination & academic integrity intelligence",
    description: "Edge-based remote evaluation pipeline with tamper-evident audit logs and real-time proctoring telemetry.",
    status: "Beta",
    accent: "moss",
    size: "sm",
    metrics: { proctoredExams: "45K+", accuracy: "99.4%", edgeLatency: "22ms" },
    stack: ["WebRTC", "Edge Inference", "Next.js"],
    liveUrl: "https://exora.aarga.org",
    infrastructureCapacity: { uptimeSla: "99.9%" },
  },
  {
    id: "proj-aarved",
    slug: "aarved",
    name: "AarVed",
    category: "Education & Research",
    tagline: "Adaptive learning & foundational knowledge infrastructure",
    description: "Grassroots education platform providing structured curriculum, interactive code sandboxes, and competency tracking.",
    status: "GA",
    accent: "gold",
    size: "sm",
    metrics: { activeLearners: "82K+", institutes: "34", retention: "91%" },
    stack: ["PostgreSQL", "React", "Vector Embeddings"],
    liveUrl: "https://aarved.aarga.org",
    infrastructureCapacity: { uptimeSla: "99.9%" },
  },
];

export async function getAllProjects() {
  if (!isSupabaseConfigured()) {
    return DEFAULT_PROJECTS;
  }

  try {
    const { data, error } = await supabaseServer
      .from("projects")
      .select("*")
      .order("created_at", { ascending: true });

    if (error || !data || data.length === 0) {
      return DEFAULT_PROJECTS;
    }

    return data.map(mapProjectRow);
  } catch (err) {
    console.error("[getAllProjects] Error fetching projects, using fallbacks:", err);
    return DEFAULT_PROJECTS;
  }
}

export async function getProjectBySlug(slug) {
  if (!isSupabaseConfigured()) {
    return DEFAULT_PROJECTS.find((p) => p.slug === slug) || null;
  }

  try {
    const { data, error } = await supabaseServer
      .from("projects")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) {
      return DEFAULT_PROJECTS.find((p) => p.slug === slug) || null;
    }

    return mapProjectRow(data);
  } catch (err) {
    console.error("[getProjectBySlug] Error fetching project by slug:", err);
    return DEFAULT_PROJECTS.find((p) => p.slug === slug) || null;
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
