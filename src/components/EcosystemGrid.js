import { getAllProjects } from "@/lib/api/projects";
import BentoToolCard from "./BentoToolCard";
import Link from "next/link";

export default async function EcosystemGrid() {
  const tools = await getAllProjects();

  return (
    <section id="ecosystem" className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            The Ecosystem
          </span>
          <h2 className="mt-3 max-w-xl text-3xl font-extrabold tracking-tight text-ink sm:text-4xl text-balance">
            Six products. One shared platform core.
          </h2>
          <p className="mt-3 max-w-lg text-slate-600">
            Every tile below is a live product built on the same identity,
            ledger, and telemetry primitives — pulled here from a single
            ecosystem data source.
          </p>
        </div>
        <Link
          href="/tech"
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-ink px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-white"
        >
          View full Tech Hub →
        </Link>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3 md:grid-rows-2">
        {tools.map((tool) => (
          <BentoToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </section>
  );
}
