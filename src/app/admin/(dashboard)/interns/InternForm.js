"use client";

import { useState, useEffect } from "react";
import { createInternAction, updateInternAction } from "./actions";

export default function InternForm({ intern, onClose, onSuccess, onError }) {
  const isEditing = Boolean(intern?.id);

  const [name, setName] = useState(intern?.name || "");
  const [profileSlug, setProfileSlug] = useState(intern?.profileSlug || intern?.profile_slug || "");
  const [role, setRole] = useState(intern?.role || "");
  const [cohortLabel, setCohortLabel] = useState(intern?.cohortLabel || intern?.cohort_label || "");
  const [cohortDate, setCohortDate] = useState(intern?.cohortDate || intern?.cohort_date || "");
  const [location, setLocation] = useState(intern?.location || "");
  const [avatarInitials, setAvatarInitials] = useState(intern?.avatarInitials || intern?.avatar_initials || "");
  const [telemetryScore, setTelemetryScore] = useState(intern?.telemetryScore ?? intern?.telemetry_score ?? 85);
  const [verifiedStatus, setVerifiedStatus] = useState(intern?.verifiedStatus || intern?.verified_status || "Verified");
  const [skills, setSkills] = useState(Array.isArray(intern?.skills) ? intern.skills.join(", ") : "");
  const [collegeInfo, setCollegeInfo] = useState(intern?.collegeInfo || intern?.college_info || "");
  const [projectsShipped, setProjectsShipped] = useState(intern?.projectsShipped ?? intern?.projects_shipped ?? 1);
  const [blurb, setBlurb] = useState(intern?.blurb || "");

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEditing && name) {
      const generated = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setProfileSlug(generated);
    }
  }, [name, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("profile_slug", profileSlug);
    formData.append("role", role);
    formData.append("cohort_label", cohortLabel);
    formData.append("cohort_date", cohortDate);
    formData.append("location", location);
    formData.append("avatar_initials", avatarInitials);
    formData.append("telemetry_score", String(telemetryScore));
    formData.append("verified_status", verifiedStatus);
    formData.append("skills", skills);
    formData.append("college_info", collegeInfo);
    formData.append("projects_shipped", String(projectsShipped));
    formData.append("blurb", blurb);

    let res;
    if (isEditing) {
      res = await updateInternAction(intern.id, formData);
    } else {
      res = await createInternAction(formData);
    }

    setSubmitting(false);

    if (res.success) {
      onSuccess?.(
        isEditing
          ? `Intern '${name}' updated successfully.`
          : `Intern '${name}' added successfully.`
      );
      onClose?.();
    } else {
      onError?.(res.error || "Failed to save candidate record.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-glass my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-moss-700">
              {isEditing ? "Edit Candidate Record" : "Register Verified Candidate"}
            </span>
            <h3 className="text-xl font-black text-ink">
              {isEditing ? `Edit ${intern.name}` : "Add Candidate to VeriSkill Engine"}
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
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ananya Rao"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-600 uppercase tracking-wider">
                Profile Slug *
              </label>
              <input
                type="text"
                required
                value={profileSlug}
                onChange={(e) => setProfileSlug(e.target.value)}
                placeholder="e.g. ananya-rao"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-mono text-ink focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block font-bold text-slate-600 uppercase tracking-wider">
                Role *
              </label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Backend Engineering Intern"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-600 uppercase tracking-wider">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Kozhikode, IN"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block font-bold text-slate-600 uppercase tracking-wider">
                Cohort Label
              </label>
              <input
                type="text"
                value={cohortLabel}
                onChange={(e) => setCohortLabel(e.target.value)}
                placeholder="Cohort 7 — Payments Infra"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-ink focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-600 uppercase tracking-wider">
                Cohort Date
              </label>
              <input
                type="date"
                value={cohortDate}
                onChange={(e) => setCohortDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-ink focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-600 uppercase tracking-wider">
                Avatar Initials
              </label>
              <input
                type="text"
                maxLength={3}
                value={avatarInitials}
                onChange={(e) => setAvatarInitials(e.target.value)}
                placeholder="AR"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-mono uppercase text-ink focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block font-bold text-slate-600 uppercase tracking-wider">
                Telemetry Score (0-100)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={telemetryScore}
                onChange={(e) => setTelemetryScore(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-mono text-ink focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-600 uppercase tracking-wider">
                Verified Status
              </label>
              <select
                value={verifiedStatus}
                onChange={(e) => setVerifiedStatus(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-ink focus:border-emerald-600 focus:outline-none"
              >
                <option value="Verified">Verified</option>
                <option value="In Review">In Review</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-600 uppercase tracking-wider">
                Projects Shipped
              </label>
              <input
                type="number"
                min={0}
                value={projectsShipped}
                onChange={(e) => setProjectsShipped(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-mono text-ink focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-600 uppercase tracking-wider">
              College &amp; Degree Info
            </label>
            <input
              type="text"
              value={collegeInfo}
              onChange={(e) => setCollegeInfo(e.target.value)}
              placeholder="NIT Calicut — B.Tech Computer Science"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-600 uppercase tracking-wider">
              Skills (Comma Separated)
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Node.js, PostgreSQL, System Design, Ledger Modeling"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-600 uppercase tracking-wider">
              Blurb / Shipped Project Summary
            </label>
            <textarea
              rows={3}
              value={blurb}
              onChange={(e) => setBlurb(e.target.value)}
              placeholder="Shipped the reconciliation engine improvements live in PayCircle..."
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink focus:border-emerald-600 focus:outline-none"
            />
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
              {submitting ? "Saving..." : isEditing ? "Update Candidate" : "Register Candidate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
