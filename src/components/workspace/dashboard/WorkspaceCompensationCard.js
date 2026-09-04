"use client";

import { useState, useEffect } from "react";
import { CreditCard, Calendar, CheckCircle2, Landmark } from "lucide-react";

function formatDateDeterministic(dateStr) {
  if (!dateStr) return "End of Month";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "End of Month";
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export default function WorkspaceCompensationCard({ compensationData, teamMember }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const comp = compensationData || {
    role_type: teamMember?.role?.toLowerCase().includes("intern") ? "Intern" : "Employee",
    base_amount: teamMember?.role?.toLowerCase().includes("intern") ? 15000 : 65000,
    currency: "INR",
    payout_cycle: teamMember?.role?.toLowerCase().includes("intern") ? "Monthly Stipend" : "Monthly Salary",
    next_payout_date: "2026-09-30",
    payout_status: "Active",
    bank_name: "HDFC Bank Ltd.",
    account_last4: "4821",
    upi_id: `${teamMember?.name?.toLowerCase().replace(/\s+/g, "")}@aarga`,
  };

  const formattedAmount = `₹${Number(comp.base_amount || 0).toLocaleString("en-IN")}`;
  const formattedDate = formatDateDeterministic(comp.next_payout_date);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm font-sans text-ink">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600 border border-sky-200">
            <CreditCard size={16} />
          </div>
          <div>
            <h3 className="text-sm font-black text-ink">Compensation &amp; Stipend View</h3>
            <p className="text-[11px] text-slate-500 font-semibold">Transparent payout status &amp; breakdown</p>
          </div>
        </div>

        <span className="rounded-full bg-sky-100 border border-sky-200 px-2.5 py-0.5 text-[10px] font-black uppercase text-sky-800">
          {comp.role_type || "Team Member"}
        </span>
      </div>

      <div className="space-y-4">
        {/* Main Amount Card */}
        <div className="rounded-xl bg-slate-900 text-white p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {comp.payout_cycle || "Monthly Disbursement"}
            </div>
            <div className="text-2xl font-black text-white mt-0.5" suppressHydrationWarning>
              {formattedAmount} <span className="text-xs font-semibold text-slate-400">/ mo</span>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-400">
              <CheckCircle2 size={12} />
              {comp.payout_status || "Active"}
            </span>
          </div>
        </div>

        {/* Payout Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase mb-1">
              <Calendar size={12} className="text-emerald-600" /> Next Disbursement
            </div>
            <div className="font-extrabold text-ink" suppressHydrationWarning>
              {formattedDate}
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase mb-1">
              <Landmark size={12} className="text-sky-600" /> Account Account
            </div>
            <div className="font-extrabold text-ink truncate">
              {comp.bank_name || "Bank Account"} (••{comp.account_last4 || "4821"})
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
