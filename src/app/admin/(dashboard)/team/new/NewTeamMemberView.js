"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createTeamMember } from "../actions";
import Toast from "@/components/admin/Toast";
import { ArrowLeft, UserPlus, CheckCircle2, ShieldCheck, Tag } from "lucide-react";

export default function NewTeamMemberView({ authUsers = [], interns = [] }) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [employmentType, setEmploymentType] = useState("full_time");
  const [currentCapacity, setCurrentCapacity] = useState(40);
  const [userId, setUserId] = useState("");
  const [linkedInternId, setLinkedInternId] = useState("");
  const [importSkills, setImportSkills] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => setToast({ type, message });

  const selectedIntern = interns.find((i) => i.id === linkedInternId);

  const handleInternChange = (id) => {
    setLinkedInternId(id);
    const found = interns.find((i) => i.id === id);
    if (found) {
      if (!name) setName(found.name);
      if (!role) setRole(found.role || "Engineering Intern");
      setEmploymentType("intern");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !role.trim()) {
      showToast("error", "Please provide team member name and role.");
      return;
    }

    setSubmitting(true);
    const res = await createTeamMember({
      name,
      role,
      employmentType,
      currentCapacity,
      userId: userId || null,
      linkedInternId: linkedInternId || null,
      importSkills,
    });
    setSubmitting(false);

    if (res.success) {
      showToast("success", `Registered '${name}' to Team Registry.`);
      router.push("/admin/team");
      router.refresh();
    } else {
      showToast("error", res.error || "Failed to create team member.");
    }
  };

  return (
    <div className="w-full space-y-6 max-w-3xl">
      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <Link
        href="/admin/team"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-ink transition-colors"
      >
        <ArrowLeft size={16} strokeWidth={2} />
        <span>Back to Team Workload</span>
      </Link>

      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
          Resource Onboarding
        </span>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-ink">
          Add New Team Member
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Register active staff or verified interns to enable algorithmic task delegation and capacity tracking.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-glass space-y-6">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-500">
          Team Member Profile
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kiran Kumar"
              className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-ink focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600">
              Role / Designation *
            </label>
            <input
              type="text"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Senior Full-Stack Engineer"
              className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-ink focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600">
              Employment Type
            </label>
            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
              className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-ink focus:border-emerald-600 focus:outline-none"
            >
              <option value="full_time">Full Time</option>
              <option value="intern">Intern</option>
              <option value="contractor">Contractor</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600">
              Capacity (Hours / Week)
            </label>
            <input
              type="number"
              min="5"
              max="80"
              value={currentCapacity}
              onChange={(e) => setCurrentCapacity(e.target.value)}
              className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-ink focus:border-emerald-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Linking Options */}
        <div className="border-t border-slate-100 pt-6 space-y-4">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-500">
            Account &amp; Talent Registry Links (Optional)
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600">
                Link to Auth User Account (Email)
              </label>
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-ink focus:border-emerald-600 focus:outline-none"
              >
                <option value="">-- No linked auth account --</option>
                {authUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.email} ({u.id.slice(0, 8)}...)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600">
                Link to Verified Intern Profile
              </label>
              <select
                value={linkedInternId}
                onChange={(e) => handleInternChange(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-ink focus:border-emerald-600 focus:outline-none"
              >
                <option value="">-- No linked intern profile --</option>
                {interns.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} — {i.role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Skill Tag Import Auto-Suggestion Prompt */}
          {selectedIntern && selectedIntern.skills && selectedIntern.skills.length > 0 && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-emerald-900">
                <input
                  type="checkbox"
                  checked={importSkills}
                  onChange={(e) => setImportSkills(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>
                  Import {selectedIntern.name}&apos;s verified skill tags as starter team skills
                </span>
              </label>

              <div className="flex flex-wrap gap-1.5 pt-1 pl-6">
                {selectedIntern.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200"
                  >
                    <Tag size={10} />
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-bold text-white shadow-glass hover:bg-moss-800 transition-colors disabled:opacity-50"
          >
            <UserPlus size={18} strokeWidth={2} />
            <span>{submitting ? "Registering..." : "Register Team Member →"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
