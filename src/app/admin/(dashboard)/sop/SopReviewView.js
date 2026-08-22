"use client";

import { useState } from "react";
import { verifyTaskCompletion, rejectTaskSubmission } from "./actions";
import Toast from "@/components/admin/Toast";

export default function SopReviewView({ reviewTasks, activeProjects }) {
  const [tasks, setTasks] = useState(reviewTasks);
  const [rejectingTaskId, setRejectingTaskId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [loadingId, setLoadingId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  const handleVerify = async (task) => {
    setLoadingId(task.id);
    const res = await verifyTaskCompletion(task.id);
    setLoadingId(null);

    if (res.success) {
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      let msg = `Task '${task.title}' verified and completed.`;
      if (res.phaseResult?.nextPhaseUnlocked) {
        msg += " Next phase unlocked automatically!";
      } else if (res.phaseResult?.projectCompleted) {
        msg += " Project completed!";
      }
      showToast("success", msg);
    } else {
      showToast("error", res.error || "Failed to verify task.");
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectingTaskId || !rejectionReason.trim()) return;

    setLoadingId(rejectingTaskId);
    const res = await rejectTaskSubmission(rejectingTaskId, rejectionReason);
    setLoadingId(null);

    if (res.success) {
      setTasks((prev) => prev.filter((t) => t.id !== rejectingTaskId));
      showToast("success", "Task returned to assignee for revisions.");
      setRejectingTaskId(null);
      setRejectionReason("");
    } else {
      showToast("error", res.error || "Failed to reject task.");
    }
  };

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
          Quality Control &amp; Execution Queue
        </span>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-ink">
          SOP Task Review Queue
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Review employee submissions, verify criteria, and advance phase state machines.
        </p>
      </div>

      {/* Pending Reviews Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-extrabold text-ink">
          Submitted Tasks Awaiting Verification ({tasks.length})
        </h2>

        {tasks.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-8 text-center text-slate-400">
            <p className="text-sm font-semibold">No tasks awaiting review right now.</p>
            <p className="mt-1 text-xs text-slate-400">
              Submissions from employee workspaces will appear here in real-time.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((t) => {
              const assigneeName = t.team_members?.name || "Assigned Team Member";
              const projectName = t.project_phases?.client_projects?.clients?.org_name || "Client Project";
              const phaseName = t.project_phases?.name || "Phase";

              return (
                <div
                  key={t.id}
                  className="rounded-3xl border border-amber-200 bg-amber-50/40 p-6 shadow-glass"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-amber-200 bg-amber-100 px-3 py-0.5 text-[10px] font-extrabold text-amber-800">
                          Pending Review
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          {projectName} · Phase: {phaseName}
                        </span>
                      </div>

                      <h3 className="text-lg font-extrabold text-ink">{t.title}</h3>

                      <div className="text-xs font-semibold text-slate-600">
                        Submitted by: <span className="font-bold text-ink">{assigneeName}</span>
                      </div>

                      {t.submission_note && (
                        <div className="mt-2 rounded-2xl border border-slate-200 bg-white p-3.5 text-xs text-slate-700 font-mono">
                          <span className="block font-bold text-[10px] uppercase text-slate-400">
                            Submission Notes
                          </span>
                          {t.submission_note}
                        </div>
                      )}
                    </div>

                    <div className="flex sm:flex-col gap-2 shrink-0">
                      <button
                        onClick={() => handleVerify(t)}
                        disabled={loadingId === t.id}
                        className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-glass hover:bg-emerald-700 transition-colors disabled:opacity-50"
                      >
                        {loadingId === t.id ? "Verifying..." : "Approve & Verify ✓"}
                      </button>
                      <button
                        onClick={() => {
                          setRejectingTaskId(t.id);
                          setRejectionReason("");
                        }}
                        className="rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-50 transition-colors"
                      >
                        Send Back →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Rejection Reason Modal */}
      {rejectingTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-glass">
            <h3 className="text-lg font-black text-ink">Send Back for Revisions</h3>
            <p className="mt-1 text-xs text-slate-500">
              Explain why this task submission needs revision before approval.
            </p>

            <form onSubmit={handleReject} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600">
                  Rejection Reason *
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. RLS policies need unit test coverage..."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-ink focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingTaskId(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingId === rejectingTaskId}
                  className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
                >
                  {loadingId === rejectingTaskId ? "Sending..." : "Send Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Active Projects Roadmap Summary */}
      <section className="space-y-4 border-t border-slate-200 pt-8">
        <h2 className="text-lg font-extrabold text-ink">Active Client Engagements</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {activeProjects.map((p) => (
            <div key={p.id} className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-glass">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-emerald-600">
                  {p.project_type}
                </span>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                  {p.status}
                </span>
              </div>
              <h3 className="mt-2 text-lg font-extrabold text-ink">
                {p.clients?.org_name || p.clients?.name}
              </h3>
              <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
                Contact: <span className="font-semibold text-ink">{p.clients?.contact_email}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
