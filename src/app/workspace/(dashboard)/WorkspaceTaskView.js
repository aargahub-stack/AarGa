"use client";

import { useState } from "react";
import { startTaskAction, submitTaskForReviewAction } from "./actions";
import Toast from "@/components/admin/Toast";
import WorkspaceSessionTimer from "@/components/workspace/dashboard/WorkspaceSessionTimer";
import {
  Clock,
  DollarSign,
  CheckCircle2,
  ThumbsUp,
  CalendarClock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  FileText,
  AlertCircle,
  MoreHorizontal,
  Play,
  Send,
  CheckSquare,
} from "lucide-react";

export default function WorkspaceTaskView({
  teamMember,
  activeTasks = [],
  completedTasks = [],
  notifications = [],
  compensationData = {},
}) {
  const [tasks, setTasks] = useState(activeTasks);
  const [doneTasks, setDoneTasks] = useState(completedTasks);
  const [activeTab, setActiveTab] = useState("active");

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

  const inProgressOrAssigned = tasks.filter(
    (t) => t.status === "assigned" || t.status === "in_progress"
  );
  const pendingReviewTasks = tasks.filter(
    (t) => t.status === "submitted_for_review"
  );

  const metrics = [
    {
      label: "Tasks Completed",
      value: doneTasks.length || "247",
      change: "+12",
      trend: "up",
      icon: CheckCircle2,
      progress: 82,
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-100",
    },
    {
      label: "Approval Rate",
      value: "96.3%",
      change: "+2.1%",
      trend: "up",
      icon: ThumbsUp,
      progress: 96,
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-100",
    },
    {
      label: "Weekly Hours",
      value: "38.5",
      change: "+3.2h",
      trend: "up",
      icon: CalendarClock,
      progress: 77,
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-100",
    },
    {
      label: "Productivity Index",
      value: "87.4",
      change: "-1.8",
      trend: "down",
      icon: TrendingUp,
      progress: 87,
      color: "text-sky-600",
      bg: "bg-sky-50 border-sky-100",
    },
  ];

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 font-sans text-ink p-4 sm:p-6 lg:p-8">
      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Page Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black font-['Space_Grotesk'] text-ink">Dashboard</h1>
          <p className="mt-0.5 text-xs sm:text-sm font-semibold text-slate-500">
            Welcome back, {teamMember?.name || "Operator"}. Here&apos;s your workspace overview.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">
          <Zap className="h-3.5 w-3.5 text-emerald-600" />
          <span>On Shift</span>
        </div>
      </div>

      {/* Top Row: Session Timer + Compensation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Session Timer Widget */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-1 flex flex-col justify-between">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
                <Clock className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-black font-['Space_Grotesk'] text-ink">Session Timer</h2>
            </div>
            <MoreHorizontal className="h-4 w-4 text-slate-400" />
          </div>

          <div className="flex flex-1 items-center justify-center py-2">
            <WorkspaceSessionTimer />
          </div>

          <div className="mt-2 flex items-center justify-center gap-4 text-[11px] font-semibold text-slate-500 border-t border-slate-100 pt-3">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Heartbeat active
            </span>
            <span>•</span>
            <span>Auto-tracking enabled</span>
          </div>
        </div>

        {/* Compensation & Stipend Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
                <DollarSign className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-black font-['Space_Grotesk'] text-ink">Compensation &amp; Stipend</h2>
            </div>
            <button className="text-[11px] font-extrabold text-emerald-700 hover:underline">
              View breakdown →
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Current Balance</p>
              <p className="mt-1 text-xl font-black text-ink">₹65,000</p>
              <p className="mt-1 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                <ArrowUpRight className="h-3 w-3" /> +₹4,200 this week
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pending Payout</p>
              <p className="mt-1 text-xl font-black text-ink">₹15,000</p>
              <p className="mt-1 text-[11px] font-medium text-slate-500">Available Sep 30</p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Monthly Stipend</p>
              <p className="mt-1 text-xl font-black text-ink">₹65,000</p>
              <p className="mt-1 text-[11px] font-medium text-slate-500">Paid on 1st</p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Lifetime Earnings</p>
              <p className="mt-1 text-xl font-black text-ink">₹4,89,200</p>
              <p className="mt-1 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                <ArrowUpRight className="h-3 w-3" /> +8.2% YoY
              </p>
            </div>
          </div>

          {/* Earnings Mini Bar Chart */}
          <div className="mt-5 border-t border-slate-100 pt-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-bold text-slate-700">Weekly Earnings</p>
              <p className="text-[11px] font-semibold text-slate-400">Last 7 days</p>
            </div>
            <div className="flex items-end justify-between gap-2 h-16 pt-2">
              {[42, 58, 35, 72, 48, 65, 84].map((h, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1 h-full justify-end">
                  <div
                    className="w-full rounded-t-md bg-emerald-600/80 hover:bg-emerald-600 transition-all duration-300"
                    style={{ height: `${h}%` }}
                  />
                  <span className="text-[9px] font-bold text-slate-400">
                    {["M", "T", "W", "T", "F", "S", "S"][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Productivity Metrics Grid */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-black font-['Space_Grotesk'] text-ink">Productivity Metrics</h2>
          <span className="text-xs font-semibold text-slate-400">Updated 2 min ago</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            const TrendIcon = metric.trend === "up" ? ArrowUpRight : ArrowDownRight;
            return (
              <div key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-emerald-500 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${metric.bg}`}>
                      <Icon className={`h-4 w-4 ${metric.color}`} />
                    </div>
                    <span
                      className={`flex items-center gap-0.5 text-[11px] font-extrabold ${
                        metric.trend === "up" ? "text-emerald-600" : "text-amber-600"
                      }`}
                    >
                      <TrendIcon className="h-3 w-3" />
                      {metric.change}
                    </span>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {metric.label}
                  </p>
                  <p className="mt-0.5 text-2xl font-black text-ink">{metric.value}</p>
                </div>

                <div className="mt-4">
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${metric.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task & Work Execution Queue Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black font-['Space_Grotesk'] text-ink">Task &amp; Work Execution</h2>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">Track and manage your assigned work queue</p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab("active")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "active"
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Active Work ({inProgressOrAssigned.length})
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "pending"
                  ? "bg-white text-amber-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Pending Approvals ({pendingReviewTasks.length})
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "completed"
                  ? "bg-white text-sky-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Completed ({doneTasks.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Active Work Table */}
        {activeTab === "active" && (
          <div className="overflow-x-auto">
            {inProgressOrAssigned.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <AlertCircle className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                <p className="text-xs font-bold">No active tasks in this queue</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] uppercase font-bold tracking-wider text-slate-500">
                    <th className="px-5 py-3">Task ID</th>
                    <th className="px-5 py-3">Title</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inProgressOrAssigned.map((task) => {
                    const isAssigned = task.status === "assigned";
                    const isInProgress = task.status === "in_progress";
                    const isReturned = Boolean(task.rejection_reason);

                    return (
                      <tr key={task.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-4 font-mono font-bold text-slate-400">
                          {task.id?.slice(0, 8) || "TSK-1042"}
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-extrabold text-ink">{task.title}</div>
                          {task.description && (
                            <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                              {task.description}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4">
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
                        </td>
                        <td className="px-5 py-4 text-right">
                          {isAssigned && (
                            <button
                              onClick={() => handleStartTask(task)}
                              disabled={loadingId === task.id}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-moss-800 transition-colors disabled:opacity-50"
                            >
                              <Play size={13} />
                              <span>{loadingId === task.id ? "Starting..." : "Start Task"}</span>
                            </button>
                          )}

                          {isInProgress && (
                            <button
                              onClick={() => {
                                setSubmittingTaskId(task.id);
                                setSubmissionNote(task.submission_note || "");
                              }}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors"
                            >
                              <Send size={13} />
                              <span>Submit</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 2: Pending Approvals Table */}
        {activeTab === "pending" && (
          <div className="p-5">
            {pendingReviewTasks.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <p className="text-xs font-bold">No tasks awaiting lead approval</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingReviewTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/40 p-4 text-xs"
                  >
                    <div>
                      <div className="font-extrabold text-ink">{task.title}</div>
                      <div className="text-[11px] text-amber-800 mt-0.5">Awaiting lead verification</div>
                    </div>
                    <span className="rounded-full border border-amber-200 bg-amber-100 px-3 py-1 font-bold text-amber-800">
                      In Review Queue
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Completed Tasks Table */}
        {activeTab === "completed" && (
          <div className="p-5">
            {doneTasks.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <p className="text-xs font-bold">No completed tasks recorded yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {doneTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-xs"
                  >
                    <div>
                      <div className="font-extrabold text-ink">{task.title}</div>
                      <div className="text-[11px] text-slate-500">Verified Output</div>
                    </div>
                    <span className="rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 font-bold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      <span>Verified Complete</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer note */}
      <div className="flex items-center justify-center gap-2 pt-2 text-[11px] font-semibold text-slate-400">
        <FileText className="h-3.5 w-3.5" />
        AarGa OS Workspace v2.4.1 — Enterprise Edition
      </div>
    </div>
  );
}
