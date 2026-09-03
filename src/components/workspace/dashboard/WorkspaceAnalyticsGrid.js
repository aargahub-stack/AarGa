"use client";

import { CheckSquare, TrendingUp, Clock, Award } from "lucide-react";

export default function WorkspaceAnalyticsGrid({ tasksCount = 0, completedCount = 0, activeHours = 0 }) {
  const approvalRate = tasksCount > 0 ? Math.round((completedCount / tasksCount) * 100) : 100;

  const metrics = [
    {
      title: "Tasks Completed",
      value: completedCount,
      subtitle: "Verified by lead",
      icon: CheckSquare,
      accent: "emerald",
      trend: "+12% this week",
    },
    {
      title: "Approval Rate",
      value: `${approvalRate}%`,
      subtitle: "First submission pass rate",
      icon: Award,
      accent: "sky",
      trend: "High quality",
    },
    {
      title: "Weekly Logged Hours",
      value: `${activeHours} hrs`,
      subtitle: "Recorded via Attendance Tracker",
      icon: Clock,
      accent: "violet",
      trend: "On Track",
    },
    {
      title: "Productivity Index",
      value: "94.8",
      subtitle: "Workspace output score",
      icon: TrendingUp,
      accent: "amber",
      trend: "Top 5%",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-['Space_Grotesk']">
      {metrics.map((m) => {
        const Icon = m.icon;
        return (
          <div
            key={m.title}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {m.title}
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                <Icon size={15} />
              </div>
            </div>

            <div>
              <div className="text-2xl font-black text-ink">{m.value}</div>
              <div className="flex items-center justify-between mt-1 text-[11px]">
                <span className="text-slate-400 font-semibold">{m.subtitle}</span>
                <span className="font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                  {m.trend}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
