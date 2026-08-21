import Link from "next/link";

const ACCENT_STYLES = {
  emerald: {
    ring: "ring-emerald-200/70",
    badge: "bg-emerald-100 text-emerald-800",
    dot: "bg-emerald-500",
    glow: "hover:shadow-glow-emerald",
  },
  moss: {
    ring: "ring-moss-200/70",
    badge: "bg-moss-100 text-moss-800",
    dot: "bg-moss-600",
    glow: "hover:shadow-[0_0_40px_-8px_rgba(15,122,72,0.35)]",
  },
  gold: {
    ring: "ring-gold-400/40",
    badge: "bg-gold-400/20 text-gold-600",
    dot: "bg-gold-500",
    glow: "hover:shadow-[0_0_40px_-8px_rgba(217,164,65,0.4)]",
  },
};

const SIZE_CLASSES = {
  lg: "md:col-span-2 md:row-span-2",
  md: "md:col-span-1 md:row-span-2",
  sm: "md:col-span-1 md:row-span-1",
};

export default function BentoToolCard({ tool }) {
  const accent = ACCENT_STYLES[tool.accent] || ACCENT_STYLES.emerald;
  const metricEntries = Object.entries(tool.metrics || {}).slice(0, 3);

  return (
    <Link
      id={tool.slug}
      href={`/tech#${tool.slug}`}
      className={`bento-tile group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/60 glass p-6 shadow-glass ring-1 ${accent.ring} ${accent.glow} ${SIZE_CLASSES[tool.size] || SIZE_CLASSES.sm}`}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-30 blur-3xl transition-opacity duration-500 group-hover:opacity-50"
        style={{
          background:
            tool.accent === "gold"
              ? "radial-gradient(circle, #D9A441, transparent 70%)"
              : tool.accent === "moss"
              ? "radial-gradient(circle, #0F7A48, transparent 70%)"
              : "radial-gradient(circle, #10B981, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative">
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${accent.badge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${accent.dot}`} />
            {tool.category}
          </span>
          <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
            {tool.status}
          </span>
        </div>

        <h3 className="mt-4 text-2xl font-extrabold tracking-tight text-ink">
          {tool.name}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {tool.tagline}
        </p>
      </div>

      {metricEntries.length > 0 && (
        <div className="relative mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-200/70 pt-4 font-mono">
          {metricEntries.map(([key, value]) => (
            <div key={key}>
              <div className="text-[10px] uppercase tracking-wide text-slate-400">
                {key.replace(/([A-Z])/g, " $1")}
              </div>
              <div className="text-sm font-bold text-ink">{value}</div>
            </div>
          ))}
        </div>
      )}
    </Link>
  );
}
