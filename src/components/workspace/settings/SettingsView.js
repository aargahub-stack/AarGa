"use client";

import { useState } from "react";
import { Lock, Shield, Bell, Moon, KeyRound, CheckCircle2, Loader2 } from "lucide-react";
import { updatePasswordAction } from "@/app/workspace/(dashboard)/dashboardActions";

export default function SettingsView({ teamMember }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);
  const [passError, setPassError] = useState(null);

  // Preference Toggles State
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [taskNotifs, setTaskNotifs] = useState(true);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(false);

    if (!newPassword || newPassword.length < 6) {
      setPassError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError("New password and confirmation do not match.");
      return;
    }

    setIsUpdatingPass(true);
    const res = await updatePasswordAction(newPassword);
    setIsUpdatingPass(false);

    if (res.success) {
      setPassSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPassSuccess(false), 4000);
    } else {
      setPassError(res.error || "Failed to update password.");
    }
  };

  return (
    <div className="max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-8 font-sans text-ink">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-ink">
          Workspace Settings &amp; Security
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
          Manage credentials, security preferences, and workspace notification rules.
        </p>
      </div>

      {/* Password & Security Management */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-black text-ink mb-2 flex items-center gap-2">
          <KeyRound size={18} className="text-emerald-600" /> Account Password &amp; Credentials
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Update your Supabase authentication password for accessing `portal.aarga.org`.
        </p>

        {passError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-800 mb-6">
            {passError}
          </div>
        )}

        {passSuccess && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 mb-6 flex items-center gap-2">
            <CheckCircle2 size={16} /> Password updated successfully!
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              New Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 py-2.5 text-xs font-bold text-ink focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 py-2.5 text-xs font-bold text-ink focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isUpdatingPass}
              className="flex items-center gap-2 rounded-xl bg-ink hover:bg-moss-800 px-5 py-2.5 text-xs font-bold text-white transition-colors shadow-sm disabled:opacity-50"
            >
              {isUpdatingPass ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
              <span>{isUpdatingPass ? "Updating Password..." : "Update Security Password"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Notifications Preferences */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-black text-ink mb-2 flex items-center gap-2">
          <Bell size={18} className="text-emerald-600" /> Workspace Notifications
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Configure how you receive SOP task approvals and workspace lead announcements.
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50">
            <div>
              <div className="text-xs font-bold text-ink">Task Assignment Notifications</div>
              <div className="text-[11px] text-slate-500">Receive alerts when new SOP tasks are assigned</div>
            </div>
            <input
              type="checkbox"
              checked={taskNotifs}
              onChange={(e) => setTaskNotifs(e.target.checked)}
              className="h-4 w-4 rounded accent-emerald-600"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50">
            <div>
              <div className="text-xs font-bold text-ink">Email Digests &amp; Payout Updates</div>
              <div className="text-[11px] text-slate-500">Receive monthly stipend &amp; salary status emails</div>
            </div>
            <input
              type="checkbox"
              checked={emailNotifs}
              onChange={(e) => setEmailNotifs(e.target.checked)}
              className="h-4 w-4 rounded accent-emerald-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
