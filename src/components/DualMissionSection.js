import { getMetricsByEntity } from "@/lib/api/ecosystemMetrics";

const MISSIONS = [
  {
    id: "ngo",
    entityType: "foundation",
    eyebrow: "Mission One",
    title: "The Foundation",
    body:
      "AarGa Foundation is committed to creating meaningful social impact through education, community initiatives, and opportunities for growth. We work towards empowering individuals and communities by supporting initiatives that make knowledge, resources, and progress more accessible.",
    tone: "moss",
  },
  {
    id: "saas",
    entityType: "commercial",
    eyebrow: "Mission Two",
    title: "The Platform",
    body:
      "AarGa builds technology-driven products and digital solutions designed to solve real-world challenges. Through AarGa Hub, we develop scalable platforms across education, finance, productivity, and technology — creating opportunities for innovation, growth, and meaningful impact.",
    tone: "emerald",
  },
];

export default async function DualMissionSection() {
  const [foundationMetrics, commercialMetrics] = await Promise.all([
    getMetricsByEntity("foundation"),
    getMetricsByEntity("commercial"),
  ]);

  const metricsByEntity = {
    foundation: foundationMetrics[0] || {
      value: "146",
      label: "Partner organizations onboarded",
    },
    commercial: commercialMetrics[0] || {
      value: "99.9%",
      label: "Platform-wide uptime SLA",
    },
  };

  return (
    <section id="mission" className="mx-auto max-w-7xl px-6 py-8 md:py-12 lg:px-8">
      {/* Top: Twin Mission Cards Container */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white/85 shadow-glass transition-all hover:shadow-glass-lg">
        <div className="grid grid-cols-1 divide-y divide-slate-100 lg:grid-cols-2 lg:divide-y-0 lg:divide-x lg:divide-slate-100">
          {MISSIONS.map((m) => {
            const stat = metricsByEntity[m.entityType];
            return (
              <div key={m.id} className="flex flex-col justify-between p-6 md:p-8">
                <div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest ${
                      m.tone === "moss"
                        ? "bg-slate-100 text-slate-700"
                        : "bg-[#109A70]/10 text-[#109A70] border border-[#109A70]/20"
                    }`}
                  >
                    {m.tone !== "moss" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#109A70]" />
                    )}
                    {m.eyebrow}
                  </span>
                  <h3 className="mt-3 text-xl md:text-2xl font-extrabold tracking-tight text-ink">
                    {m.title}
                  </h3>
                  <p className="mt-2 text-slate-600 leading-relaxed text-sm">
                    {m.body}
                  </p>
                </div>
                <div className="mt-6 flex items-baseline gap-3 pt-4 border-t border-slate-100">
                  <span
                    className={`text-3xl md:text-4xl font-black tracking-tight ${
                      m.tone === "moss" ? "text-ink" : "text-[#109A70]"
                    }`}
                  >
                    {stat.value}
                  </span>
                  <span className="text-xs md:text-sm font-semibold text-slate-500">
                    {stat.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Standalone Founder Story Snapshot Card with Visual Gap */}
      <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200/90 bg-white/85 p-6 md:p-8 lg:px-10 shadow-glass transition-all hover:shadow-glass-lg">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ink text-base font-black text-white shadow-md">
            AG
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Founder Story Snapshot
            </span>
            <p className="mt-1 text-sm md:text-base lg:text-[17px] font-medium leading-relaxed text-slate-700">
              &ldquo;We didn&apos;t set out to build a corporate software company. We set out to help students and communities—starting from grassroots education through AarGa Hub at age 15. Every platform since—AarCode, NexFix, Exora, AarVed—is simply that same instinct, applied to the next real-world problem a partner brought to our door.&rdquo;
            </p>
          </div>
          <div className="shrink-0 text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200/60">
            <span className="text-sm font-bold text-slate-800 block">Founding Team</span>
            <span className="text-xs text-slate-500 block">AarGa Platform</span>
          </div>
        </div>
      </div>
    </section>
  );
}
