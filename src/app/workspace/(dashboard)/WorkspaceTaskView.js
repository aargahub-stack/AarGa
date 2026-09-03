"use client";

import { useState } from "react";
import { startTaskAction, submitTaskForReviewAction } from "./actions";
import Toast from "@/components/admin/Toast";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Send,
  Play,
  MessageSquare,
  CheckSquare,
  ListFilter,
  FileCheck,
  Zap,
} from "lucide-react";

import WorkspaceAttendanceWidget from "@/components/workspace/dashboard/WorkspaceAttendanceWidget";
import WorkspaceCompensationCard from "@/components/workspace/dashboard/WorkspaceCompensationCard";
import WorkspaceAnalyticsGrid from "@/components/workspace/dashboard/WorkspaceAnalyticsGrid";

export default function WorkspaceTaskView({
  teamMember,
  activeTasks,
  completedTasks,
  notifications = [],
  attendanceData = {},
  compensationData = {},
}) {
  const [tasks, setTasks] = useState(activeTasks);
  const [doneTasks, setDoneTasks] = useState(completedTasks);
  const [activeTab, setActiveTab] = useState("active"); // 'active', 'pending', 'completed'

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
            ? {
                ...t,
                status: "submitted_for_review",
                submission_note: submissionNote,
                rejection_reason: null,
              }
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

  // Group active tasks
  const inProgressOrAssigned = tasks.filter(
    (t) => t.status === "assigned" || t.status === "in_progress"
  );
  const pendingReviewTasks = tasks.filter(
    (t) => t.status === "submitted_for_review"
  );

  return (
    <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8 font-['Space_Grotesk'] text-ink">
      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-widest mb-1">
            <Zap size={15} /> Workspace Operational Dashboard
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-ink">
            Welcome back, {teamMember.name}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
            Role: <span className="text-emerald-700 font-bold">{teamMember.role}</span> • Enterprise Command Dashboard
          </p>
        </div>
      </div>

      {/* Top Section: Attendance Tracker & Compensation Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WorkspaceAttendanceWidget
          initialActiveSession={attendanceData.activeSession}
          initialHistory={attendanceData.history}
        />
        <WorkspaceCompensationCard
          compensationData={compensationData.data}
          teamMember={teamMember}
        />
      </div>

      {/* Analytics Grid */}
      <WorkspaceAnalyticsGrid
        tasksCount={tasks.length + doneTasks.length}
        completedCount={doneTasks.length}
        activeHours={28}
      />

      {/* Task & Work Execution Section */}
      <section className="space-y-6">
        {/* Task Category Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <ListFilter size={18} className="text-slate-500" />
            <h2 className="text-lg font-black text-ink">Task &amp; Work Execution</h2>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab("active")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "active"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Zap size={14} /> Active Work ({inProgressOrAssigned.length})
            </button>

            <button
              onClick={() => setActiveTab("pending")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "pending"
                  ? "bg-white text-amber-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Clock size={14} /> Pending Approvals ({pendingReviewTasks.length})
            </button>

            <button
              onClick={() => setActiveTab("completed")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "completed"
                  ? "bg-white text-sky-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileCheck size={14} /> Completed ({doneTasks.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Active Work Tasks */}
        {activeTab === "active" && (
          <div className="space-y-4">
            {inProgressOrAssigned.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-400">
                <p className="text-sm font-semibold">No active assigned tasks right now.</p>
                <p className="mt-1 text-xs text-slate-400">
                  When new phase tasks are assigned to you, they will appear here.
                </p>
              </div>
            ) : (
              inProgressOrAssigned.map((task) => {
                const isAssigned = task.status === "assigned";
                const isInProgress = task.status === "in_progress";
                const isReturned = Boolean(task.rejection_reason);

                return (
                  <div
                    key={task.id}
                    className={`rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition-all ${
                      isReturned ? "border-red-300 ring-2 ring-red-500/10" : "border-slate-200"
                    }`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                              isReturned
                                ? "bg-red-100 text-red-800 border border-red-200"
                                : isAssigned
                                ? "bg-slate-100 text-slate-700 border border-slate-200"
                                : "bg-amber-100 text-amber-800 border border-amber-200"
                            }`}
                          >
                            {isReturned ? "Returned for Revisions" : isAssigned ? "Assigned" : "In Progress"}
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

                        <h4 className="text-base font-extrabold text-ink">{task.title}</h4>

                        {task.description && (
                          <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                            {task.description}
                          </p>
                        )}

                        {/* Founder Rejection Notes */}
                        {task.rejection_reason && isInProgress && (
                          <div className="mt-3 rounded-2xl border border-red-200 bg-red-50/90 p-4 text-xs space-y-2">
                            <div className="flex items-center gap-1.5 font-black text-red-950">
                              <AlertCircle size={16} className="text-red-600 shrink-0" />
                              <span>Lead Rejection Notes</span>
                            </div>
                            <p className="bg-white rounded-xl p-3 border border-red-200 text-slate-800 font-semibold">
                              {task.rejection_reason}
                            </p>
                          </div>
                        )}
                      </div>

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
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Pending Approvals */}
        {activeTab === "pending" && (
          <div className="space-y-4">
            {pendingReviewTasks.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-400">
                <p className="text-sm font-semibold">No tasks currently awaiting lead approval.</p>
              </div>
            ) : (
              pendingReviewTasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 flex items-center justify-between"
                >
                  <div>
                    <span className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 mb-1">
                      Submitted for Lead Review
                    </span>
                    <h4 className="text-base font-bold text-ink">{task.title}</h4>
                    {task.submission_note && (
                      <p className="text-xs text-slate-600 mt-1">Note: {task.submission_note}</p>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-xl bg-white border border-amber-200 px-3 py-1.5 text-xs font-bold text-amber-800">
                    <Clock size={14} className="text-amber-600 animate-pulse" />
                    <span>In Lead Queue</span>
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Completed Tasks */}
        {activeTab === "completed" && (
          <div className="space-y-3">
            {doneTasks.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-400">
                <p className="text-sm font-semibold">No completed tasks recorded yet.</p>
              </div>
            ) : (
              doneTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-xs"
                >
                  <div>
                    <div className="font-bold text-ink">{task.title}</div>
                    <div className="text-[11px] text-slate-500">
                      Phase: {task.project_phases?.name || "Verified Output"}
                    </div>
                  </div>
                  <span className="rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 font-bold text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    <span>Verified Complete</span>
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </section>

      {/* Submission Note Modal */}
      {submittingTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-['Space_Grotesk']">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
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
    </div>
  );
}
