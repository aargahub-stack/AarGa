"use client";

import { useState } from "react";
import Link from "next/link";
import {
  forceUnlockPhase,
  createAdHocTask,
  reopenPhaseAction,
} from "./actions";
import { verifyTaskCompletion, rejectTaskSubmission } from "@/app/admin/(dashboard)/sop/actions";
import AssignTaskPanel from "@/components/admin/AssignTaskPanel";
import Toast from "@/components/admin/Toast";
import {
  ArrowLeft,
  AlertTriangle,
  Unlock,
  Plus,
  RefreshCw,
  UserCheck,
  Tag,
  Layers,
} from "lucide-react";

export default function ProjectPhaseControlView({ project, client, phases, activityLogs }) {
  const [activePhases] = useState(phases);
  const [assigningTask, setAssigningTask] = useState(null);
  const [unlockingPhase, setUnlockingPhase] = useState(null);
  const [unlockReason, setUnlockReason] = useState("");
  const [reopeningPhase, setReopeningPhase] = useState(null);
  const [reopenReason, setReopenReason] = useState("");
  const [addingAdHocPhaseId, setAddingAdHocPhaseId] = useState(null);
  const [adHocTitle, setAdHocTitle] = useState("");
  const [adHocDesc, setAdHocDesc] = useState("");
  const [adHocTagsText, setAdHocTagsText] = useState("");
  const [adHocHours, setAdHocHours] = useState(4.0);
  const [loadingId, setLoadingId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => setToast({ type, message });

  const forceUnlockLogs = (activityLogs || []).filter(
    (log) => log.event_type === "manual_force_unlock"
  );

  const handleForceUnlock = async (e) => {
    e.preventDefault();
    if (!unlockingPhase || !unlockReason.trim()) return;

    setLoadingId(unlockingPhase.id);
    const res = await forceUnlockPhase(unlockingPhase.id, unlockReason);
    setLoadingId(null);

    if (res.success) {
      showToast("success", `Phase ${unlockingPhase.phase_order} manually force-unlocked.`);
      setUnlockingPhase(null);
      setUnlockReason("");
      window.location.reload();
    } else {
      showToast("error", res.error || "Failed to force unlock phase.");
    }
  };

  const handleReopen = async (e) => {
    e.preventDefault();
    if (!reopeningPhase || !reopenReason.trim()) return;

    setLoadingId(reopeningPhase.id);
    const res = await reopenPhaseAction(reopeningPhase.id, reopenReason);
    setLoadingId(null);

    if (res.success) {
      showToast("success", res.warning || "Phase reopened successfully.");
      setReopeningPhase(null);
      setReopenReason("");
      window.location.reload();
    } else {
      showToast("error", res.error || "Failed to reopen phase.");
    }
  };

  const handleCreateAdHoc = async (e) => {
    e.preventDefault();
    if (!addingAdHocPhaseId || !adHocTitle.trim()) return;

    const tags = adHocTagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    setLoadingId(addingAdHocPhaseId);
    const res = await createAdHocTask({
      projectPhaseId: addingAdHocPhaseId,
      title: adHocTitle,
      description: adHocDesc,
      requiredSkillTags: tags,
      estimatedHours: adHocHours,
    });
    setLoadingId(null);

    if (res.success) {
      showToast("success", "Ad-hoc task added to active phase.");
      setAddingAdHocPhaseId(null);
      setAdHocTitle("");
      setAdHocDesc("");
      setAdHocTagsText("");
      window.location.reload();
    } else {
      showToast("error", res.error || "Failed to create ad-hoc task.");
    }
  };

  const handleVerifyTask = async (task) => {
    setLoadingId(task.id);
    const res = await verifyTaskCompletion(task.id);
    setLoadingId(null);

    if (res.success) {
      showToast("success", `Verified task '${task.title}'.`);
      window.location.reload();
    } else {
      showToast("error", res.error || "Failed to verify task.");
    }
  };

  const handleRejectTask = async (task) => {
    const reason = prompt("Enter rejection reason for employee:");
    if (!reason) return;

    setLoadingId(task.id);
    const res = await rejectTaskSubmission(task.id, reason);
    setLoadingId(null);

    if (res.success) {
      showToast("success", "Task returned to assignee.");
      window.location.reload();
    } else {
      showToast("error", res.error || "Failed to reject task.");
    }
  };

  return (
    <div className="w-full space-y-8">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/clients"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-ink transition-colors mb-2"
          >
            <ArrowLeft size={16} strokeWidth={2} />
            <span>Back to Clients</span>
          </Link>
          <span className="block text-xs font-bold uppercase tracking-widest text-emerald-600">
            Live SOP Phase Control Panel
          </span>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-ink">
            {client.org_name || client.name} — {project.project_type.toUpperCase()}
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Active engagement phase roadmap, task allotments, and manual overrides.
          </p>
        </div>

        <span className="rounded-full bg-emerald-100 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wide text-emerald-800 border border-emerald-200 shrink-0">
          Status: {project.status}
        </span>
      </div>

      {forceUnlockLogs.length > 0 && (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-glass space-y-2">
          {forceUnlockLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 text-xs text-amber-900">
              <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
              <div>
                <span className="font-bold">
                  Phase {log.event_detail?.phase_order}: {log.event_detail?.phase_name} was manually force-unlocked on {new Date(log.created_at).toLocaleDateString()}
                </span>
                <p className="mt-0.5 font-mono text-[11px] text-amber-800">
                  Reason: &quot;{log.event_detail?.reason}&quot; — Normal completion gating was bypassed.
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-6">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <Layers size={18} className="text-emerald-600" />
          Execution Phases ({activePhases.length})
        </h2>

        {activePhases.map((phase) => {
          const isCompleted = phase.status === "completed";
          const isActive = phase.status === "active";
          const isLocked = phase.status === "locked";
          const tasks = phase.sop_tasks || [];

          return (
            <div
              key={phase.id}
              className={`rounded-3xl border transition-all p-6 ${
                isActive
                  ? "border-emerald-500 bg-white shadow-glass ring-2 ring-emerald-500/10"
                  : isCompleted
                  ? "border-slate-200 bg-slate-50/70 opacity-90"
                  : "border-slate-200 bg-slate-100/60 opacity-60"
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-xl font-black text-xs ${
                      isActive
                        ? "bg-emerald-600 text-white"
                        : isCompleted
                        ? "bg-moss-700 text-white"
                        : "bg-slate-300 text-slate-700"
                    }`}
                  >
                    P{phase.phase_order}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-ink">{phase.name}</h3>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                          isActive
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : isCompleted
                            ? "bg-moss-100 text-moss-800 border border-moss-200"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {phase.status}
                      </span>
                    </div>

                    {phase.unlocked_at && (
                      <span className="text-[11px] font-mono text-slate-500">
                        Unlocked: {new Date(phase.unlocked_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isActive && (
                    <button
                      onClick={() => setAddingAdHocPhaseId(phase.id)}
                      className="inline-flex items-center gap-1 rounded-xl bg-ink px-3 py-1.5 text-xs font-bold text-white hover:bg-moss-800 transition-colors"
                    >
                      <Plus size={14} />
                      <span>+ Add Task</span>
                    </button>
                  )}

                  {isCompleted && (
                    <button
                      onClick={() => setReopeningPhase(phase)}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <RefreshCw size={14} />
                      <span>Reopen Phase</span>
                    </button>
                  )}

                  {isLocked && (
                    <button
                      onClick={() => setUnlockingPhase(phase)}
                      className="inline-flex items-center gap-1 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-colors"
                    >
                      <Unlock size={14} />
                      <span>Force Unlock (Emergency)</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {tasks.length === 0 ? (
                  <div className="text-xs text-slate-400 font-semibold p-2">
                    No tasks configured in this phase.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tasks.map((task) => {
                    const assignee = task.team_members;
                    const isSubmitted = task.status === "submitted_for_review";
                    const isAdHoc = task.source === "ad_hoc";

                    return (
                      <div
                        key={task.id}
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-ink text-sm">
                                {task.title}
                              </span>
                              {isAdHoc && (
                                <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-extrabold text-purple-800 border border-purple-200">
                                  Ad-Hoc Task
                                </span>
                              )}
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                  task.status === "completed"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : isSubmitted
                                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {task.status}
                              </span>
                            </div>

                            {task.description && (
                              <p className="text-xs text-slate-600">{task.description}</p>
                            )}

                            <div className="flex flex-wrap gap-1 pt-1">
                              {task.required_skill_tags?.map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600"
                                >
                                  <Tag size={10} />
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {isActive && (
                              <div>
                                {assignee ? (
                                  <div className="flex items-center gap-2">
                                    <div className="text-right">
                                      <div className="text-xs font-bold text-ink flex items-center gap-1">
                                        <UserCheck size={14} className="text-emerald-600" />
                                        {assignee.name}
                                      </div>
                                      <div className="text-[10px] text-slate-400">
                                        {task.assignment_method}
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => setAssigningTask(task)}
                                      className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                                    >
                                      Reassign
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setAssigningTask(task)}
                                    className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                                  >
                                    Assign Employee →
                                  </button>
                                )}
                              </div>
                            )}

                            {isSubmitted && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleVerifyTask(task)}
                                  disabled={loadingId === task.id}
                                  className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
                                >
                                  Approve &amp; Verify ✓
                                </button>
                                <button
                                  onClick={() => handleRejectTask(task)}
                                  disabled={loadingId === task.id}
                                  className="rounded-xl border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50 transition-colors"
                                >
                                  Send Back
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {task.submission_note && (
                          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-2.5 text-xs font-mono text-amber-900">
                            Submission Note: {task.submission_note}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            </div>
          )
        })}
      </div>

      {assigningTask && (
        <AssignTaskPanel
          task={assigningTask}
          onClose={() => setAssigningTask(null)}
          onAssigned={() => {
            showToast("success", `Assigned task '${assigningTask.title}'`);
            window.location.reload();
          }}
        />
      )}

      {unlockingPhase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-glass space-y-4">
            <h3 className="text-lg font-black text-ink">Emergency Force Unlock Phase</h3>
            <p className="text-xs text-amber-800 bg-amber-50 p-3 rounded-2xl border border-amber-200 font-semibold">
              Warning: Force unlocking Phase {unlockingPhase.phase_order} bypasses normal task completion checks. This action will be logged in sop_activity_logs.
            </p>

            <form onSubmit={handleForceUnlock} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600">
                  Override Reason *
                </label>
                <textarea
                  rows={3}
                  required
                  value={unlockReason}
                  onChange={(e) => setUnlockReason(e.target.value)}
                  placeholder="e.g. Executive override due to milestone deadline..."
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs text-ink focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUnlockingPhase(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingId === unlockingPhase.id}
                  className="rounded-xl bg-amber-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-700 disabled:opacity-50"
                >
                  {loadingId === unlockingPhase.id ? "Unlocking..." : "Confirm Force Unlock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {reopeningPhase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-glass space-y-4">
            <h3 className="text-lg font-black text-ink">Reopen Completed Phase</h3>
            <p className="text-xs text-slate-500">
              Reopening Phase {reopeningPhase.phase_order} will set its status back to active.
            </p>

            <form onSubmit={handleReopen} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600">
                  Reopen Reason *
                </label>
                <textarea
                  rows={3}
                  required
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  placeholder="e.g. Client requested rework on phase deliverables..."
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs text-ink focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReopeningPhase(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingId === reopeningPhase.id}
                  className="rounded-xl bg-ink px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-moss-800 disabled:opacity-50"
                >
                  {loadingId === reopeningPhase.id ? "Reopening..." : "Confirm Reopen"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {addingAdHocPhaseId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-glass space-y-4">
            <h3 className="text-lg font-black text-ink">Add Ad-Hoc Task to Phase</h3>

            <form onSubmit={handleCreateAdHoc} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase text-slate-600">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={adHocTitle}
                  onChange={(e) => setAdHocTitle(e.target.value)}
                  placeholder="e.g. Hotfix staging SSL configuration"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-ink focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-600">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={adHocDesc}
                  onChange={(e) => setAdHocDesc(e.target.value)}
                  placeholder="Detailed instructions for employee..."
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-ink focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-600">
                  Required Skill Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={adHocTagsText}
                  onChange={(e) => setAdHocTagsText(e.target.value)}
                  placeholder="PostgreSQL / Ledger, React / Next.js"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-ink focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-600">
                  Estimated Hours
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={adHocHours}
                  onChange={(e) => setAdHocHours(e.target.value)}
                  className="mt-1 w-24 rounded-xl border border-slate-200 p-2 text-ink text-center font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddingAdHocPhaseId(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingId === addingAdHocPhaseId}
                  className="rounded-xl bg-ink px-5 py-2 font-bold text-white shadow-sm hover:bg-moss-800 disabled:opacity-50"
                >
                  {loadingId === addingAdHocPhaseId ? "Adding..." : "Add Ad-Hoc Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
