"use client";

import { useRef } from "react";
import { Save, Download, FileJson, Upload, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function FlowchartTopBar({
  title,
  onTitleChange,
  onSave,
  isSaving,
  saveSuccess,
  saveError,
  onExportPng,
  onExportJson,
  onImportJson,
}) {
  const fileInputRef = useRef(null);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl px-6 py-3.5 font-['Space_Grotesk']">
      <div className="flex items-center gap-3">
        <Link
          href="/workspace/flowchart"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Back to saved flowcharts list"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="bg-transparent text-lg font-bold text-white outline-none border-b border-transparent hover:border-slate-700 focus:border-emerald-400 transition-colors px-1 py-0.5"
            placeholder="Untitled Flowchart"
          />
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {saveError && <span className="text-xs font-semibold text-rose-400 mr-2">{saveError}</span>}
        {saveSuccess && (
          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 mr-2">
            <CheckCircle2 size={14} /> Saved to Cloud
          </span>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && onImportJson(e.target.files[0])}
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <Upload size={14} /> Import JSON
        </button>

        <button
          onClick={onExportJson}
          className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <FileJson size={14} /> Export JSON
        </button>

        <button
          onClick={onExportPng}
          className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <Download size={14} /> Export PNG
        </button>

        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-xs font-bold text-slate-950 transition-colors disabled:opacity-60 shadow-lg shadow-emerald-500/20"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {isSaving ? "Saving…" : "Save to Cloud"}
        </button>
      </div>
    </div>
  );
}
