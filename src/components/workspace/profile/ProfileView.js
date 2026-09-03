"use client";

import { useState } from "react";
import { User, Mail, Phone, ShieldCheck, Tag, Save, Loader2, CheckCircle2, Award, Calendar } from "lucide-react";
import { updateProfileAction } from "@/app/workspace/(dashboard)/dashboardActions";

export default function ProfileView({ teamMember }) {
  const [phone, setPhone] = useState(teamMember.phone || "");
  const [bio, setBio] = useState(teamMember.bio || "");
  const [skillTagsStr, setSkillTagsStr] = useState(
    Array.isArray(teamMember.skill_tags) ? teamMember.skill_tags.join(", ") : ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const isIntern = teamMember.role?.toLowerCase().includes("intern");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);
    setSaveSuccess(false);

    const skillTags = skillTagsStr
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const res = await updateProfileAction({
      phone,
      bio,
      skill_tags: skillTags,
    });

    setIsSaving(false);

    if (res.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      setErrorMsg(res.error || "Failed to update profile.");
    }
  };

  return (
    <div className="max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-8 font-['Space_Grotesk'] text-ink">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border-2 border-emerald-400/40 text-emerald-400 text-2xl font-black">
            {teamMember.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">{teamMember.name}</h1>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                  isIntern
                    ? "bg-amber-500/20 border border-amber-400/40 text-amber-300"
                    : "bg-emerald-500/20 border border-emerald-400/40 text-emerald-300"
                }`}
              >
                {isIntern ? "INTERN" : "FULL-TIME EMPLOYEE"}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">{teamMember.role}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl">
          <ShieldCheck size={16} className="text-emerald-400" />
          <span>AarGa Workspace Verified</span>
        </div>
      </div>

      {/* Profile Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-black text-ink mb-6 pb-3 border-b border-slate-100 flex items-center gap-2">
          <User size={18} className="text-emerald-600" /> Personal &amp; Professional Details
        </h2>

        {errorMsg && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-800 mb-6">
            {errorMsg}
          </div>
        )}

        {saveSuccess && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 mb-6 flex items-center gap-2">
            <CheckCircle2 size={16} /> Profile details updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Full Name (Read only) */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Full Name
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-ink">
                <User size={15} className="text-slate-400 shrink-0" />
                <span>{teamMember.name}</span>
              </div>
            </div>

            {/* Email (Read only) */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Workspace Email
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-ink">
                <Mail size={15} className="text-slate-400 shrink-0" />
                <span>{teamMember.user_id ? `${teamMember.name?.toLowerCase().replace(/\s+/g, ".")}@aarga.org` : "employee@aarga.org"}</span>
              </div>
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Contact Phone
              </label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 py-2.5 text-xs font-bold text-ink focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Designated Role */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Designated Position
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-ink">
                <Award size={15} className="text-emerald-600 shrink-0" />
                <span>{teamMember.role}</span>
              </div>
            </div>
          </div>

          {/* Skill Tags */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Skill &amp; Capability Tags (Comma Separated)
            </label>
            <div className="relative">
              <Tag size={15} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={skillTagsStr}
                onChange={(e) => setSkillTagsStr(e.target.value)}
                placeholder="Next.js, Supabase, Tailwind, React Flow, Node.js"
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 py-2.5 text-xs font-bold text-ink focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Bio / Work Summary */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Professional Bio &amp; Focus Area
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Full-stack engineer focusing on high-performance web architecture, workflow automation, and UI system design..."
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-semibold text-ink focus:border-emerald-600 focus:outline-none"
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-6 py-2.5 text-xs font-bold text-white transition-colors shadow-sm disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span>{isSaving ? "Saving Changes..." : "Save Profile Updates"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
