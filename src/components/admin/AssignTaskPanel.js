"use client";

import { useState, useEffect } from "react";
import {
  getSuggestionsAction,
  getAllTeamMembersAction,
  assignTaskAction,
} from "@/app/admin/(dashboard)/clients/[clientId]/projects/[projectId]/actions";
import { UserCheck, Sparkles, ChevronDown, ChevronUp, User, X } from "lucide-react";

export default function AssignTaskPanel({ task, onClose, onAssigned }) {
  const [suggestions, setSuggestions] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [showAllMembers, setShowAllMembers] = useState(false);
  const [assigningId, setAssigningId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoadingSuggestions(true);
      try {
        const [suggested, members] = await Promise.all([
          getSuggestionsAction(task.id),
          getAllTeamMembersAction(),
        ]);
        setSuggestions(suggested || []);
        setAllMembers(members || []);
      } catch (err) {
        setErrorMsg(err.message || "Failed to load matching suggestions.");
      } finally {
        setLoadingSuggestions(false);
      }
    }
    loadData();
  }, [task.id]);

  const handleConfirmAssignment = async (memberId, method) => {
    setAssigningId(memberId);
    setErrorMsg("");

    const res = await assignTaskAction(task.id, memberId, method);
    setAssigningId(null);

    if (res.success) {
      if (onAssigned) onAssigned();
      onClose();
    } else {
      setErrorMsg(res.error || "Failed to assign task.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-glass space-y-6 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Panel Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800 border border-emerald-200">
                Delegation Matching Engine
              </span>
              {task.required_skill_tags?.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="mt-2 text-xl font-black tracking-tight text-ink">
              Assign Task: {task.title}
            </h2>
            <p className="text-xs text-slate-500">
              Select a suggested candidate or manually override assignment.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 p-2 text-slate-400 hover:bg-slate-100 hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
            {errorMsg}
          </div>
        )}

        {/* Section 1: Algorithmic Top 3 Suggestions */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-emerald-600" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
              Top Ranked Candidates (Weighted Skill Match)
            </h3>
          </div>

          {loadingSuggestions ? (
            <div className="rounded-2xl border border-slate-200 p-6 text-center text-xs text-slate-400 font-semibold animate-pulse">
              Evaluating skill overlap and workload capacity...
            </div>
          ) : suggestions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
              No top candidates with direct skill tag overlap. Expand &quot;Assign someone else&quot; below to manually delegate.
            </div>
          ) : (
            <div className="space-y-3">
              {suggestions.map((item, idx) => {
                const c = item.candidate;
                const isAssigning = assigningId === c.id;

                return (
                  <div
                    key={c.id}
                    className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3 shadow-sm hover:border-emerald-400 transition-colors"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 font-black text-xs text-white">
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="font-extrabold text-ink text-sm flex items-center gap-2">
                            {c.name}
                            <span className="text-[10px] font-semibold text-slate-500">
                              ({c.role})
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-emerald-800 font-bold">
                            Match Score: +{item.score} pts · Active Tasks: {c.activeTasksCount}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleConfirmAssignment(c.id, "auto_confirmed")}
                        disabled={isAssigning}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2 text-xs font-bold text-white shadow-glass hover:bg-moss-800 transition-colors disabled:opacity-50 shrink-0"
                      >
                        <UserCheck size={15} />
                        <span>{isAssigning ? "Assigning..." : "Confirm Assignment"}</span>
                      </button>
                    </div>

                    {/* Breakdown Reasons */}
                    <div className="rounded-xl border border-emerald-200/60 bg-white p-3 text-[11px] space-y-1">
                      <div className="font-bold text-[10px] uppercase tracking-wider text-slate-400">
                        Algorithm Score Breakdown
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-600 font-mono">
                        {item.reasons.map((r, rIdx) => (
                          <span key={rIdx}>• {r}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 2: Expandable All Team Members Section */}
        <div className="border-t border-slate-100 pt-4 space-y-3">
          <button
            onClick={() => setShowAllMembers((v) => !v)}
            className="flex items-center justify-between w-full text-xs font-bold text-slate-600 hover:text-ink transition-colors"
          >
            <span className="flex items-center gap-2">
              <User size={16} />
              <span>Assign someone else (Full Team Registry - Manual Override)</span>
            </span>
            {showAllMembers ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showAllMembers && (
            <div className="space-y-2 pt-2">
              {allMembers.map((member) => {
                const isAssigning = assigningId === member.id;
                const activeTasksCount = (member.sop_tasks || []).filter(
                  (t) => t.status !== "completed"
                ).length;

                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-ink">{member.name}</div>
                      <div className="text-[11px] text-slate-500 font-semibold">
                        {member.role} · Active Tasks: {activeTasksCount}
                      </div>
                    </div>

                    <button
                      onClick={() => handleConfirmAssignment(member.id, "manual_override")}
                      disabled={isAssigning}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
                    >
                      {isAssigning ? "Assigning..." : "Manual Assign"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
