"use client";

import { useEffect } from "react";

export default function Toast({ type = "success", message, onClose }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose?.();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  const isSuccess = type === "success";

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center justify-between gap-4 max-w-md rounded-2xl border p-4 shadow-glass transition-all ${
        isSuccess
          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
          : "border-red-200 bg-red-50 text-red-900"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-lg">{isSuccess ? "✅" : "⚠️"}</span>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider">
            {isSuccess ? "Action Successful" : "Database Mutation Error"}
          </div>
          <div className="mt-0.5 text-xs leading-relaxed font-semibold">
            {message}
          </div>
        </div>
      </div>
      <button
        onClick={onClose}
        className="rounded-full p-1 hover:bg-black/5 text-xs font-bold"
      >
        ✕
      </button>
    </div>
  );
}
