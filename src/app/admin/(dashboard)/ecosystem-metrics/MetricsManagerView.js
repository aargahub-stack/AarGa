"use client";

import { useState } from "react";
import { deleteMetricAction } from "./actions";
import MetricForm from "./MetricForm";
import Toast from "@/components/admin/Toast";

export default function MetricsManagerView({ initialMetrics }) {
  const [metrics, setMetrics] = useState(initialMetrics);
  const [activeModalMetric, setActiveModalMetric] = useState(null); // null = closed, {} = new, metric = edit
  const [defaultEntity, setDefaultEntity] = useState("foundation");
  const [toast, setToast] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const foundationMetrics = metrics.filter((m) => m.entityType === "foundation");
  const commercialMetrics = metrics.filter((m) => m.entityType === "commercial");

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  const handleDelete = async (metric) => {
    if (
      !confirm(
        `Are you sure you want to delete metric '${metric.label}'? This will immediately remove it from the Dual Mission cards.`
      )
    ) {
      return;
    }

    setDeletingId(metric.id);
    const res = await deleteMetricAction(metric.id);
    setDeletingId(null);

    if (res.success) {
      setMetrics((prev) => prev.filter((m) => m.id !== metric.id));
      showToast("success", `Metric '${metric.label}' was deleted.`);
    } else {
      showToast("error", res.error || "Failed to delete metric.");
    }
  };

  const openNewModal = (entityType) => {
    setDefaultEntity(entityType);
    setActiveModalMetric({});
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            Dual Mission Showcase KPIs
          </span>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-ink">
            Ecosystem Metrics Manager
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Manage live KPI numbers displayed on the homepage and Ecosystem page Dual Mission cards.
          </p>
        </div>
      </div>

      {/* 1. Foundation Metrics Table */}
      <div className="rounded-3xl border border-moss-200 bg-moss-50/40 p-6 shadow-glass">
        <div className="flex items-center justify-between pb-4 border-b border-moss-200/60">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-moss-700">
              Grassroots NGO Arm
            </span>
            <h2 className="text-xl font-extrabold tracking-tight text-ink">
              AarGa Foundation KPIs
            </h2>
          </div>
          <button
            onClick={() => openNewModal("foundation")}
            className="rounded-2xl bg-ink px-4 py-2 text-xs font-bold text-white shadow-glass hover:bg-moss-800 transition-colors"
          >
            + Add Foundation Metric
          </button>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 uppercase tracking-wider text-slate-400 font-bold">
              <tr>
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Metric Label</th>
                <th className="px-5 py-3">Value</th>
                <th className="px-5 py-3">Unique Key</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {foundationMetrics.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-slate-400 font-semibold">
                    No foundation metrics seeded. Click + Add Foundation Metric.
                  </td>
                </tr>
              ) : (
                foundationMetrics.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3 font-mono font-bold text-slate-500">
                      #{m.displayOrder}
                    </td>
                    <td className="px-5 py-3 font-bold text-ink">{m.label}</td>
                    <td className="px-5 py-3 font-mono text-sm font-black text-emerald-700">
                      {m.value}
                    </td>
                    <td className="px-5 py-3 font-mono text-slate-400 text-[11px]">
                      {m.key}
                    </td>
                    <td className="px-5 py-3 text-right space-x-2">
                      <button
                        onClick={() => setActiveModalMetric(m)}
                        className="rounded-xl border border-slate-200 px-3 py-1 font-bold text-slate-700 hover:bg-slate-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(m)}
                        disabled={deletingId === m.id}
                        className="rounded-xl border border-red-200 px-3 py-1 font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId === m.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Commercial Metrics Table */}
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50/40 p-6 shadow-glass">
        <div className="flex items-center justify-between pb-4 border-b border-emerald-200/60">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
              Commercial SaaS Arm
            </span>
            <h2 className="text-xl font-extrabold tracking-tight text-ink">
              AarGa Private Limited KPIs
            </h2>
          </div>
          <button
            onClick={() => openNewModal("commercial")}
            className="rounded-2xl bg-ink px-4 py-2 text-xs font-bold text-white shadow-glass hover:bg-moss-800 transition-colors"
          >
            + Add Commercial Metric
          </button>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 uppercase tracking-wider text-slate-400 font-bold">
              <tr>
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Metric Label</th>
                <th className="px-5 py-3">Value</th>
                <th className="px-5 py-3">Unique Key</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {commercialMetrics.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-slate-400 font-semibold">
                    No commercial metrics seeded. Click + Add Commercial Metric.
                  </td>
                </tr>
              ) : (
                commercialMetrics.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3 font-mono font-bold text-slate-500">
                      #{m.displayOrder}
                    </td>
                    <td className="px-5 py-3 font-bold text-ink">{m.label}</td>
                    <td className="px-5 py-3 font-mono text-sm font-black text-emerald-700">
                      {m.value}
                    </td>
                    <td className="px-5 py-3 font-mono text-slate-400 text-[11px]">
                      {m.key}
                    </td>
                    <td className="px-5 py-3 text-right space-x-2">
                      <button
                        onClick={() => setActiveModalMetric(m)}
                        className="rounded-xl border border-slate-200 px-3 py-1 font-bold text-slate-700 hover:bg-slate-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(m)}
                        disabled={deletingId === m.id}
                        className="rounded-xl border border-red-200 px-3 py-1 font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId === m.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {activeModalMetric !== null && (
        <MetricForm
          metric={
            Object.keys(activeModalMetric).length > 0 ? activeModalMetric : null
          }
          defaultEntity={defaultEntity}
          onClose={() => setActiveModalMetric(null)}
          onSuccess={(msg) => showToast("success", msg)}
          onError={(msg) => showToast("error", msg)}
        />
      )}
    </div>
  );
}
