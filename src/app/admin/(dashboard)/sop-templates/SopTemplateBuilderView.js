"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveTemplate } from "./actions";
import Toast from "@/components/admin/Toast";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Tag,
  Layers,
  CheckCircle2,
} from "lucide-react";

export default function SopTemplateBuilderView({
  initialTemplate = null,
  availableSkills = [],
}) {
  const router = useRouter();
  const [projectType, setProjectType] = useState(
    initialTemplate?.project_type || "web_application"
  );
  const [name, setName] = useState(
    initialTemplate?.name || "Enterprise Web Application Standard Blueprint"
  );
  const [version, setVersion] = useState(initialTemplate?.version || 1);
  const [isActive, setIsActive] = useState(
    initialTemplate?.is_active !== undefined ? initialTemplate.is_active : true
  );

  // Initialize phases & tasks state
  const initialPhases = (initialTemplate?.sop_template_phases || [])
    .sort((a, b) => a.phase_order - b.phase_order)
    .map((p) => ({
      id: p.id,
      name: p.name || "",
      description: p.description || "",
      tasks: (p.sop_template_tasks || [])
        .sort((a, b) => a.task_order - b.task_order)
        .map((t) => ({
          id: t.id,
          title: t.title || "",
          description: t.description || "",
          required_skill_tags: t.required_skill_tags || [],
          estimated_hours: t.estimated_hours || 4.0,
          is_optional: Boolean(t.is_optional),
        })),
    }));

  const [phases, setPhases] = useState(
    initialPhases.length > 0
      ? initialPhases
      : [
          {
            id: "temp-p1",
            name: "Phase 1: Foundation & Provisioning",
            description: "Initial database tables, auth schema, and security setup.",
            tasks: [
              {
                id: "temp-t1",
                title: "Provision Postgres Tables & RLS Policies",
                description: "Create tables and configure security boundary policies.",
                required_skill_tags: ["PostgreSQL / Ledger"],
                estimated_hours: 8.0,
                is_optional: false,
              },
            ],
          },
        ]
  );

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [tagInputText, setTagInputText] = useState({});

  const showToast = (type, message) => setToast({ type, message });

  // Phase operations
  const handleAddPhase = () => {
    setPhases((prev) => [
      ...prev,
      {
        id: `phase-${Date.now()}`,
        name: `Phase ${prev.length + 1}: Execution`,
        description: "",
        tasks: [],
      },
    ]);
  };

  const handleRemovePhase = (pIndex) => {
    setPhases((prev) => prev.filter((_, idx) => idx !== pIndex));
  };

  const handleMovePhase = (pIndex, direction) => {
    setPhases((prev) => {
      const copy = [...prev];
      const targetIndex = pIndex + direction;
      if (targetIndex < 0 || targetIndex >= copy.length) return prev;
      const temp = copy[pIndex];
      copy[pIndex] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const handlePhaseChange = (pIndex, field, value) => {
    setPhases((prev) =>
      prev.map((p, idx) => (idx === pIndex ? { ...p, [field]: value } : p))
    );
  };

  // Task operations
  const handleAddTask = (pIndex) => {
    setPhases((prev) =>
      prev.map((p, idx) => {
        if (idx !== pIndex) return p;
        return {
          ...p,
          tasks: [
            ...p.tasks,
            {
              id: `task-${Date.now()}`,
              title: `Task ${p.tasks.length + 1}`,
              description: "",
              required_skill_tags: [],
              estimated_hours: 4.0,
              is_optional: false,
            },
          ],
        };
      })
    );
  };

  const handleRemoveTask = (pIndex, tIndex) => {
    setPhases((prev) =>
      prev.map((p, idx) => {
        if (idx !== pIndex) return p;
        return {
          ...p,
          tasks: p.tasks.filter((_, tidx) => tidx !== tIndex),
        };
      })
    );
  };

  const handleMoveTask = (pIndex, tIndex, direction) => {
    setPhases((prev) =>
      prev.map((p, idx) => {
        if (idx !== pIndex) return p;
        const copy = [...p.tasks];
        const targetIdx = tIndex + direction;
        if (targetIdx < 0 || targetIdx >= copy.length) return p;
        const temp = copy[tIndex];
        copy[tIndex] = copy[targetIdx];
        copy[targetIdx] = temp;
        return { ...p, tasks: copy };
      })
    );
  };

  const handleTaskChange = (pIndex, tIndex, field, value) => {
    setPhases((prev) =>
      prev.map((p, idx) => {
        if (idx !== pIndex) return p;
        return {
          ...p,
          tasks: p.tasks.map((t, tidx) =>
            tidx === tIndex ? { ...t, [field]: value } : t
          ),
        };
      })
    );
  };

  // Skill Tag operations
  const handleAddTag = (pIndex, tIndex, tagValue) => {
    const trimmed = tagValue?.trim();
    if (!trimmed) return;

    setPhases((prev) =>
      prev.map((p, idx) => {
        if (idx !== pIndex) return p;
        return {
          ...p,
          tasks: p.tasks.map((t, tidx) => {
            if (tidx !== tIndex) return t;
            if (t.required_skill_tags.includes(trimmed)) return t;
            return {
              ...t,
              required_skill_tags: [...t.required_skill_tags, trimmed],
            };
          }),
        };
      })
    );

    setTagInputText((prev) => ({ ...prev, [`${pIndex}-${tIndex}`]: "" }));
  };

  const handleRemoveTag = (pIndex, tIndex, tagToRemove) => {
    setPhases((prev) =>
      prev.map((p, idx) => {
        if (idx !== pIndex) return p;
        return {
          ...p,
          tasks: p.tasks.map((t, tidx) => {
            if (tidx !== tIndex) return t;
            return {
              ...t,
              required_skill_tags: t.required_skill_tags.filter(
                (tag) => tag !== tagToRemove
              ),
            };
          }),
        };
      })
    );
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast("error", "Please enter a template name.");
      return;
    }

    if (phases.length === 0) {
      showToast("error", "Template must contain at least 1 phase.");
      return;
    }

    setSubmitting(true);
    const res = await saveTemplate({
      templateId: initialTemplate?.id || null,
      projectType,
      name,
      version,
      isActive,
      phases,
    });
    setSubmitting(false);

    if (res.success) {
      showToast("success", "SOP Template saved successfully!");
      router.push("/admin/sop-templates");
      router.refresh();
    } else {
      showToast("error", res.error || "Failed to save template.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-8">
      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/sop-templates"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-ink transition-colors mb-2"
          >
            <ArrowLeft size={16} strokeWidth={2} />
            <span>Back to Templates</span>
          </Link>
          <h1 className="text-3xl font-black tracking-tight text-ink">
            {initialTemplate ? "Edit SOP Blueprint" : "Build New SOP Template"}
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Define phases and tasks for auto-spawning live client projects.
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-bold text-white shadow-glass hover:bg-moss-800 transition-colors disabled:opacity-50 shrink-0"
        >
          <Save size={18} strokeWidth={2} />
          <span>{submitting ? "Saving Blueprint..." : "Save Template Blueprint"}</span>
        </button>
      </div>

      {/* Top Header Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-glass space-y-6">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-500">
          Template Information
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600">
              Project Type *
            </label>
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
              className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-ink focus:border-emerald-600 focus:outline-none"
            >
              <option value="web_application">Web Application</option>
              <option value="mobile_application">Mobile Application</option>
              <option value="ai_integration_service">AI Integration Service</option>
              <option value="custom_solution">Custom Solution</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase text-slate-600">
              Template Blueprint Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Enterprise Web Application Standard Blueprint"
              className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-ink focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600">
              Version &amp; Active Status
            </label>
            <div className="mt-1.5 flex items-center gap-3">
              <input
                type="number"
                min="1"
                required
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="w-20 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-xs font-bold text-ink focus:border-emerald-600 focus:outline-none"
              />
              <label className="flex items-center gap-2 cursor-pointer text-xs font-extrabold text-slate-700">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                Active
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Phase & Task Dynamic Nested Builder */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-ink flex items-center gap-2">
            <Layers className="text-emerald-600" size={20} />
            Phase Roadmap &amp; Tasks ({phases.length})
          </h2>

          <button
            type="button"
            onClick={handleAddPhase}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span>Add Phase</span>
          </button>
        </div>

        {phases.map((phase, pIndex) => (
          <div
            key={phase.id}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-glass space-y-6"
          >
            {/* Phase Header Controls */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3 flex-1">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-ink text-xs font-extrabold text-white">
                  P{pIndex + 1}
                </span>
                <input
                  type="text"
                  required
                  value={phase.name}
                  onChange={(e) => handlePhaseChange(pIndex, "name", e.target.value)}
                  placeholder={`Phase ${pIndex + 1} Name`}
                  className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-ink focus:border-emerald-600 focus:outline-none"
                />
              </div>

              {/* Order & Remove Phase Controls */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={pIndex === 0}
                  onClick={() => handleMovePhase(pIndex, -1)}
                  className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                  title="Move Phase Up"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  disabled={pIndex === phases.length - 1}
                  onClick={() => handleMovePhase(pIndex, 1)}
                  className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                  title="Move Phase Down"
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemovePhase(pIndex)}
                  className="rounded-xl border border-red-200 p-2 text-red-600 hover:bg-red-50 ml-2"
                  title="Remove Phase"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Phase Description */}
            <div>
              <input
                type="text"
                value={phase.description}
                onChange={(e) => handlePhaseChange(pIndex, "description", e.target.value)}
                placeholder="Phase objective or summary description..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2 text-xs text-slate-600 focus:border-emerald-600 focus:outline-none"
              />
            </div>

            {/* Task Builder List inside Phase */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Tasks in Phase {pIndex + 1} ({phase.tasks.length})
                </h3>
                <button
                  type="button"
                  onClick={() => handleAddTask(pIndex)}
                  className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                >
                  <Plus size={14} />
                  <span>Add Task to Phase</span>
                </button>
              </div>

              {phase.tasks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
                  No tasks added to this phase yet. Click &quot;Add Task to Phase&quot;.
                </div>
              ) : (
                <div className="space-y-4">
                  {phase.tasks.map((task, tIndex) => {
                    const tagKey = `${pIndex}-${tIndex}`;
                    const currentTagInput = tagInputText[tagKey] || "";

                    return (
                      <div
                        key={task.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 space-y-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-xs font-mono font-bold text-slate-400">
                              T{tIndex + 1}.
                            </span>
                            <input
                              type="text"
                              required
                              value={task.title}
                              onChange={(e) =>
                                handleTaskChange(pIndex, tIndex, "title", e.target.value)
                              }
                              placeholder="Task Title"
                              className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-ink focus:border-emerald-600 focus:outline-none"
                            />
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                              <span>Hours:</span>
                              <input
                                type="number"
                                step="0.5"
                                min="0.5"
                                value={task.estimated_hours}
                                onChange={(e) =>
                                  handleTaskChange(
                                    pIndex,
                                    tIndex,
                                    "estimated_hours",
                                    e.target.value
                                  )
                                }
                                className="w-16 rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs text-center font-bold text-ink"
                              />
                            </div>

                            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={task.is_optional}
                                onChange={(e) =>
                                  handleTaskChange(
                                    pIndex,
                                    tIndex,
                                    "is_optional",
                                    e.target.checked
                                  )
                                }
                                className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600"
                              />
                              Optional
                            </label>

                            {/* Task Order & Remove buttons */}
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={tIndex === 0}
                                onClick={() => handleMoveTask(pIndex, tIndex, -1)}
                                className="rounded-lg border border-slate-200 p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                              >
                                <ArrowUp size={12} />
                              </button>
                              <button
                                type="button"
                                disabled={tIndex === phase.tasks.length - 1}
                                onClick={() => handleMoveTask(pIndex, tIndex, 1)}
                                className="rounded-lg border border-slate-200 p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                              >
                                <ArrowDown size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveTask(pIndex, tIndex)}
                                className="rounded-lg border border-red-200 p-1 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Task Description */}
                        <div>
                          <input
                            type="text"
                            value={task.description}
                            onChange={(e) =>
                              handleTaskChange(pIndex, tIndex, "description", e.target.value)
                            }
                            placeholder="Detailed instructions or acceptance criteria..."
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 focus:border-emerald-600 focus:outline-none"
                          />
                        </div>

                        {/* Required Skill Tags Tag-Input UI */}
                        <div className="space-y-2">
                          <label className="block text-[10px] font-extrabold uppercase text-slate-500">
                            Required Skill Tags (Matching Algorithm)
                          </label>
                          <div className="flex flex-wrap items-center gap-2">
                            {task.required_skill_tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800"
                              >
                                <Tag size={12} />
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTag(pIndex, tIndex, tag)}
                                  className="hover:text-red-700"
                                >
                                  ×
                                </button>
                              </span>
                            ))}

                            {/* Tag Input with Typeahead options */}
                            <div className="relative inline-flex items-center gap-1">
                              <input
                                type="text"
                                value={currentTagInput}
                                onChange={(e) =>
                                  setTagInputText((prev) => ({
                                    ...prev,
                                    [tagKey]: e.target.value,
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAddTag(pIndex, tIndex, currentTagInput);
                                  }
                                }}
                                placeholder="+ Tag (e.g. React / Next.js)"
                                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleAddTag(pIndex, tIndex, currentTagInput)}
                                className="rounded-full bg-slate-200 px-2 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-300"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </form>
  );
}
