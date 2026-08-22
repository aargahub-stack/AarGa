/**
 * Static marketing content: engineering_lifecycle_stages
 * Describes how AarGa builds and hardens each product across its ecosystem.
 */

export const lifecycleStages = [
  {
    id: "discover",
    phase: "Discover",
    title: "Field-sourced problem discovery",
    description:
      "Every AarGa product begins inside an active NGO deployment. Field teams log friction directly into the backlog, so engineering starts from a verified operational problem, not a hypothesis.",
    signals: ["Field reports", "Grassroots partner interviews", "Operational telemetry"],
  },
  {
    id: "design",
    phase: "Design",
    title: "Dual-audience system design",
    description:
      "Architecture is reviewed against two lenses simultaneously: enterprise SaaS scalability and low-connectivity, low-literacy field usability.",
    signals: ["Offline-first constraints", "Accessibility audits", "Multi-tenant modeling"],
  },
  {
    id: "build",
    phase: "Build",
    title: "Shared platform primitives",
    description:
      "NexFix, Exora, and AarVed all consume the same identity, ledger, and telemetry primitives, so a fix in the core propagates across the ecosystem.",
    signals: ["Shared auth core", "Unified ledger service", "Central telemetry bus"],
  },
  {
    id: "verify",
    phase: "Verify",
    title: "Verified intern QA loops",
    description:
      "Cohorts inside the Verified Interns Registry run structured QA and red-team passes on live features, generating the skill telemetry that also credentials them.",
    signals: ["Structured QA cohorts", "Red-team passes", "Skill telemetry capture"],
  },
  {
    id: "ship",
    phase: "Ship",
    title: "Progressive rollout",
    description:
      "Releases move from a single NGO partner site, to a cluster of partner regions, to general availability across the commercial SaaS tier.",
    signals: ["Canary partner sites", "Regional clusters", "GA rollout"],
  },
  {
    id: "sustain",
    phase: "Sustain",
    title: "Impact + uptime reporting",
    description:
      "Exora unifies uptime, cost, and impact metrics into one reporting layer so funders and enterprise customers read from the same source of truth.",
    signals: ["SLA dashboards", "Funder impact reports", "Cost-to-serve tracking"],
  },
];

export const platformCapabilities = [
  {
    id: "identity",
    title: "Unified Identity Core",
    detail:
      "Single sign-on and role-based access spanning every ecosystem tool, from field technician accounts in NexFix to founder-level access in the Portal.",
  },
  {
    id: "ledger",
    title: "Composable Ledger Service",
    detail:
      "A shared double-entry ledger underlies NexFix field operations and enterprise accounting, giving every transaction a consistent, auditable trail.",
  },
  {
    id: "telemetry",
    title: "Central Telemetry Bus",
    detail:
      "Every product streams structured events into one pipeline, powering Exora's dashboards and student telemetry models in AarVed.",
  },
  {
    id: "learning",
    title: "Interactive Learning Pathways",
    detail:
      "AarVed's engine is embeddable, letting products expose educational modules and skill verification without rebuilding orchestration from scratch.",
  },
];
