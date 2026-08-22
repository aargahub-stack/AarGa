"use client";

import { useState, useEffect } from "react";
import { createProjectAction, updateProjectAction } from "./actions";

export default function ProjectForm({ project, onClose, onSuccess, onError }) {
  const isEditing = Boolean(project?.id);

  const [title, setTitle] = useState(project?.name || project?.title || "");
  const [slug, setSlug] = useState(project?.slug || "");
  const [category, setCategory] = useState(project?.category || "");
  const [tagline, setTagline] = useState(project?.tagline || "");
  const [description, setDescription] = useState(project?.description || "");
  const [liveUrl, setLiveUrl] = useState(project?.liveUrl || project?.live_url || "");
  const [status, setStatus] = useState(project?.status || "Alpha");
  const [accent, setAccent] = useState(project?.accent || "emerald");
  const [size, setSize] = useState(project?.size || "sm");
  const [techStack, setTechStack] = useState(
    Array.isArray(project?.stack || project?.tech_stack)
      ? (project?.stack || project?.tech_stack).join(", ")
      : ""
  );

  const [metricPairs, setMetricPairs] = useState(() => {
    const initialMetrics = project?.metrics || {};
    const entries = Object.entries(initialMetrics);
    if (entries.length === 0) {
      return [{ key: "uptime", value: "99.9%" }];
    }
    return entries.map(([key, value]) => ({ key, value: String(value) }));
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEditing && title) {
      const generated = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setSlug(generated);
    }
  }, [title, isEditing]);

  const handleMetricChange = (index, field, val) => {
    const updated = [...metricPairs];
    updated[index][field] = val;
    setMetricPairs(updated);
  };

  const addMetricPair = () => {
    setMetricPairs([...metricPairs, { key: "", value: "" }]);
  };

  const removeMetricPair = (index) => {
    setMetricPairs(metricPairs.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const metricsObj = {};
    metricPairs.forEach((p) => {
      if (p.key.trim()) {
        metricsObj[p.key.trim()] = p.value.trim();
      }
    });

    const formData = new FormData();
    formData.append("title", title);
    formData.append("slug", slug);
    formData.append("category", category);
    formData.append("tagline", tagline);
    formData.append("description", description);
    formData.append("live_url", liveUrl);
    formData.append("status", status);
    formData.append("accent", accent);
    formData.append("size", size);
    formData.append("tech_stack", techStack);
    formData.append("metrics_json", JSON.stringify(metricsObj));

    let res;
    if (isEditing) {
      res = await updateProjectAction(project.id, formData);
    } else {
      res = await createProjectAction(formData);
    }

    setSubmitting(false);

    if (res.success) {
      onSuccess?.(
        isEditing
          ? `Product '${title}' updated successfully.`
          : `Product '${title}' created successfully.`
      );
      onClose?.();
    } else {
      onError?.(res.error || "Failed to save project.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-glass my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              {isEditing ? "Edit Ecosystem Product" : "New Ecosystem Product"}
            </span>
            <h3 className="text-xl font-black text-ink">
              {isEditing ? `Edit ${project.name || project.title}` : "Add Product to Core"}
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block font-bold text-slate-600 uppercase tracking-wider">
                Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. NexFix"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-600 uppercase tracking-wider">
                Slug *
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. nexfix"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-mono text-ink focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block font-bold text-slate-600 uppercase tracking-wider">
                Category *
              </label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Field Operations"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-600 uppercase tracking-wider">
                Live URL
              </label>
              <input
                type="url"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://nexfix.aarga.org"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-600 uppercase tracking-wider">
              Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Short one-line headline"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-600 uppercase tracking-wider">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Full product capabilities description..."
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-600 uppercase tracking-wider">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-ink focus:border-emerald-600 focus:outline-none"
              >
                <option value="GA">GA</option>
                <option value="Beta">Beta</option>
                <option value="Alpha">Alpha</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-600 uppercase tracking-wider">
                Accent
              </label>
              <select
                value={accent}
                onChange={(e) => setAccent(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-ink focus:border-emerald-600 focus:outline-none"
              >
                <option value="emerald">emerald</option>
                <option value="moss">moss</option>
                <option value="gold">gold</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-600 uppercase tracking-wider">
                Size
              </label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-ink focus:border-emerald-600 focus:outline-none"
              >
                <option value="sm">sm</option>
                <option value="md">md</option>
                <option value="lg">lg</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-600 uppercase tracking-wider">
              Tech Stack (Comma Separated)
            </label>
            <input
              type="text"
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              placeholder="Next.js, Redis, PostGIS, Node.js"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div className="border-t border-slate-200 pt-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-600 uppercase tracking-wider">
                Telemetry &amp; Metrics (JSONB)
              </label>
              <button
                type="button"
                onClick={addMetricPair}
                className="text-xs font-bold text-emerald-600 hover:underline"
              >
                + Add Metric
              </button>
            </div>

            <div className="mt-2 space-y-2">
              {metricPairs.map((pair, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Key (e.g. uptime)"
                    value={pair.key}
                    onChange={(e) => handleMetricChange(idx, "key", e.target.value)}
                    className="w-1/2 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g. 99.9%)"
                    value={pair.value}
                    onChange={(e) => handleMetricChange(idx, "value", e.target.value)}
                    className="w-1/2 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => removeMetricPair(idx)}
                    className="text-slate-400 hover:text-red-600 font-bold px-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
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
              {submitting ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
