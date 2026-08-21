const STATUS_STYLES = {
  Verified: "bg-emerald-100 text-emerald-800",
  "In Review": "bg-gold-400/20 text-gold-600",
};

function scoreColor(score) {
  if (score >= 90) return "text-emerald-600";
  if (score >= 80) return "text-moss-600";
  return "text-gold-600";
}

export default function InternCard({ intern }) {
  return (
    <div className="group flex flex-col rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-glass transition-shadow hover:shadow-glass-lg">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-sm font-bold text-white">
            {intern.avatarInitials}
          </div>
          <div>
            <h3 className="text-base font-bold text-ink">{intern.name}</h3>
            <p className="text-xs font-medium text-slate-500">{intern.role}</p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_STYLES[intern.status]}`}
        >
          {intern.status}
        </span>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-600">{intern.blurb}</p>

      <div className="mt-5 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 font-mono">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-slate-400">
            Telemetry Score
          </div>
          <div className={`text-2xl font-black ${scoreColor(intern.telemetryScore)}`}>
            {intern.telemetryScore}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wide text-slate-400">
            Projects Shipped
          </div>
          <div className="text-2xl font-black text-ink">{intern.projectsShipped}</div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {intern.verifiedSkills.map((skill) => (
          <span
            key={skill}
            className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-400">
        <span>{intern.cohort}</span>
        <span>{intern.location}</span>
      </div>
    </div>
  );
}
