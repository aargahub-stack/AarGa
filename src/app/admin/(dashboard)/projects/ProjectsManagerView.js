"use client";

import { useState } from "react";
import { deleteProjectAction } from "./actions";
import ProjectForm from "./ProjectForm";
import Toast from "@/components/admin/Toast";

export default function ProjectsManagerView({ initialProjects }) {
  const [projects, setProjects] = useState(initialProjects);
  const [activeModalProject, setActiveModalProject] = useState(null); // null = closed, {} = new, project = edit
  const [toast, setToast] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  const handleDelete = async (project) => {
    if (
      !confirm(
        `Are you sure you want to delete '${project.name || project.title}'? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingId(project.id);
    const res = await deleteProjectAction(project.id);
    setDeletingId(null);

    if (res.success) {
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
      showToast("success", `Product '${project.name || project.title}' was deleted.`);
    } else {
      showToast("error", res.error || "Failed to delete project.");
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
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            Ecosystem Core
          </span>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-ink">
            Ecosystem Product Manager
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Manage flagship products and infrastructure metrics seeded into Supabase.
          </p>
        </div>

        <button
          onClick={() => setActiveModalProject({})}
          className="inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 text-xs font-bold text-white shadow-glass hover:bg-moss-800 transition-colors"
        >
          <span>+ Add Product</span>
        </button>
      </div>

      {/* Projects Data Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white/80 shadow-glass">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/60 uppercase tracking-wider text-slate-400 font-bold">
              <tr>
                <th className="px-6 py-4">Title / Slug</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Uptime SLA</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {projects.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-slate-400 font-semibold"
                  >
                    No product rows found in database. Click + Add Product to seed one.
                  </td>
                </tr>
              ) : (
                projects.map((p) => {
                  const uptime =
                    p.metrics?.uptime ||
                    p.metrics?.uptimeSla ||
                    p.infrastructureCapacity?.uptimeSla ||
                    "—";

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-extrabold text-ink text-sm">
                          {p.name || p.title}
                        </div>
                        <div className="font-mono text-[11px] text-slate-400">
                          /{p.slug}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-semibold">
                        {p.category}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold ${
                            p.status === "GA"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : p.status === "Beta"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-emerald-700 font-bold">
                        {uptime}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => setActiveModalProject(p)}
                          className="rounded-xl border border-slate-200 px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          disabled={deletingId === p.id}
                          className="rounded-xl border border-red-200 px-3 py-1.5 font-bold text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          {deletingId === p.id ? "Deleting..." : "Delete"}
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
      {activeModalProject !== null && (
        <ProjectForm
          project={
            Object.keys(activeModalProject).length > 0
              ? activeModalProject
              : null
          }
          onClose={() => setActiveModalProject(null)}
          onSuccess={(msg) => showToast("success", msg)}
          onError={(msg) => showToast("error", msg)}
        />
      )}
    </div>
  );
}
