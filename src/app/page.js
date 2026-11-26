import Link from "next/link";
import MatrixHero from "@/components/MatrixHero";
import DualMissionSection from "@/components/DualMissionSection";
import EcosystemGrid from "@/components/EcosystemGrid";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  return (
    <>
      <MatrixHero>
        <div className="mx-auto flex max-w-5xl flex-col items-center px-6 pt-24 pb-16 text-center lg:pt-32 lg:pb-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-slate-700 shadow-sm animate-fade-up">
            <span className="h-2 w-2 rounded-full bg-[#109A70]" />
            Grassroots Roots · Enterprise Grade
          </span>

          <h1 className="mt-6 text-5xl font-black tracking-tight text-ink sm:text-6xl md:text-7xl text-balance animate-fade-up">
            One Ecosystem.
            <br />
            <span className="text-[#109A70]">
              Two Missions.
            </span>
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-600 text-balance animate-fade-up">
            AarGa runs a foundation and a SaaS platform on the same
            infrastructure —{" "}
            <span className="font-bold text-ink whitespace-nowrap">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#109A70] mr-1.5 align-middle" />
              AarCode
            </span>{" "}
            handles competitive programming &amp; algorithmic challenges,{" "}
            <span className="font-bold text-ink whitespace-nowrap">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#109A70] mr-1.5 align-middle" />
              NexFix
            </span>{" "}
            handles operations &amp; finance,{" "}
            <span className="font-bold text-ink whitespace-nowrap">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#109A70] mr-1.5 align-middle" />
              Exora
            </span>{" "}
            handles secure examinations &amp; academic integrity, and{" "}
            <span className="font-bold text-ink whitespace-nowrap">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#109A70] mr-1.5 align-middle" />
              AarVed
            </span>{" "}
            handles education &amp; student learning.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row animate-fade-up">
            <Link
              href="/tech"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-bold text-white shadow-glass-lg transition-transform hover:scale-[1.03] hover:bg-moss-800"
            >
              Explore Tech Hub
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/ecosystem"
              className="inline-flex items-center gap-2 rounded-full border-2 border-ink px-7 py-3.5 text-sm font-bold text-ink transition-colors hover:bg-ink hover:text-white"
            >
              Explore Ecosystem
            </Link>
          </div>

          <p className="mt-8 text-xs font-bold uppercase tracking-widest text-slate-500">
            AarGa Foundation &amp; AarGa Private Limited
          </p>
        </div>
      </MatrixHero>

      <DualMissionSection />
      <EcosystemGrid />

      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-ink px-8 py-14 text-center shadow-glass-lg md:px-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl text-balance">
            Ready to see the platform behind the mission?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-300">
            Walk through the full engineering lifecycle, explore the Ecosystem Command Center, or meet the verified interns shipping inside it right now.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/ecosystem"
              className="rounded-full bg-white px-7 py-3.5 text-sm font-bold text-ink shadow-sm transition-transform hover:scale-[1.03] hover:bg-slate-100"
            >
              Explore Ecosystem
            </Link>
            <Link
              href="/tech"
              className="rounded-full border border-white/30 px-7 py-3.5 text-sm font-bold text-white transition-colors hover:border-white hover:bg-white/10"
            >
              Explore Tech Hub
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
