"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ExternalLink, GitFork, Clock, Search, Workflow, Loader2 } from "lucide-react";
import { deleteFlowchart } from "@/app/workspace/(dashboard)/flowchart/actions";

export default function FlowchartList({ flowcharts: initialFlowcharts, teamMember }) {
  const router = useRouter();
  const [flowcharts, setFlowcharts] = useState(initialFlowcharts || []);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  const filtered = flowcharts.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete(id, title) {
    const confirmed = window.confirm(`Are you sure you want to delete "${title}"?`);
    if (!confirmed) return;

    setDeletingId(id);
    setDeleteError(null);

    const res = await deleteFlowchart(id);
    setDeletingId(null);

    if (res.success) {
      setFlowcharts((prev) => prev.filter((item) => item.id !== id));
      router.refresh();
    } else {
      setDeleteError(res.error || "Failed to delete flowchart.");
    }
  }

  return (
    <div className="max-w-6xl w-full mx-auto p-6 sm:p-8 space-y-8 font-['Space_Grotesk'] text-ink">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-widest mb-1">
            <Workflow size={16} /> AarGa Flowchart Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-ink">
            Workspace Flowcharts
          </h1>
          <p className="text-sm font-semibold text-slate-500 mt-1">
            Design, persist, and export custom architecture & process diagrams.
          </p>
        </div>

        <Link
          href="/workspace/flowchart?new=true"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 text-xs font-extrabold text-white transition-all shadow-sm shrink-0"
        >
          <Plus size={18} strokeWidth={2.5} /> New Flowchart
        </Link>
      </div>

      {deleteError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-800">
          {deleteError}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all">
        <Search size={18} className="text-slate-400 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search saved flowcharts by title..."
          className="w-full bg-transparent text-sm font-semibold text-ink placeholder:text-slate-400 outline-none"
        />
      </div>

      {/* Grid View */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <GitFork size={40} className="mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-extrabold text-ink">No flowcharts found</h3>
          <p className="text-xs font-medium text-slate-500 mt-1 max-w-md mx-auto">
            {search
              ? "No saved flowcharts match your search query."
              : "You haven't saved any flowcharts yet. Create a new diagram to get started."}
          </p>
          <Link
            href="/workspace/flowchart?new=true"
            className="inline-flex items-center gap-2 mt-6 rounded-xl bg-ink hover:bg-moss-800 px-4 py-2.5 text-xs font-bold text-white transition-colors shadow-sm"
          >
            <Plus size={14} /> Create First Flowchart
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((chart) => {
            const nodeCount = Array.isArray(chart.nodes) ? chart.nodes.length : 0;
            const edgeCount = Array.isArray(chart.edges) ? chart.edges.length : 0;
            const updatedDate = new Date(chart.updated_at).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={chart.id}
                className="group relative rounded-2xl border border-slate-200 bg-white hover:border-emerald-500 hover:shadow-md transition-all p-5 flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-extrabold text-base text-ink group-hover:text-emerald-700 transition-colors line-clamp-1">
                      {chart.title || "Untitled Flowchart"}
                    </h3>
                    <button
                      onClick={() => handleDelete(chart.id, chart.title)}
                      disabled={deletingId === chart.id}
                      className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors shrink-0 disabled:opacity-40"
                      title="Delete flowchart"
                    >
                      {deletingId === chart.id ? (
                        <Loader2 size={16} className="animate-spin text-red-600" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-xs mb-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
                      {nodeCount} Nodes
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700">
                      {edgeCount} Connections
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
                  <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                    <Clock size={12} />
                    <span suppressHydrationWarning>{updatedDate}</span>
                  </div>

                  <Link
                    href={`/workspace/flowchart?id=${chart.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white transition-all shadow-sm"
                  >
                    Open Canvas <ExternalLink size={13} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
