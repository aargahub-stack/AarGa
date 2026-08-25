"use client";

import { useState } from "react";
import Link from "next/link";
import EditSkillsModal from "./EditSkillsModal";
import { ShieldCheck, Plus, UserPlus, Edit3 } from "lucide-react";

export default function TeamWorkloadView({ teamMembers }) {
  const [editingMemberForSkills, setEditingMemberForSkills] = useState(null);

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            Capacity &amp; Resource Allocation
          </span>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-ink">
            Team Workload &amp; Capacity Dashboard
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Monitor real-time task allocations and capacity utilization before manual delegation.
          </p>
        </div>

        <Link
          href="/admin/team/new"
          className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-xs font-bold text-white shadow-glass hover:bg-moss-800 transition-colors shrink-0"
        >
          <UserPlus size={16} strokeWidth={2.5} />
          <span>+ Add Team Member</span>
        </Link>
      </div>

      {/* Team Member Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teamMembers.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-400 font-semibold space-y-4">
            <p>No active team members registered in the system.</p>
            <Link
              href="/admin/team/new"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
            >
              <UserPlus size={16} />
              <span>Register First Team Member</span>
            </Link>
          </div>
        ) : (
          teamMembers.map((member) => {
            const activeTasks = (member.sop_tasks || []).filter(
              (t) => t.status !== "completed"
            );
            const activeTasksCount = activeTasks.length;

            const totalAssignedHours = activeTasks.reduce(
              (acc, t) => acc + (Number(t.estimated_hours) || 4.0),
              0
            );

            const capacity = Number(member.current_capacity_hours_per_week) || 40.0;
            const workloadPct = Math.min(100, Math.round((totalAssignedHours / capacity) * 100));

            const isOverloaded = workloadPct >= 90;
            const isHigh = workloadPct >= 70 && workloadPct < 90;

            const memberSkills = member.team_member_skills || [];

            return (
              <div
                key={member.id}
                className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-glass space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-extrabold text-ink">{member.name}</h3>
                      <p className="text-xs font-semibold text-slate-500">{member.role}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-slate-700">
                      {member.employment_type}
                    </span>
                  </div>

                  {/* Workload Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-600">Assigned Load</span>
                      <span className="font-mono font-extrabold text-ink">
                        {totalAssignedHours} hrs / {capacity} hrs ({workloadPct}%)
                      </span>
                    </div>

                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full transition-all ${
                          isOverloaded
                            ? "bg-red-500"
                            : isHigh
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${workloadPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Active Tasks Breakdown */}
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3 text-xs space-y-1">
                    <div className="font-bold text-[10px] uppercase text-slate-400">
                      Active SOP Tasks ({activeTasksCount})
                    </div>
                    {activeTasks.length === 0 ? (
                      <div className="text-slate-400 font-semibold">0 active tasks — full capacity</div>
                    ) : (
                      <div className="space-y-1 pt-1">
                        {activeTasks.map((t) => (
                          <div key={t.id} className="flex items-center justify-between font-medium text-slate-700">
                            <span className="truncate max-w-[180px]">{t.title}</span>
                            <span className="font-mono text-[10px] font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              {t.estimated_hours || 4}h
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Skills Graph Badges & Edit Button */}
                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="block text-[10px] font-extrabold uppercase text-slate-400">
                      Credentialed Skills ({memberSkills.length})
                    </span>
                    <button
                      onClick={() => setEditingMemberForSkills(member)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                      <Edit3 size={12} />
                      <span>Edit Skills</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {memberSkills.length === 0 ? (
                      <span className="text-[11px] text-slate-400">No skill tags linked yet</span>
                    ) : (
                      memberSkills.map((ms) => (
                        <span
                          key={ms.id}
                          className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200"
                        >
                          {ms.skills?.name} (L{ms.proficiency_level})
                          {ms.verified && <ShieldCheck size={10} className="text-emerald-600" />}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal for editing skills */}
      {editingMemberForSkills && (
        <EditSkillsModal
          teamMember={editingMemberForSkills}
          onClose={() => setEditingMemberForSkills(null)}
          onSaved={() => {
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
