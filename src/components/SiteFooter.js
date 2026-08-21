import Link from "next/link";
import AargaLogo from "./AargaLogo";

const FOOTER_COLUMNS = [
  {
    title: "Ecosystem",
    links: [
      { label: "PayCircle", href: "/tech#paycircle" },
      { label: "Nexfix", href: "/tech#nexfix" },
      { label: "AarFlow", href: "/tech#aarflow" },
      { label: "Exora", href: "/tech#exora" },
    ],
  },
  {
    title: "Programs",
    links: [
      { label: "Verified Interns", href: "/interns" },
      { label: "VeriSkill Engine", href: "/tech#veriskill" },
      { label: "Founder Portal", href: "/portal" },
    ],
  },
  {
    title: "Mission",
    links: [
      { label: "Grassroots Story", href: "/#mission" },
      { label: "Tech Hub", href: "/tech" },
      { label: "Ecosystem Grid", href: "/#ecosystem" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white/60">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <AargaLogo className="h-8 w-8" />
              <span className="text-lg font-extrabold tracking-tight">
                Aar<span className="text-emerald-600">Ga</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600">
              One ecosystem, two missions: a grassroots NGO built to serve
              communities first, and a SaaS platform engineered to sustain
              that mission at scale.
            </p>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-600 transition-colors hover:text-emerald-700"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 text-sm text-slate-500 md:flex-row">
          <p>© {new Date().getFullYear()} AarGa Foundation &amp; AarGa Technologies. All rights reserved.</p>
          <p className="font-mono text-xs text-slate-400">aarga.org · built as one ecosystem</p>
        </div>
      </div>
    </footer>
  );
}
