import { getAllProjects } from "@/lib/api/projects";
import { numberToWord } from "@/lib/formatters";
import { lifecycleStages, platformCapabilities } from "@/data/engineeringLifecycle";

export const metadata = {
  title: "Tech Hub — AarGa",
  description:
    "Detailed capabilities and engineering lifecycle behind the AarGa ecosystem: PayCircle, Nexfix, AarFlow, Exora, VeriSkill, and GridPay.",
};

const ACCENT_TEXT = {
  emerald: "text-emerald-700",
  moss: "text-moss-700",
  gold: "text-gold-600",
};

const ACCENT_BORDER = {
  emerald: "border-emerald-200",
  moss: "border-moss-200",
  gold: "border-gold-400/40",
};

export default async function TechHubPage() {
  const tools = await getAllProjects();

  return (
    <div className="mx-auto max-w-7xl px-6 pt-28 pb-20 lg:px-8">
      <header className="max-w-3xl">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
          Tech Hub
        </span>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-ink sm:text-5xl text-balance">
          Every product, one engineering spine.
        </h1>
        <p className="mt-4 text-lg text-slate-600 leading-relaxed">
          {tools.length > 0 ? `${numberToWord(tools.length)} live products` : "Live products"}, {tools.length > 0 ? `${numberToWord(tools.length, false)} real deployments` : "real deployments"}, one shared platform core.
          Below is the full capability breakdown and the lifecycle every
          feature moves through before it reaches an NGO partner site or an
          enterprise customer.
        </p>
      </header>

      {/* Platform capabilities */}
      <section className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {platformCapabilities.map((cap) => (
          <div
            key={cap.id}
            className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-glass"
          >
            <h3 className="text-lg font-bold text-ink">{cap.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {cap.detail}
            </p>
          </div>
        ))}
      </section>

      {/* Engineering lifecycle */}
      <section className="mt-24">
        <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Engineering lifecycle
        </h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          The path every feature takes, from a field report to a funder
          report.
        </p>

        <ol className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {lifecycleStages.map((stage, idx) => (
            <li
              key={stage.id}
              className="relative rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-glass"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                  {stage.phase}
                </span>
                <span className="font-mono text-xs text-slate-400">
                  {String(idx + 1).padStart(2, "0")} / {String(lifecycleStages.length).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-ink">{stage.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {stage.description}
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {stage.signals.map((signal) => (
                  <li
                    key={signal}
                    className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-500"
                  >
                    {signal}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      {/* Tool deep dive */}
      <section className="mt-24">
        <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Product deep dive
        </h2>
        <div className="mt-10 space-y-6">
          {tools.map((tool) => (
            <article
              key={tool.id}
              id={tool.slug}
              className={`scroll-mt-24 rounded-3xl border bg-white/70 p-8 shadow-glass ${ACCENT_BORDER[tool.accent]}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className={`text-xs font-bold uppercase tracking-widest ${ACCENT_TEXT[tool.accent]}`}>
                    {tool.category}
                  </span>
                  <h3 className="mt-1 text-2xl font-extrabold tracking-tight text-ink">
                    {tool.name}
                  </h3>
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500">
                  {tool.status}
                </span>
              </div>

              <p className="mt-4 max-w-3xl text-slate-600 leading-relaxed">
                {tool.description}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:max-w-xl">
                {Object.entries(tool.metrics).map(([key, value]) => (
                  <div key={key} className="rounded-xl bg-slate-50 p-4 font-mono">
                    <div className="text-[10px] uppercase tracking-wide text-slate-400">
                      {key.replace(/([A-Z])/g, " $1")}
                    </div>
                    <div className="mt-1 text-lg font-bold text-ink">{value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {tool.stack.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
