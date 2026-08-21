/**
 * Simulated database table: verified_interns
 * Telemetry scores are produced by the VeriSkill engine (0-100 scale)
 * across four tracked competency dimensions.
 */

export const interns = [
  {
    id: "int-0142",
    name: "Ananya Rao",
    role: "Backend Engineering Intern",
    cohort: "Cohort 7 — Payments Infra",
    location: "Kozhikode, IN",
    avatarInitials: "AR",
    telemetryScore: 92,
    verifiedSkills: ["Node.js", "PostgreSQL", "System Design", "Ledger Modeling"],
    projectsShipped: 4,
    status: "Verified",
    joined: "2025-11-03",
    blurb:
      "Shipped the reconciliation engine improvements now live in PayCircle's settlement pipeline.",
  },
  {
    id: "int-0158",
    name: "Devansh Mehta",
    role: "Frontend Engineering Intern",
    cohort: "Cohort 7 — Ecosystem UI",
    location: "Pune, IN",
    avatarInitials: "DM",
    telemetryScore: 88,
    verifiedSkills: ["React", "Next.js", "Design Systems", "Accessibility"],
    projectsShipped: 6,
    status: "Verified",
    joined: "2025-11-03",
    blurb:
      "Rebuilt the Bento grid component library shared across the marketing site and the Portal.",
  },
  {
    id: "int-0171",
    name: "Fatima Sheikh",
    role: "Data & Analytics Intern",
    cohort: "Cohort 8 — Exora Insight",
    location: "Hyderabad, IN",
    avatarInitials: "FS",
    telemetryScore: 95,
    verifiedSkills: ["dbt", "ClickHouse", "Data Modeling", "Impact Reporting"],
    projectsShipped: 3,
    status: "Verified",
    joined: "2026-01-12",
    blurb:
      "Designed the funder-facing impact report templates now used across 40+ NGO partners.",
  },
  {
    id: "int-0183",
    name: "Karthik Iyer",
    role: "Field Systems Intern",
    cohort: "Cohort 8 — Nexfix Ops",
    location: "Chennai, IN",
    avatarInitials: "KI",
    telemetryScore: 81,
    verifiedSkills: ["PostGIS", "Offline Sync", "Dispatch Logic"],
    projectsShipped: 2,
    status: "In Review",
    joined: "2026-01-12",
    blurb:
      "Building offline dispatch queuing for technician routing in low-connectivity zones.",
  },
  {
    id: "int-0196",
    name: "Meera Nair",
    role: "Trust & Safety Intern",
    cohort: "Cohort 9 — VeriSkill Core",
    location: "Kochi, IN",
    avatarInitials: "MN",
    telemetryScore: 90,
    verifiedSkills: ["Eval Harness Design", "Python", "Fraud Heuristics"],
    projectsShipped: 5,
    status: "Verified",
    joined: "2026-03-02",
    blurb:
      "Co-authored the scoring rubric that now powers the VeriSkill credentialing engine.",
  },
  {
    id: "int-0204",
    name: "Rohan Das",
    role: "Platform Engineering Intern",
    cohort: "Cohort 9 — Identity Core",
    location: "Bengaluru, IN",
    avatarInitials: "RD",
    telemetryScore: 76,
    verifiedSkills: ["Auth", "gRPC", "Kubernetes"],
    projectsShipped: 2,
    status: "In Review",
    joined: "2026-03-02",
    blurb:
      "Migrating shared identity core services onto the new multi-tenant cluster topology.",
  },
];

export function getInternStats() {
  const total = interns.length;
  const verified = interns.filter((i) => i.status === "Verified").length;
  const avgScore = Math.round(
    interns.reduce((sum, i) => sum + i.telemetryScore, 0) / total
  );
  return { total, verified, avgScore };
}
