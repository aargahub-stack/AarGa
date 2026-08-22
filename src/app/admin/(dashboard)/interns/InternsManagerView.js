"use client";

import { useState } from "react";
import { deleteInternAction } from "./actions";
import InternForm from "./InternForm";
import Toast from "@/components/admin/Toast";

export default function InternsManagerView({ initialInterns }) {
  const [interns, setInterns] = useState(initialInterns);
  const [activeModalIntern, setActiveModalIntern] = useState(null); // null = closed, {} = new, intern = edit
  const [toast, setToast] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  const handleDelete = async (intern) => {
    if (
      !confirm(
        `Are you sure you want to delete '${intern.name}' from the registry?`
      )
    ) {
      return;
    }

    setDeletingId(intern.id);
    const res = await deleteInternAction(intern.id);
    setDeletingId(null);

    if (res.success) {
      setInterns((prev) => prev.filter((i) => i.id !== intern.id));
      showToast("success", `Candidate '${intern.name}' deleted from registry.`);
    } else {
      showToast("error", res.error || "Failed to delete candidate record.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-moss-700">
            VeriSkill Credential Engine
          </span>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-ink">
            Talent &amp; Intern Registry Manager
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Manage candidates, telemetry scores, and verified skill badges in Supabase.
          </p>
        </div>

        <button
          onClick={() => setActiveModalIntern({})}
          className="inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 text-xs font-bold text-white shadow-glass hover:bg-moss-800 transition-colors"
        >
          <span>+ Register Candidate</span>
        </button>
      </div>

      {/* Interns Data Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white/80 shadow-glass">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/60 uppercase tracking-wider text-slate-400 font-bold">
              <tr>
                <th className="px-6 py-4">Candidate / Role</th>
                <th className="px-6 py-4">Cohort</th>
                <th className="px-6 py-4">Telemetry Score</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {interns.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-slate-400 font-semibold"
                  >
                    No candidates found in registry. Click + Register Candidate to add one.
                  </td>
                </tr>
              ) : (
                interns.map((i) => {
                  const score = i.telemetryScore ?? i.telemetry_score ?? 0;
                  return (
                    <tr key={i.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink font-bold text-white text-xs">
                            {i.avatarInitials || i.avatar_initials || "AG"}
                          </div>
                          <div>
                            <div className="font-extrabold text-ink text-sm">
                              {i.name}
                            </div>
                            <div className="text-[11px] text-slate-500 font-semibold">
                              {i.role}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-semibold">
                        {i.cohortLabel || i.cohort_label || "Cohort Participant"}
                      </td>
                      <td className="px-6 py-4 font-mono">
                        <span className="inline-flex items-center gap-1.5 font-bold text-ink">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              score >= 85
                                ? "bg-emerald-500"
                                : score >= 70
                                ? "bg-amber-500"
                                : "bg-slate-400"
                            }`}
                          />
                          {score} / 100
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold ${
                            i.verifiedStatus === "Verified" ||
                            i.verified_status === "Verified"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {i.verifiedStatus || i.verified_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => setActiveModalIntern(i)}
                          className="rounded-xl border border-slate-200 px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(i)}
                          disabled={deletingId === i.id}
                          className="rounded-xl border border-red-200 px-3 py-1.5 font-bold text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          {deletingId === i.id ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {activeModalIntern !== null && (
        <InternForm
          intern={
            Object.keys(activeModalIntern).length > 0 ? activeModalIntern : null
          }
          onClose={() => setActiveModalIntern(null)}
          onSuccess={(msg) => showToast("success", msg)}
          onError={(msg) => showToast("error", msg)}
        />
      )}
    </div>
  );
}
