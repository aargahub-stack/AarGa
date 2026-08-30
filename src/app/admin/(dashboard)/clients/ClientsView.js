"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Plus, ArrowRight, Layers, ExternalLink, Trash2 } from "lucide-react";
import { deleteClientAction } from "./actions";
import DeleteConfirmationModal from "@/components/admin/DeleteConfirmationModal";
import Toast from "@/components/admin/Toast";

export default function ClientsView({ clients }) {
  const [deletingClient, setDeletingClient] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => setToast({ type, message });

  const handleDeleteClient = async () => {
    if (!deletingClient) return;

    setDeleteLoading(true);
    setDeleteError("");

    const res = await deleteClientAction(deletingClient.id);
    setDeleteLoading(false);

    if (res.success) {
      showToast("success", `Client '${deletingClient.org_name || deletingClient.name}' deleted.`);
      setDeletingClient(null);
      window.location.reload();
    } else {
      setDeleteError(res.error || "Failed to delete client.");
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Delete Client Modal */}
      {deletingClient && (
        <DeleteConfirmationModal
          isOpen={Boolean(deletingClient)}
          onClose={() => {
            setDeletingClient(null);
            setDeleteError("");
          }}
          onConfirm={handleDeleteClient}
          title="Delete Client Record"
          description={`Are you sure you want to delete ${deletingClient.org_name || deletingClient.name}? This client must have zero active/on_hold projects.`}
          confirmMatchText={deletingClient.org_name || deletingClient.name}
          confirmButtonText="Delete Client Record"
          loading={deleteLoading}
          errorMessage={deleteError}
        />
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            Client Lifecycle &amp; SOP Engine
          </span>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-ink">
            Client Organizations &amp; Onboarding
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Register new clients and spawn SOP-driven phase execution roadmaps.
          </p>
        </div>

        <Link
          href="/admin/clients/new"
          className="inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 text-xs font-bold text-white shadow-glass hover:bg-moss-800 transition-colors"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Register New Client</span>
        </Link>
      </div>

      {/* Clients & Projects Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white/80 shadow-glass">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/60 uppercase tracking-wider text-slate-400 font-bold">
              <tr>
                <th className="px-6 py-4">Organization / Contact</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Active Engagements (Manage Roadmap)</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {clients.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-slate-400 font-semibold"
                  >
                    No client organizations registered yet. Click &quot;+ Register New Client&quot; to begin.
                  </td>
                </tr>
              ) : (
                clients.map((c) => {
                  const projects = c.client_projects || [];

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink font-bold text-white">
                            <Building2 size={18} strokeWidth={2} />
                          </div>
                          <div>
                            <div className="font-extrabold text-ink text-sm">
                              {c.org_name || c.name}
                            </div>
                            <div className="text-[11px] text-slate-500 font-semibold">
                              Primary Contact: {c.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-600">
                        {c.contact_email}
                      </td>
                      <td className="px-6 py-4">
                        {projects.length === 0 ? (
                          <span className="inline-block rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">
                            No Active Projects
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {projects.map((p) => (
                              <Link
                                key={p.id}
                                href={`/admin/clients/${c.id}/projects/${p.id}`}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-extrabold text-slate-800 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-900 transition-colors shadow-sm"
                                title="Open Live Phase Control Panel & Task Allotment"
                              >
                                <span className="uppercase">{p.project_type.replace(/_/g, " ")}</span>
                                <span className={`rounded-full px-2 py-0.5 text-[9px] font-black border flex items-center gap-1 ${
                                  p.status === "completed"
                                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                    : p.status === "cancelled"
                                    ? "bg-slate-200 text-slate-700 border-slate-300"
                                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                }`}>
                                  {p.status} <ExternalLink size={10} />
                                </span>
                              </Link>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/clients/${c.id}/onboard`}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                          >
                            <Layers size={14} strokeWidth={2} />
                            <span>Onboard New Project</span>
                            <ArrowRight size={14} strokeWidth={2} />
                          </Link>

                          <button
                            type="button"
                            onClick={() => {
                              setDeletingClient(c);
                              setDeleteError("");
                            }}
                            title="Delete Client Record"
                            className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100 hover:border-red-300 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
