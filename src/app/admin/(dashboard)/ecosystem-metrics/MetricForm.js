"use client";

import { useState } from "react";
import { createMetricAction, updateMetricAction } from "./actions";

export default function MetricForm({ metric, defaultEntity = "foundation", onClose, onSuccess, onError }) {
  const isEditing = Boolean(metric?.id);

  const [entityType, setEntityType] = useState(metric?.entityType || defaultEntity);
  const [metricKey, setMetricKey] = useState(metric?.key || "");
  const [metricLabel, setMetricLabel] = useState(metric?.label || "");
  const [metricValue, setMetricValue] = useState(metric?.value || "");
  const [displayOrder, setDisplayOrder] = useState(metric?.displayOrder ?? 1);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    formData.append("entity_type", entityType);
    formData.append("metric_key", metricKey);
    formData.append("metric_label", metricLabel);
    formData.append("metric_value", metricValue);
    formData.append("display_order", String(displayOrder));

    let res;
    if (isEditing) {
      res = await updateMetricAction(metric.id, formData);
    } else {
      res = await createMetricAction(formData);
    }

    setSubmitting(false);

    if (res.success) {
      onSuccess?.(
        isEditing
          ? `Metric '${metricLabel}' updated successfully.`
          : `Metric '${metricLabel}' created successfully.`
      );
      onClose?.();
    } else {
      onError?.(res.error || "Failed to save metric record.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-glass my-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              {isEditing ? "Edit Ecosystem Metric" : "New Ecosystem Metric"}
            </span>
            <h3 className="text-xl font-black text-ink">
              {isEditing ? `Edit ${metric.label}` : "Add Metric KPI Row"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-ink font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-600 uppercase tracking-wider">
                Entity Arm *
              </label>
              <select
                value={entityType}
                onChange={(e) => setEntityType(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-ink focus:border-emerald-600 focus:outline-none"
              >
                <option value="foundation">Grassroots Foundation</option>
                <option value="commercial">Commercial SaaS</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-600 uppercase tracking-wider">
                Display Order *
              </label>
              <input
                type="number"
                min={1}
                required
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-mono text-ink focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-600 uppercase tracking-wider">
              Metric Unique Key * {isEditing && "(Read-only when editing)"}
            </label>
            <input
              type="text"
              required
              disabled={isEditing}
              value={metricKey}
              onChange={(e) => setMetricKey(e.target.value)}
              placeholder="e.g. partner_organizations (snake_case)"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-mono text-ink focus:border-emerald-600 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
            />
            <p className="mt-1 text-[10px] text-slate-400">
              Lowercase snake_case key used as the unique constraint per entity.
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-600 uppercase tracking-wider">
              Metric Label (Description) *
            </label>
            <input
              type="text"
              required
              value={metricLabel}
              onChange={(e) => setMetricLabel(e.target.value)}
              placeholder="e.g. Partner organizations onboarded"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-600 uppercase tracking-wider">
              Metric Display Value *
            </label>
            <input
              type="text"
              required
              value={metricValue}
              onChange={(e) => setMetricValue(e.target.value)}
              placeholder="e.g. 146, 99.9%, 40+, or 1.2M"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-mono text-ink focus:border-emerald-600 focus:outline-none"
            />
            <p className="mt-1 text-[10px] text-slate-400">
              Supports numbers (&quot;146&quot;), percentages (&quot;99.9%&quot;), ranges (&quot;40+&quot;), or formatted strings.
            </p>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-2.5 font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-ink px-6 py-2.5 font-bold text-white shadow-glass hover:bg-moss-800 disabled:opacity-50"
            >
              {submitting ? "Saving..." : isEditing ? "Update Metric" : "Create Metric"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
