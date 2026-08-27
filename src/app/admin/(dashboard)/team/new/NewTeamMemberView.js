"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createTeamMember } from "../actions";
import Toast from "@/components/admin/Toast";
import { ArrowLeft, UserPlus, CheckCircle2, Tag, Copy, Sparkles, Check, Mail } from "lucide-react";

export default function NewTeamMemberView({ authUsers = [], interns = [] }) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [employmentType, setEmploymentType] = useState("full_time");
  const [currentCapacity, setCurrentCapacity] = useState(40);
  const [dobYear, setDobYear] = useState(2006);
  const [autoCreateAccount, setAutoCreateAccount] = useState(true);
  const [userId, setUserId] = useState("");
  const [linkedInternId, setLinkedInternId] = useState("");
  const [importSkills, setImportSkills] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => setToast({ type, message });

  const selectedIntern = interns.find((i) => i.id === linkedInternId);

  // Compute live preview of username from email handle before @
  let previewHandle = "";
  if (email && email.includes("@")) {
    previewHandle = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
  } else {
    previewHandle = (name || "user").toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  const first4 = (previewHandle.slice(0, 4) || "user").padEnd(4, "x");
  const previewPrefix = employmentType === "intern" ? "int@" : "emp@";
  const previewPassword = `${previewPrefix}${first4}#${dobYear || 2006}`;
  const previewEmail = email || `${previewHandle}@aarga.com`;

  const handleInternChange = (id) => {
    setLinkedInternId(id);
    const found = interns.find((i) => i.id === id);
    if (found) {
      if (!name) setName(found.name);
      if (!role) setRole(found.role || "Engineering Intern");
      if (!email) setEmail(`${found.profile_slug || found.name.toLowerCase().replace(/[^a-z0-9]/g, "")}@aarga.com`);
      setEmploymentType("intern");
    }
  };

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
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
      email,
      employmentType,
      currentCapacity,
      dobYear,
      userId: userId || null,
      linkedInternId: linkedInternId || null,
      autoCreateAccount,
      importSkills,
    });
    setSubmitting(false);

    if (res.success) {
      if (res.credentials) {
        setCreatedCredentials(res.credentials);
        showToast("success", `Registered '${name}' & provisioned Supabase login account!`);
      } else {
        showToast("success", `Registered '${name}' to Team Registry.`);
        router.push("/admin/team");
        router.refresh();
      }
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
          Resource Onboarding &amp; Credentials
        </span>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-ink">
          Add New Team Member
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Register staff or interns with auto-generated login credentials derived from email handle before @.
        </p>
      </div>

      {/* Generated Credentials Success Modal / Banner */}
      {createdCredentials && (
        <div className="rounded-3xl border border-emerald-300 bg-emerald-50/90 p-6 shadow-glass space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={22} className="text-emerald-700 shrink-0" />
              <div>
                <h3 className="text-base font-extrabold text-emerald-950">
                  Account Credentials Generated &amp; Provisioned!
                </h3>
                <p className="text-xs text-emerald-800 font-medium">
                  Share these login credentials with {name} to log in at /workspace/login.
                </p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-200 px-3 py-1 text-[10px] font-black uppercase text-emerald-900 border border-emerald-300">
              Active Login
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-emerald-200 bg-white p-3.5 space-y-1">
              <div className="text-[10px] font-extrabold uppercase text-slate-400">
                Derived Username Handle
              </div>
              <div className="flex items-center justify-between font-mono text-xs font-black text-ink">
                <span>{createdCredentials.username}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(createdCredentials.username, "username")}
                  className="text-emerald-700 hover:text-emerald-900"
                >
                  {copiedField === "username" ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-white p-3.5 space-y-1">
              <div className="text-[10px] font-extrabold uppercase text-slate-400">
                Official Email
              </div>
              <div className="flex items-center justify-between font-mono text-xs font-black text-ink">
                <span className="truncate max-w-[140px]">{createdCredentials.email}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(createdCredentials.email, "email")}
                  className="text-emerald-700 hover:text-emerald-900"
                >
                  {copiedField === "email" ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-white p-3.5 space-y-1">
              <div className="text-[10px] font-extrabold uppercase text-slate-400">
                Default Password
              </div>
              <div className="flex items-center justify-between font-mono text-xs font-black text-emerald-900">
                <span>{createdCredentials.password}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(createdCredentials.password, "password")}
                  className="text-emerald-700 hover:text-emerald-900"
                >
                  {copiedField === "password" ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                router.push("/admin/team");
                router.refresh();
              }}
              className="rounded-full bg-ink px-6 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-moss-800"
            >
              Go to Team Workload Dashboard →
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-glass space-y-6">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-500">
          Team Member Profile &amp; Email Credentials
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
              placeholder="e.g. Yuvarani or Aravindh"
              className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-ink focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600">
              Official Email Address * (Username is derived from handle before @)
            </label>
            <div className="relative mt-1.5">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. yuvarani@gmail.com or aravindh@aarga.com"
                className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-xs font-bold text-ink focus:border-emerald-600 focus:outline-none font-mono"
              />
              <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
            </div>
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
              placeholder="e.g. Senior Software Engineer"
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
              <option value="full_time">Full Time Employee (emp@)</option>
              <option value="intern">Intern (int@)</option>
              <option value="contractor">Contractor (emp@)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600">
              Birth / DOB Year * (For Password Format)
            </label>
            <input
              type="number"
              min="1970"
              max="2012"
              required
              value={dobYear}
              onChange={(e) => setDobYear(e.target.value)}
              placeholder="e.g. 2007 or 2006"
              className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-ink focus:border-emerald-600 focus:outline-none font-mono"
            />
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
              className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-ink focus:border-emerald-600 focus:outline-none font-mono"
            />
          </div>
        </div>

        {/* Live Credential Preview Card */}
        {(email.trim() || name.trim()) && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Sparkles size={16} className="text-emerald-600 shrink-0" />
              <span>Live Generated Credential Preview (Derived from Email Handle)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="bg-white rounded-xl p-3 border border-slate-200 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Username (Before @)</span>
                <div className="font-mono font-bold text-ink text-xs">
                  {previewHandle} <span className="text-slate-400 text-[10px]">(+ numbers if collision)</span>
                </div>
              </div>
              <div className="bg-white rounded-xl p-3 border border-slate-200 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Default Password Pattern</span>
                <div className="font-mono font-bold text-emerald-700 text-xs">
                  {previewPassword}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Account Provisioning Option */}
        <div className="border-t border-slate-100 pt-6 space-y-4">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-500">
            Automated Account Provisioning
          </h2>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer font-bold text-xs text-ink">
              <input
                type="checkbox"
                checked={autoCreateAccount}
                onChange={(e) => setAutoCreateAccount(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>Auto-create Supabase Auth account with email handle &amp; default password</span>
            </label>
            <p className="text-[11px] text-slate-500 pl-6">
              Derives username handle before @, provisions login email (`{previewEmail}`), and sets default password (`{previewPassword}`).
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600">
                Or Link Existing Auth Account (Optional)
              </label>
              <select
                disabled={autoCreateAccount}
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-ink focus:border-emerald-600 focus:outline-none disabled:opacity-50"
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
                Link to Verified Intern Profile (Optional)
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
            <span>{submitting ? "Registering & Provisioning..." : "Register Team Member & Provision Account →"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
