"use client";

import { useState } from "react";
import { updateTeamMemberSkills } from "./actions";
import { X, Plus, Trash2, ShieldCheck, Tag, Save } from "lucide-react";

export default function EditSkillsModal({ teamMember, availableSkills = [], onClose, onSaved }) {
  const initialSkills = (teamMember.team_member_skills || []).map((tms) => ({
    name: tms.skills?.name || "",
    proficiencyLevel: tms.proficiency_level || 3,
    verified: Boolean(tms.verified),
  }));

  const [skillsList, setSkillsList] = useState(initialSkills);
  const [newSkillName, setNewSkillName] = useState("");
  const [newProficiency, setNewProficiency] = useState(3);
  const [newVerified, setNewVerified] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleAddSkill = () => {
    const trimmed = newSkillName.trim();
    if (!trimmed) return;

    if (skillsList.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMsg(`Skill '${trimmed}' is already in list.`);
      return;
    }

    setSkillsList((prev) => [
      ...prev,
      {
        name: trimmed,
        proficiencyLevel: Number(newProficiency) || 3,
        verified: Boolean(newVerified),
      },
    ]);

    setNewSkillName("");
    setErrorMsg("");
  };

  const handleRemoveSkill = (idxToRemove) => {
    setSkillsList((prev) => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const handleUpdateItem = (idx, field, value) => {
    setSkillsList((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    const res = await updateTeamMemberSkills(teamMember.id, skillsList);
    setSubmitting(false);

    if (res.success) {
      if (onSaved) onSaved();
      onClose();
    } else {
      setErrorMsg(res.error || "Failed to update skills.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-glass space-y-6 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800 border border-emerald-200">
              Matching Engine Credentials
            </span>
            <h2 className="mt-2 text-xl font-black tracking-tight text-ink">
              Edit Skills for {teamMember.name}
            </h2>
            <p className="text-xs text-slate-500">
              Add or adjust verified skill levels used by the SOP delegation engine.
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
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
            {errorMsg}
          </div>
        )}

        {/* Existing Skills List */}
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
            Credentialed Skills ({skillsList.length})
          </h3>

          {skillsList.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400 font-semibold">
              No skill tags linked yet. Add a skill tag below.
            </div>
          ) : (
            <div className="space-y-2">
              {skillsList.map((skill, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Tag size={14} className="text-emerald-600" />
                    <span className="font-extrabold text-ink">{skill.name}</span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold uppercase text-slate-500">
                        Level:
                      </span>
                      <select
                        value={skill.proficiencyLevel}
                        onChange={(e) =>
                          handleUpdateItem(idx, "proficiencyLevel", e.target.value)
                        }
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-ink"
                      >
                        <option value="1">L1 - Basic</option>
                        <option value="2">L2 - Intermediate</option>
                        <option value="3">L3 - Proficient</option>
                        <option value="4">L4 - Advanced</option>
                        <option value="5">L5 - Master</option>
                      </select>
                    </div>

                    <label className="flex items-center gap-1 cursor-pointer text-xs font-semibold text-emerald-800">
                      <input
                        type="checkbox"
                        checked={skill.verified}
                        onChange={(e) =>
                          handleUpdateItem(idx, "verified", e.target.checked)
                        }
                        className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      Verified
                    </label>

                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(idx)}
                      className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add New Skill Section */}
        <div className="border-t border-slate-100 pt-4 space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
            Add New Skill Tag
          </h3>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="text"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="Skill tag name (e.g. React / Next.js)"
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-ink focus:border-emerald-600 focus:outline-none"
            />

            <select
              value={newProficiency}
              onChange={(e) => setNewProficiency(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-ink"
            >
              <option value="1">L1 - Basic</option>
              <option value="2">L2 - Intermediate</option>
              <option value="3">L3 - Proficient</option>
              <option value="4">L4 - Advanced</option>
              <option value="5">L5 - Master</option>
            </select>

            <button
              type="button"
              onClick={handleAddSkill}
              className="inline-flex items-center gap-1 rounded-xl bg-emerald-100 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-200 shrink-0"
            >
              <Plus size={14} />
              <span>Add Tag</span>
            </button>
          </div>
        </div>

        {/* Save Footer */}
        <div className="border-t border-slate-100 pt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-moss-800 disabled:opacity-50"
          >
            <Save size={15} />
            <span>{submitting ? "Saving..." : "Save Credentialed Skills"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
