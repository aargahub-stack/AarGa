"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, X, Trash2, Loader2 } from "lucide-react";

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  description = "This action is permanent and cannot be undone.",
  confirmMatchText = "",
  confirmButtonText = "Delete Permanently",
  loading = false,
  errorMessage = "",
}) {
  const [typedInput, setTypedInput] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTypedInput("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isMatched = confirmMatchText
    ? typedInput.trim() === confirmMatchText.trim()
    : true;

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!isMatched || loading) return;
    await onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-red-200 bg-white p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <AlertTriangle size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">{title}</h3>
              <p className="text-xs font-semibold text-slate-500">{description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error message alert */}
        {errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs font-bold text-red-700 flex items-start gap-2">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <div>{errorMessage}</div>
          </div>
        )}

        {/* Friction input */}
        {confirmMatchText && (
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              To confirm, type <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-red-600 font-black">{confirmMatchText}</span> below:
            </label>
            <input
              type="text"
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              placeholder={confirmMatchText}
              disabled={loading}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!isMatched || loading}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors ${
              isMatched && !loading
                ? "bg-red-600 hover:bg-red-700"
                : "bg-red-300 cursor-not-allowed"
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Trash2 size={14} />
                <span>{confirmButtonText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
