const MISSIONS = [
  {
    id: "ngo",
    eyebrow: "Mission One",
    title: "The Foundation",
    body:
      "AarGa began as a grassroots foundation working alongside cooperatives, field technicians, and community lenders who had no software built for how they actually operate. Every tool traces back to a real problem logged in the field, not a whiteboard.",
    stat: { value: "146", label: "Partner organizations onboarded" },
    tone: "moss",
  },
  {
    id: "saas",
    eyebrow: "Mission Two",
    title: "The Platform",
    body:
      "To sustain that work without depending on grant cycles, AarGa built a commercial SaaS layer on the same infrastructure — enterprise customers fund the platform core that the foundation's partners run on for free or at cost.",
    stat: { value: "99.9%", label: "Platform-wide uptime SLA" },
    tone: "emerald",
  },
];

export default function DualMissionSection() {
  return (
    <section id="mission" className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-2">
        {MISSIONS.map((m) => (
          <div
            key={m.id}
            className={`relative overflow-hidden rounded-3xl border p-8 shadow-glass ${
              m.tone === "moss"
                ? "border-moss-200 bg-moss-50/60"
                : "border-emerald-200 bg-emerald-50/60"
            }`}
          >
            <span
              className={`text-xs font-bold uppercase tracking-widest ${
                m.tone === "moss" ? "text-moss-700" : "text-emerald-700"
              }`}
            >
              {m.eyebrow}
            </span>
            <h3 className="mt-3 text-2xl font-extrabold tracking-tight text-ink">
              {m.title}
            </h3>
            <p className="mt-4 max-w-md text-slate-700 leading-relaxed">
              {m.body}
            </p>
            <div className="mt-8 flex items-baseline gap-3">
              <span className="text-4xl font-black tracking-tight text-ink">
                {m.stat.value}
              </span>
              <span className="text-sm font-semibold text-slate-500">
                {m.stat.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-white/70 p-8 shadow-glass md:p-10">
        <div className="grid gap-8 md:grid-cols-[auto,1fr] md:items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ink text-2xl font-black text-white">
            AG
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Founder Story Snapshot
            </span>
            <p className="mt-2 max-w-3xl text-lg leading-relaxed text-slate-700 text-balance">
              &ldquo;We didn&apos;t set out to build a SaaS company. We set
              out to fix a broken payout cycle for one cooperative. PayCircle
              was the fix. Everything since — Nexfix, AarFlow, Exora,
              VeriSkill, GridPay — is the same instinct, applied to the next
              problem a partner brought to us.&rdquo;
            </p>
            <p className="mt-4 text-sm font-semibold text-slate-500">
              Founding Team, AarGa
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
