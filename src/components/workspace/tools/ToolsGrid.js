"use client";

import Link from "next/link";
import {
  Workflow,
  CheckSquare,
  FileCode,
  Zap,
  ArrowRight,
  Sparkles,
  Layers,
  Wrench,
} from "lucide-react";

export default function ToolsGrid() {
  const tools = [
    {
      id: "flowchart-maker",
      name: "Drag-and-Drop Flowchart Maker",
      category: "Architecture & SOP Diagramming",
      description:
        "Infinite grid canvas powered by React Flow for building, persisting, and exporting system flowcharts and process diagrams.",
      icon: Workflow,
      status: "Active",
      accent: "emerald",
      href: "/workspace/flowchart",
      cta: "Launch Canvas",
    },
    {
      id: "sop-engine",
      name: "SOP Task & Execution Engine",
      category: "Workflow Management",
      description:
        "Daily task queue execution, deliverable submissions, and automated lead verification workflow for client projects.",
      icon: CheckSquare,
      status: "Active",
      accent: "sky",
      href: "/workspace",
      cta: "Open Queue",
    },
    {
      id: "markdown-gen",
      name: "Markdown Spec Generator",
      category: "Documentation Tool",
      description:
        "Rapidly generate structured technical specifications, architecture blueprints, and API documentation templates.",
      icon: FileCode,
      status: "Utility Suite",
      accent: "violet",
      href: "/workspace/flowchart",
      cta: "Open Tool",
    },
    {
      id: "api-inspector",
      name: "API & Payload Inspector",
      category: "Developer Utilities",
      description:
        "Test backend webhook endpoints, inspect Supabase auth tokens, and format JSON payloads for client integrations.",
      icon: Zap,
      status: "Utility Suite",
      accent: "amber",
      href: "/workspace/flowchart",
      cta: "Inspect API",
    },
  ];

  return (
    <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8 font-sans text-ink">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-widest mb-1">
            <Wrench size={16} /> AarGa Engineering Toolbox
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Workspace Tools Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-semibold mt-1">
            Modular suite of internal tools, canvas builders, and engineering utilities.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs font-bold text-slate-300 shrink-0">
          <Layers size={16} className="text-emerald-400" />
          <span>4 Internal Tools Available</span>
        </div>
      </div>

      {/* Grid of Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = tool.status === "Active";

          return (
            <div
              key={tool.id}
              className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-emerald-400 border border-slate-800 group-hover:scale-105 transition-transform">
                    <Icon size={22} />
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                      isActive
                        ? "bg-emerald-100 border border-emerald-200 text-emerald-800"
                        : "bg-slate-100 border border-slate-200 text-slate-700"
                    }`}
                  >
                    {tool.status}
                  </span>
                </div>

                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 mb-1">
                  {tool.category}
                </div>
                <h3 className="text-lg font-black text-ink mb-2 group-hover:text-emerald-700 transition-colors">
                  {tool.name}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-4 mt-6 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400">
                  Integrated Tool
                </span>

                <Link
                  href={tool.href}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white transition-all shadow-sm"
                >
                  <span>{tool.cta}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
