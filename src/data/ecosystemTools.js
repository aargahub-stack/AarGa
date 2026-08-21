/**
 * Simulated database table: ecosystem_tools
 * In production this file is replaced by a query layer (e.g. Prisma/Drizzle)
 * hitting Postgres. Shape is kept identical so swapping the data source
 * requires no changes to consuming components.
 */

export const ecosystemTools = [
  {
    id: "paycircle",
    slug: "paycircle",
    name: "PayCircle",
    category: "Payments Infra",
    tagline: "Circular settlement rails for community-owned finance.",
    description:
      "PayCircle powers pooled payments, rotating savings groups, and instant settlement for cooperatives and micro-enterprises operating outside traditional banking rails.",
    status: "GA",
    accent: "emerald",
    size: "lg",
    metrics: { uptime: "99.98%", txPerDay: "1.2M", latency: "180ms" },
    stack: ["Node.js", "PostgreSQL", "Kafka", "gRPC"],
  },
  {
    id: "nexfix",
    slug: "nexfix",
    name: "Nexfix",
    category: "Field Operations",
    tagline: "Dispatch and repair-network orchestration for hardware fleets.",
    description:
      "Nexfix coordinates verified field technicians, parts inventory, and SLA tracking across distributed hardware deployments in low-connectivity regions.",
    status: "GA",
    accent: "moss",
    size: "md",
    metrics: { uptime: "99.9%", techsActive: "3,400+", avgResolve: "6.2h" },
    stack: ["Next.js", "Redis", "PostGIS"],
  },
  {
    id: "aarflow",
    slug: "aarflow",
    name: "AarFlow",
    category: "Workflow Automation",
    tagline: "No-code process automation built for NGO + SaaS hybrid teams.",
    description:
      "AarFlow lets grant officers and product teams design approval chains, disbursement workflows, and audit trails in a single visual canvas.",
    status: "Beta",
    accent: "gold",
    size: "md",
    metrics: { uptime: "99.7%", workflowsLive: "812", orgsOnboarded: "146" },
    stack: ["React Flow", "Temporal", "PostgreSQL"],
  },
  {
    id: "exora",
    slug: "exora",
    name: "Exora",
    category: "Data & Insight",
    tagline: "Impact analytics that speak both to funders and to engineers.",
    description:
      "Exora ingests raw operational telemetry and renders it as funder-ready impact reports and engineering-ready observability dashboards from one pipeline.",
    status: "GA",
    accent: "emerald",
    size: "sm",
    metrics: { uptime: "99.95%", dashboards: "2,100+", dataPoints: "48M/mo" },
    stack: ["ClickHouse", "dbt", "Next.js"],
  },
  {
    id: "veriskill",
    slug: "veriskill",
    name: "VeriSkill",
    category: "Talent Verification",
    tagline: "Skill telemetry and credentialing engine behind Verified Interns.",
    description:
      "VeriSkill scores real project contributions rather than resumes, producing a portable, verifiable skill graph for every AarGa cohort member.",
    status: "Beta",
    accent: "moss",
    size: "sm",
    metrics: { uptime: "99.8%", cohorts: "24", verifiedSkills: "9,300+" },
    stack: ["Python", "PostgreSQL", "LLM Eval Harness"],
  },
  {
    id: "gridpay",
    slug: "gridpay",
    name: "GridPay",
    category: "Payments Infra",
    tagline: "Offline-first micropayment layer for last-mile utility access.",
    description:
      "GridPay queues and reconciles micropayments for solar and water access points that lose connectivity for hours or days at a time.",
    status: "Alpha",
    accent: "gold",
    size: "sm",
    metrics: { uptime: "99.4%", nodesLive: "560", regions: "4" },
    stack: ["Rust", "SQLite Sync", "MQTT"],
  },
];

export function getToolBySlug(slug) {
  return ecosystemTools.find((tool) => tool.slug === slug) || null;
}

export function getAllTools() {
  return ecosystemTools;
}
