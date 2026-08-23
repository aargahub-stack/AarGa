"use client";

import Link from "next/link";
import { Building2, Plus, ArrowRight, Layers } from "lucide-react";

export default function ClientsView({ clients }) {
  return (
    <div className="space-y-6">
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
                <th className="px-6 py-4">Active Engagements</th>
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
                          <div className="space-y-1">
                            {projects.map((p) => (
                              <div
                                key={p.id}
                                className="flex items-center gap-2 text-[11px]"
                              >
                                <span className="font-bold text-ink uppercase">
                                  {p.project_type}
                                </span>
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
                                  {p.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/clients/${c.id}/onboard`}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                        >
                          <Layers size={14} strokeWidth={2} />
                          <span>Onboard New Project</span>
                          <ArrowRight size={14} strokeWidth={2} />
                        </Link>
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
