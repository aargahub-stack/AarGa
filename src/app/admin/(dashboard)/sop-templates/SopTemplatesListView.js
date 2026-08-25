"use client";

import { useState } from "react";
import Link from "next/link";
import { deleteTemplate, duplicateTemplate } from "./actions";
import Toast from "@/components/admin/Toast";
import {
  ListTree,
  Plus,
  Copy,
  Edit,
  Trash2,
  Layers,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function SopTemplatesListView({ templates }) {
  const [loadingId, setLoadingId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => setToast({ type, message });

  const handleDuplicate = async (tmpl) => {
    setLoadingId(tmpl.id);
    const res = await duplicateTemplate(tmpl.id);
    setLoadingId(null);

    if (res.success) {
      showToast("success", `Duplicated '${tmpl.name}' as v${res.version || "new"}`);
    } else {
      showToast("error", res.error || "Failed to duplicate template.");
    }
  };

  const handleDelete = async (tmpl) => {
    if (!confirm(`Are you sure you want to delete template '${tmpl.name}'?`)) return;

    setLoadingId(tmpl.id);
    const res = await deleteTemplate(tmpl.id);
    setLoadingId(null);

    if (res.success) {
      showToast("success", `Template '${tmpl.name}' deleted.`);
    } else {
      showToast("error", res.error);
    }
  };

  // Group templates by project_type
  const grouped = {
    web_application: [],
    mobile_application: [],
    ai_integration_service: [],
    custom_solution: [],
  };

  (templates || []).forEach((t) => {
    if (grouped[t.project_type]) {
      grouped[t.project_type].push(t);
    } else {
      grouped[t.project_type] = [t];
    }
  });

  const getTypeName = (type) => {
    switch (type) {
      case "web_application":
        return "Web Application Blueprints";
      case "mobile_application":
        return "Mobile Application Blueprints";
      case "ai_integration_service":
        return "AI Integration Service Blueprints";
      case "custom_solution":
        return "Custom Solution Blueprints";
      default:
        return type;
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            SOP Blueprint Governance
          </span>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-ink">
            SOP Template Builder &amp; Blueprints
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Create, version, and edit the master execution roadmaps used by client project onboarding.
          </p>
        </div>

        <Link
          href="/admin/sop-templates/new"
          className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-xs font-bold text-white shadow-glass hover:bg-moss-800 transition-colors shrink-0"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>New SOP Template</span>
        </Link>
      </div>

      {/* Grouped Templates Grid */}
      <div className="space-y-8">
        {Object.entries(grouped).map(([typeKey, typeTemplates]) => (
          <div key={typeKey} className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
              <ListTree size={18} className="text-emerald-600" />
              <h2 className="text-sm font-black uppercase tracking-wider text-ink">
                {getTypeName(typeKey)} ({typeTemplates.length})
              </h2>
            </div>

            {typeTemplates.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white/50 p-6 text-center text-xs text-slate-400 font-semibold">
                No active blueprint configured for {typeKey}. Click &quot;New SOP Template&quot; to build one.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {typeTemplates.map((tmpl) => {
                  const phaseCount = tmpl.sop_template_phases?.length || 0;
                  const taskCount = (tmpl.sop_template_phases || []).reduce(
                    (acc, p) => acc + (p.sop_template_tasks?.length || 0),
                    0
                  );

                  return (
                    <div
                      key={tmpl.id}
                      className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-glass hover:shadow-md transition-shadow"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                            Version {tmpl.version}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                              tmpl.is_active
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {tmpl.is_active ? (
                              <>
                                <CheckCircle2 size={12} /> Active
                              </>
                            ) : (
                              <>
                                <XCircle size={12} /> Deactivated
                              </>
                            )}
                          </span>
                        </div>

                        <h3 className="text-base font-extrabold text-ink leading-tight">
                          {tmpl.name}
                        </h3>

                        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 pt-2 border-t border-slate-100">
                          <span className="flex items-center gap-1">
                            <Layers size={14} className="text-emerald-600" />
                            {phaseCount} {phaseCount === 1 ? "Phase" : "Phases"}
                          </span>
                          <span>·</span>
                          <span>{taskCount} Total Tasks</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/sop-templates/${tmpl.id}/edit`}
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Edit size={14} />
                            <span>Edit</span>
                          </Link>

                          <button
                            onClick={() => handleDuplicate(tmpl)}
                            disabled={loadingId === tmpl.id}
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                          >
                            <Copy size={14} />
                            <span>Duplicate</span>
                          </button>
                        </div>

                        <button
                          onClick={() => handleDelete(tmpl)}
                          disabled={loadingId === tmpl.id}
                          className="rounded-xl p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-700 transition-colors disabled:opacity-50"
                          title="Delete Template"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
