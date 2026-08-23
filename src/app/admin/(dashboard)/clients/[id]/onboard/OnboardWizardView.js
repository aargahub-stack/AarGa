"use client";

import { useState } from "react";
import Link from "next/link";
import { spawnProjectAction } from "../../actions";
import Toast from "@/components/admin/Toast";
import { ArrowLeft, Rocket, CheckCircle2, UserCheck, Layers } from "lucide-react";

const PROJECT_TYPES = [
  {
    type: "web_application",
    title: "Web Application",
    desc: "Enterprise Web App Blueprint (Next.js, Supabase RLS, Ledger & Auth)",
    badge: "Recommended",
  },
  {
    type: "mobile_application",
    title: "Mobile Application",
    desc: "Cross-Platform Mobile App Blueprint (React Native, Offline Sync)",
  },
  {
    type: "ai_integration_service",
    title: "AI Integration Service",
    desc: "AI Engine & Agent Integration Blueprint (Vector RAG, LLM Nodes)",
  },
  {
    type: "custom_solution",
    title: "Custom Solution",
    desc: "Tailored Architecture Blueprint for Specialized Client Systems",
  },
];

export default function OnboardWizardView({ client }) {
  const [selectedType, setSelectedType] = useState("web_application");
  const [spawning, setSpawning] = useState(false);
  const [spawnedResult, setSpawnedResult] = useState(null);
  const [toast, setToast] = useState(null);

  const handleSpawn = async () => {
    setSpawning(true);
    const res = await spawnProjectAction(client.id, selectedType);
    setSpawning(false);

    if (res.success) {
      setSpawnedResult(res);
      setToast({ type: "success", message: "SOP Project Roadmap spawned successfully!" });
    } else {
      setToast({ type: "error", message: res.error || "Failed to spawn project." });
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <Link
        href="/admin/clients"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-ink transition-colors"
      >
        <ArrowLeft size={16} strokeWidth={2} />
        <span>Back to Clients</span>
      </Link>

      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
          SOP Auto-Spawn Engine
        </span>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-ink">
          Onboard Project for {client.org_name || client.name}
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Select an active SOP blueprint template to automatically instantiate project phases and tasks.
        </p>
      </div>

      {!spawnedResult ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-glass space-y-6">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-500">
            Select Blueprint Template Type
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {PROJECT_TYPES.map((pt) => {
              const isSelected = selectedType === pt.type;
              return (
                <div
                  key={pt.type}
                  onClick={() => setSelectedType(pt.type)}
                  className={`cursor-pointer rounded-2xl border p-5 transition-all ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-600/20"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-ink text-sm">
                      {pt.title}
                    </span>
                    {pt.badge && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        {pt.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    {pt.desc}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSpawn}
              disabled={spawning}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-bold text-white shadow-glass hover:bg-moss-800 transition-colors disabled:opacity-50"
            >
              <Rocket size={18} strokeWidth={2} />
              <span>{spawning ? "Spawning Roadmap..." : "Spawn SOP Project Roadmap →"}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Spawned Result Roadmap Preview */
        <div className="space-y-6">
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-6 shadow-glass flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
              <div>
                <h3 className="text-lg font-black text-ink">
                  SOP Roadmap Live &amp; Active!
                </h3>
                <p className="text-xs text-slate-600">
                  Instantiated {spawnedResult.phases?.length || 0} phases and {spawnedResult.tasks?.length || 0} tasks. Phase 1 is now active.
                </p>
              </div>
            </div>
            <Link
              href="/admin/sop"
              className="rounded-xl bg-ink px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-moss-800"
            >
              Go to SOP Review Queue →
            </Link>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-500">
              Spawned Phase Structure &amp; Smart Suggestions
            </h2>

            {spawnedResult.phases?.map((phase) => {
              const phaseTasks = (spawnedResult.tasks || []).filter(
                (t) => t.project_phase_id === phase.id
              );

              return (
                <div
                  key={phase.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-ink px-2.5 py-0.5 text-xs font-bold text-white">
                        Phase {phase.phase_order}
                      </span>
                      <h3 className="text-base font-extrabold text-ink">
                        {phase.name}
                      </h3>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                        phase.status === "active"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {phase.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {phaseTasks.map((task) => {
                      const suggestions = spawnedResult.suggestions?.[task.id] || [];
                      const topSuggestion = suggestions[0];

                      return (
                        <div
                          key={task.id}
                          className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-ink text-sm">
                              {task.title}
                            </span>
                            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                              {task.status}
                            </span>
                          </div>

                          {task.description && (
                            <p className="text-slate-600 text-xs">
                              {task.description}
                            </p>
                          )}

                          {topSuggestion && (
                            <div className="mt-2 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/60 p-2.5">
                              <div className="flex items-center gap-2">
                                <UserCheck size={16} className="text-emerald-700" />
                                <div>
                                  <div className="font-bold text-ink">
                                    Suggested: {topSuggestion.candidate.name} ({topSuggestion.candidate.role})
                                  </div>
                                  <div className="text-[10px] font-mono text-emerald-700">
                                    Match Score: +{topSuggestion.score} pts · {topSuggestion.reasons[0]}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
