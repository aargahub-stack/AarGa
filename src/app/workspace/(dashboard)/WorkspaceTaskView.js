"use client";

import { useState } from "react";
import { startTaskAction, submitTaskForReviewAction } from "./actions";
import Toast from "@/components/admin/Toast";
import { AlertCircle, CheckCircle2, Clock, Send, Play, MessageSquare, CheckSquare } from "lucide-react";

export default function WorkspaceTaskView({ teamMember, activeTasks, completedTasks, notifications = [] }) {
  const [tasks, setTasks] = useState(activeTasks);
  const [doneTasks, setDoneTasks] = useState(completedTasks);
  const [submittingTaskId, setSubmittingTaskId] = useState(null);
  const [submissionNote, setSubmissionNote] = useState("");
  const [loadingId, setLoadingId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  const handleStartTask = async (task) => {
    setLoadingId(task.id);
    const res = await startTaskAction(task.id);
    setLoadingId(null);

    if (res.success) {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: "in_progress" } : t))
      );
      showToast("success", `Started working on task '${task.title}'`);
    } else {
      showToast("error", res.error || "Failed to start task.");
    }
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    if (!submittingTaskId) return;

    setLoadingId(submittingTaskId);
    const res = await submitTaskForReviewAction(submittingTaskId, submissionNote);
    setLoadingId(null);

    if (res.success) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === submittingTaskId
            ? { ...t, status: "submitted_for_review", submission_note: submissionNote, rejection_reason: null }
            : t
        )
      );
      showToast("success", "Task submitted for lead review.");
      setSubmittingTaskId(null);
      setSubmissionNote("");
    } else {
      showToast("error", res.error || "Failed to submit task.");
    }
  };

  // Group active tasks by project
  const projectGroups = {};
  tasks.forEach((task) => {
    const projName = task.project_phases?.client_projects?.clients?.org_name || "Active Engagement";
    const phaseName = task.project_phases?.name || "Active Phase";
    const key = `${projName} — ${phaseName}`;
    if (!projectGroups[key]) {
      projectGroups[key] = [];
    }
    projectGroups[key].push(task);
  });

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
          Daily Execution Queue
        </span>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-ink">
          Welcome back, {teamMember.name}
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Focus on your assigned tasks in currently active project phases.
        </p>
      </div>

      {/* Actionable Active Tasks Section */}
      <section className="space-y-6">
        <h2 className="text-lg font-bold text-ink">Active Tasks Queue</h2>

        {Object.keys(projectGroups).length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-400">
            <p className="text-sm font-semibold">No active assigned tasks right now.</p>
            <p className="mt-1 text-xs text-slate-400">
              When new phase tasks are assigned to you, they will appear here.
            </p>
          </div>
        ) : (
          Object.entries(projectGroups).map(([groupTitle, groupTasks]) => (
            <div key={groupTitle} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  {groupTitle}
                </h3>
              </div>

              <div className="space-y-4">
                {groupTasks.map((task) => {
                  const isAssigned = task.status === "assigned";
                  const isInProgress = task.status === "in_progress";
                  const isSubmitted = task.status === "submitted_for_review";
                  const isReturned = Boolean(task.rejection_reason);

                  // Extract key points from founder's rejection reason
                  const pointsList = (task.rejection_reason || "")
                    .split(/[\n,;]|\.\s+/)
                    .map((p) => p.trim())
                    .filter((p) => p.length > 2);

                  return (
                    <div
                      key={task.id}
                      className={`rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition-all ${
                        isReturned && isInProgress
                          ? "border-red-300 ring-2 ring-red-500/10"
                          : "border-slate-200"
                      }`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                                isReturned && isInProgress
                                  ? "bg-red-100 text-red-800 border border-red-200"
                                  : isAssigned
                                  ? "bg-slate-100 text-slate-700 border border-slate-200"
                                  : isInProgress
                                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                                  : isSubmitted
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {isReturned && isInProgress
                                ? "Returned for Revisions"
                                : isAssigned
                                ? "Assigned"
                                : isInProgress
                                ? "In Progress"
                                : isSubmitted
                                ? "Submitted — Pending Review"
                                : task.status}
                            </span>
                            {task.required_skill_tags?.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          <h4 className="text-base font-extrabold text-ink">
                            {task.title}
                          </h4>

                          {task.description && (
                            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                              {task.description}
                            </p>
                          )}

                          {/* Founder Rejection Feedback & Key Revision Points Card */}
                          {task.rejection_reason && isInProgress && (
                            <div className="mt-3 rounded-2xl border border-red-200 bg-red-50/90 p-4 text-xs space-y-3">
                              <div className="flex items-center justify-between border-b border-red-200/80 pb-2">
                                <div className="flex items-center gap-1.5 font-black text-red-950">
                                  <AlertCircle size={16} className="text-red-600 shrink-0" />
                                  <span>Founder Rejection Notes &amp; Actionable Feedback</span>
                                </div>
                                <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-black uppercase text-red-800 border border-red-200">
                                  Action Required
                                </span>
                              </div>

                              {/* Exact Founder Message */}
                              <div className="bg-white rounded-xl p-3.5 border border-red-200/90 text-slate-800 font-semibold whitespace-pre-wrap leading-relaxed shadow-sm">
                                <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-red-600 mb-1">
                                  <MessageSquare size={12} />
                                  <span>Founder Message Notes:</span>
                                </div>
                                {task.rejection_reason}
                              </div>

                              {/* Key Revision Points Breakdown */}
                              {pointsList.length > 0 && (
                                <div className="pl-1 space-y-1.5">
                                  <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                                    <CheckSquare size={12} className="text-red-600" />
                                    <span>Key Points to Fix:</span>
                                  </div>
                                  <div className="space-y-1">
                                    {pointsList.map((point, idx) => (
                                      <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-800 bg-white/60 p-2 rounded-lg border border-red-100">
                                        <span className="text-red-600 font-extrabold shrink-0">•</span>
                                        <span className="font-bold leading-tight">{point}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <p className="text-[10px] text-red-700 font-bold pt-1">
                                Please revise your work addressing the founder feedback above, then click &quot;Resubmit for Review&quot;.
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Action Control Buttons */}
                        <div className="shrink-0 pt-2 sm:pt-0">
                          {isAssigned && (
                            <button
                              onClick={() => handleStartTask(task)}
                              disabled={loadingId === task.id}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-moss-800 transition-colors disabled:opacity-50"
                            >
                              <Play size={14} />
                              <span>{loadingId === task.id ? "Starting..." : "Start Task →"}</span>
                            </button>
                          )}

                          {isInProgress && (
                            <button
                              onClick={() => {
                                setSubmittingTaskId(task.id);
                                setSubmissionNote(task.submission_note || "");
                              }}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                            >
                              <Send size={14} />
                              <span>{isReturned ? "Resubmit for Review" : "Submit for Review"}</span>
                            </button>
                          )}

                          {isSubmitted && (
                            <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800">
                              <Clock size={14} className="text-amber-600 animate-pulse" />
                              <span>Awaiting Founder Review</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </section>

      {/* Submission Note Modal */}
      {submittingTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-glass">
            <h3 className="text-lg font-black text-ink">Submit Task for Review</h3>
            <p className="mt-1 text-xs text-slate-500">
              Provide optional submission notes or PR / deliverable links for your reviewer.
            </p>

            <form onSubmit={handleSubmitTask} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600">
                  Submission Notes / Deliverable Links
                </label>
                <textarea
                  rows={3}
                  value={submissionNote}
                  onChange={(e) => setSubmissionNote(e.target.value)}
                  placeholder="e.g. PR #42 merged, updated schema per feedback..."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-ink focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSubmittingTaskId(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingId === submittingTaskId}
                  className="rounded-xl bg-ink px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-moss-800 disabled:opacity-50"
                >
                  {loadingId === submittingTaskId ? "Submitting..." : "Confirm Submission"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Read-Only Completed Tasks Section */}
      {doneTasks.length > 0 && (
        <section className="space-y-4 border-t border-slate-200/80 pt-8">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-500">
            Recently Completed &amp; Verified Tasks
          </h2>

          <div className="space-y-3">
            {doneTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-xs"
              >
                <div>
                  <div className="font-bold text-ink">{task.title}</div>
                  <div className="text-[11px] text-slate-500">
                    Phase: {task.project_phases?.name || "Phase"}
                  </div>
                </div>
                <span className="rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 font-bold text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  <span>Verified Complete</span>
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
