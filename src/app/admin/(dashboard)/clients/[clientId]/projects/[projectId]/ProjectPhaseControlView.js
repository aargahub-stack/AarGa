"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  forceUnlockPhase,
  createAdHocTask,
  reopenPhaseAction,
  markProjectCompleted,
  cancelClientProject,
  deleteClientProject,
} from "./actions";
import { verifyTaskCompletion, rejectTaskSubmission } from "@/app/admin/(dashboard)/sop/actions";
import { formatDate } from "@/lib/formatters";
import AssignTaskPanel from "@/components/admin/AssignTaskPanel";
import Toast from "@/components/admin/Toast";
import DeleteConfirmationModal from "@/components/admin/DeleteConfirmationModal";
import {
  ArrowLeft,
  AlertTriangle,
  Unlock,
  Plus,
  RefreshCw,
  UserCheck,
  Tag,
  Layers,
  CheckCircle2,
  Ban,
  Trash2,
  Lock,
} from "lucide-react";

export default function ProjectPhaseControlView({ project, client, phases, activityLogs }) {
  const router = useRouter();
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

  // Modals state for Lifecycle controls
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteModalLoading, setDeleteModalLoading] = useState(false);
  const [deleteModalError, setDeleteModalError] = useState("");

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelModalLoading, setCancelModalLoading] = useState(false);

  const [completingProjectLoading, setCompletingProjectLoading] = useState(false);

  const showToast = (type, message) => setToast({ type, message });

  // Final phase check
  const sortedPhases = [...(phases || [])].sort((a, b) => a.phase_order - b.phase_order);
  const finalPhase = sortedPhases[sortedPhases.length - 1];
  const isFinalPhaseCompleted = finalPhase?.status === "completed";
  const isReadOnly = project.status === "completed" || project.status === "cancelled";

  const handleMarkCompleted = async () => {
    if (!isFinalPhaseCompleted || completingProjectLoading) return;

    setCompletingProjectLoading(true);
    const res = await markProjectCompleted(project.id);
    setCompletingProjectLoading(false);

    if (res.success) {
      showToast("success", "Project marked as Completed successfully.");
      window.location.reload();
    } else {
      showToast("error", res.error || "Failed to complete project.");
    }
  };

  const handleCancelProject = async () => {
    setCancelModalLoading(true);
    const res = await cancelClientProject(project.id);
    setCancelModalLoading(false);

    if (res.success) {
      showToast("success", "Project cancelled.");
      setIsCancelModalOpen(false);
      window.location.reload();
    } else {
      showToast("error", res.error || "Failed to cancel project.");
    }
  };

  const handleDeleteProject = async () => {
    setDeleteModalLoading(true);
    setDeleteModalError("");

    const res = await deleteClientProject(project.id);
    setDeleteModalLoading(false);

    if (res.success) {
      showToast("success", "Project deleted successfully.");
      setIsDeleteModalOpen(false);
      router.push("/admin/clients");
    } else {
      setDeleteModalError(res.error || "Failed to delete project.");
    }
  };

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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteModalError("");
        }}
        onConfirm={handleDeleteProject}
        title="Delete Project Permanently"
        description={`Are you sure you want to delete ${project.project_type.replace(/_/g, " ").toUpperCase()} for ${client.org_name || client.name}? This will remove all phase records.`}
        confirmMatchText={project.project_type}
        confirmButtonText="Delete Permanently"
        loading={deleteModalLoading}
        errorMessage={deleteModalError}
      />

      {/* Cancel Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelProject}
        title="Cancel Project Engagement"
        description="Marking this project as Cancelled preserves historical tasks and logs, but halts further phase execution."
        confirmMatchText=""
        confirmButtonText="Cancel Engagement"
        loading={cancelModalLoading}
      />

      {/* Header & Controls */}
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
            {client.org_name || client.name} — {project.project_type.replace(/_/g, " ").toUpperCase()}
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Active engagement phase roadmap, task allotments, and manual overrides.
          </p>
        </div>

        {/* Status Badge & Lifecycle Action Toolbar */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <span className={`rounded-full px-4 py-1.5 text-xs font-extrabold uppercase tracking-wide border ${
            project.status === "completed"
              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
              : project.status === "cancelled"
              ? "bg-slate-100 text-slate-700 border-slate-300"
              : "bg-emerald-100 text-emerald-800 border-emerald-200"
          }`}>
            Status: {project.status}
          </span>

          {!isReadOnly && (
            <div className="flex items-center gap-2">
              {/* Mark as Completed Button */}
              <div className="relative group">
                <button
                  type="button"
                  onClick={handleMarkCompleted}
                  disabled={!isFinalPhaseCompleted || completingProjectLoading}
                  className={`inline-flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-bold shadow-sm transition-colors ${
                    isFinalPhaseCompleted
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                  }`}
                >
                  <CheckCircle2 size={15} />
                  <span>{completingProjectLoading ? "Completing..." : "Mark as Completed"}</span>
                </button>
                {!isFinalPhaseCompleted && (
                  <div className="absolute right-0 top-full mt-1.5 hidden w-48 rounded-xl bg-slate-900 p-2.5 text-[11px] font-semibold text-white shadow-xl group-hover:block z-30">
                    Final phase must be completed first before marking project as complete.
                  </div>
                )}
              </div>

              {/* Cancel Project Button (Primary / Safer) */}
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-sm"
              >
                <Ban size={14} />
                <span>Cancel Project</span>
              </button>

              {/* Delete Project Button (Secondary / Destructive Red) */}
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors shadow-sm"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Archived / Read-Only Banners */}
      {project.status === "completed" && (
        <div className="rounded-3xl border border-emerald-300 bg-emerald-50 p-5 shadow-glass flex items-center gap-3">
          <CheckCircle2 className="text-emerald-600 shrink-0" size={24} />
          <div>
            <h3 className="text-sm font-extrabold text-emerald-900">
              Project Completed &amp; Archived
            </h3>
            <p className="text-xs text-emerald-700 font-medium">
              This engagement has met all SOP final phase completion criteria. Phase task controls are locked in read-only state.
            </p>
          </div>
        </div>
      )}

      {project.status === "cancelled" && (
        <div className="rounded-3xl border border-slate-300 bg-slate-100 p-5 shadow-glass flex items-center gap-3">
          <Ban className="text-slate-500 shrink-0" size={24} />
          <div>
            <h3 className="text-sm font-extrabold text-slate-800">
              Project Engagement Cancelled
            </h3>
            <p className="text-xs text-slate-600 font-medium">
              This project engagement was cancelled. Task execution and phase unlocks are disabled.
            </p>
          </div>
        </div>
      )}


      {forceUnlockLogs.length > 0 && (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-glass space-y-2">
          {forceUnlockLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 text-xs text-amber-900">
              <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
              <div>
                <span className="font-bold">
                  Phase {log.event_detail?.phase_order}: {log.event_detail?.phase_name} was manually force-unlocked on {formatDate(log.created_at)}
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
                        Unlocked: {formatDate(phase.unlocked_at)}
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
