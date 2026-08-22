import { getAllInterns, getInternStats } from "@/lib/api/interns";
import InternCard from "@/components/InternCard";

export const metadata = {
  title: "Verified Interns Registry — AarGa",
  description:
    "Dynamic candidate registry powered by the VeriSkill telemetry engine — real skills, real cohorts, real project ships.",
};

export default async function InternsPage() {
  const [interns, stats] = await Promise.all([getAllInterns(), getInternStats()]);

  return (
    <div className="mx-auto max-w-7xl px-6 pt-28 pb-20 lg:px-8">
      <header className="max-w-3xl">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
          Verified Interns Registry
        </span>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-ink sm:text-5xl text-balance">
          Skills verified by telemetry, not resumes.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-600">
          Every candidate below is scored by the VeriSkill engine against
          real, shipped project contributions across the AarGa ecosystem.
        </p>
      </header>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3 sm:max-w-xl">
        <div className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-glass">
          <div className="font-mono text-2xl font-black text-ink">{stats.total}</div>
          <div className="mt-1 text-xs font-semibold text-slate-500">Total interns</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-glass">
          <div className="font-mono text-2xl font-black text-emerald-600">{stats.verified}</div>
          <div className="mt-1 text-xs font-semibold text-slate-500">Fully verified</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-glass">
          <div className="font-mono text-2xl font-black text-moss-600">{stats.avgScore}</div>
          <div className="mt-1 text-xs font-semibold text-slate-500">Avg. telemetry score</div>
        </div>
      </div>

      <section className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {interns.map((intern) => (
          <InternCard key={intern.id} intern={intern} />
        ))}
      </section>
    </div>
  );
}
