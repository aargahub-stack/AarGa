"use client";

import { useState } from "react";
import { startTaskAction, submitTaskForReviewAction } from "./actions";
import Toast from "@/components/admin/Toast";

export default function WorkspaceTaskView({ teamMember, activeTasks, completedTasks }) {
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
            ? { ...t, status: "submitted_for_review", submission_note: submissionNote }
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

                  return (
                    <div
                      key={task.id}
                      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                                isAssigned
                                  ? "bg-slate-100 text-slate-700 border border-slate-200"
                                  : isInProgress
                                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                                  : isSubmitted
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {isAssigned
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
                        </div>

                        {/* Action Control Buttons */}
                        <div className="shrink-0 pt-2 sm:pt-0">
                          {isAssigned && (
                            <button
                              onClick={() => handleStartTask(task)}
                              disabled={loadingId === task.id}
                              className="rounded-xl bg-ink px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-moss-800 transition-colors disabled:opacity-50"
                            >
                              {loadingId === task.id ? "Starting..." : "Start Task →"}
                            </button>
                          )}

                          {isInProgress && (
                            <button
                              onClick={() => {
                                setSubmittingTaskId(task.id);
                                setSubmissionNote("");
                              }}
                              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                            >
                              Submit for Review
                            </button>
                          )}

                          {isSubmitted && (
                            <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                              Awaiting Lead Review
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
              Provide any optional submission notes or PR links for your lead reviewer.
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
                  placeholder="e.g. PR #42 merged into staging, RLS policies verified..."
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
                <span className="rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 font-bold text-emerald-800">
                  Verified Complete ✓
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
