"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClientAction } from "../actions";
import { ArrowLeft, Building2 } from "lucide-react";

export default function NewClientPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [orgName, setOrgName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("contact_email", contactEmail);
    formData.append("org_name", orgName);

    const res = await createClientAction(formData);
    setSubmitting(false);

    if (res.success && res.clientId) {
      router.push(`/admin/clients/${res.clientId}/onboard`);
      router.refresh();
    } else {
      setErrorMsg(res.error || "Failed to register client organization.");
    }
  };

  return (
    <div className="w-full space-y-6">
      <Link
        href="/admin/clients"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-ink transition-colors"
      >
        <ArrowLeft size={16} strokeWidth={2} />
        <span>Back to Client Organizations</span>
      </Link>

      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
          Client Registration
        </span>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-ink">
          Register New Client Organization
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Add organization contact credentials to begin project onboarding.
        </p>
      </div>

      {errorMsg && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
          {errorMsg}
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-glass">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-600">
              Organization Name *
            </label>
            <input
              type="text"
              required
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="e.g. Acme Corporation"
              className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-600">
              Primary Contact Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sarah Jenkins"
              className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-600">
              Contact Email Address *
            </label>
            <input
              type="email"
              required
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="e.g. sarah@acme.org"
              className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Link
              href="/admin/clients"
              className="rounded-full border border-slate-200 px-5 py-3 font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-bold text-white shadow-glass hover:bg-moss-800 disabled:opacity-50"
            >
              <Building2 size={16} strokeWidth={2} />
              <span>{submitting ? "Registering..." : "Register & Continue to Onboarding →"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
