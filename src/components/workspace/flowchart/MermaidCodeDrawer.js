"use client";

import { useEffect, useState } from "react";
import {
  Code2,
  Play,
  X,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";

const PRESET_TEMPLATES = {
  sop: `graph TD
    A[Start SOP Workflow] --> B{Valid Input Request?}
    B -- Yes --> C[Execute Automation Task]
    B -- No --> D[Trigger Lead Rejection Notice]
    C --> E[Verify Deliverable Output]
    E --> F[Complete SOP Milestone]`,
  arch: `graph TB
    Client[Next.js Client Workspace] -->|HTTPS REST| API[Node.js / Next.js Server]
    API -->|Auth & RLS| Supabase[(Supabase Database)]
    API -->|Async Tasks| Worker[Task Queue & Cron]
    Worker -->|Heartbeat| Supabase`,
  database: `erDiagram
    TEAM_MEMBERS ||--o{ SOP_TASKS : assigns
    TEAM_MEMBERS ||--o{ FLOWCHARTS : creates
    TEAM_MEMBERS ||--o{ WORKSPACE_ATTENDANCE : logs
    SOP_TASKS }|--|| PROJECT_PHASES : belongs_to`,
  sequence: `sequenceDiagram
    autonumber
    Client->>Server: POST /api/flowchart/save
    Server->>Supabase Auth: Validate JWT Token
    Supabase Auth-->>Server: Token Verified (user_id)
    Server->>Database: INSERT INTO flowcharts (nodes, edges)
    Database-->>Server: 201 Created (id)
    Server-->>Client: 200 Success Response`,
};

export default function MermaidCodeDrawer({
  isOpen,
  onClose,
  onRenderSuccess,
  initialCode,
}) {
  const [isExpanded, setIsExpanded] = useState(isOpen);
  const [code, setCode] = useState(initialCode || PRESET_TEMPLATES.sop);
  const [renderError, setRenderError] = useState(null);
  const [isRendering, setIsRendering] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsExpanded(isOpen);
  }, [isOpen]);

  const handleRunAndRender = () => {
    if (!code.trim()) return;
    setIsRendering(true);
    setRenderError(null);

    try {
      // Basic syntax check — must start with a known diagram type
      const firstLine = code.trim().split("\n")[0].toLowerCase();
      const validStart = ["graph ", "sequencediagram", "erdiagram", "gantt", "pie", "flowchart "];
      if (!validStart.some((s) => firstLine.startsWith(s))) {
        setRenderError('Must start with: graph TD, graph LR, sequenceDiagram, erDiagram, etc.');
        setIsRendering(false);
        return;
      }

      if (onRenderSuccess) {
        onRenderSuccess({ code });
      }

      setIsRendering(false);
      setIsExpanded(false);
    } catch (err) {
      setIsRendering(false);
      setRenderError(err.message || "Syntax error");
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed left-0 top-0 z-30 h-screen font-sans pointer-events-none">
      {/* Slide-Out Full-Height Panel Container */}
      <div
        className={`pointer-events-auto h-screen w-[420px] bg-slate-950 border-r border-slate-800/80 shadow-[4px_0_40px_rgba(0,0,0,0.6)] flex flex-col relative transition-all duration-300 ease-in-out transform ${
          isExpanded ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 absolute pointer-events-none"
        }`}
      >
        {/* Close Button — absolute top-right */}
        <button
          onClick={() => setIsExpanded(false)}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
          title="Close Drawer"
        >
          <X size={16} />
        </button>

        {/* Panel Header */}
        <div className="px-5 py-4 border-b border-slate-800/80 flex items-center gap-3 bg-slate-900 pr-10">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 shrink-0">
            <Code2 size={18} />
          </div>
          <div className="flex items-center gap-3 min-w-0">
            <div>
              <h3 className="text-sm font-black text-white tracking-tight">
                Mermaid Syntax Editor
              </h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Type code · click Run to render</p>
            </div>
            <button
              onClick={handleCopyCode}
              className="ml-2 p-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
              title="Copy Code"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {/* Template Presets Bar */}
        <div className="px-5 py-3 border-b border-slate-800/60 bg-slate-900/50 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">Templates:</span>
          <button
            onClick={() => setCode(PRESET_TEMPLATES.sop)}
            className="rounded-lg border border-slate-700/80 bg-slate-800/60 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all shrink-0"
          >
            SOP Workflow
          </button>
          <button
            onClick={() => setCode(PRESET_TEMPLATES.arch)}
            className="rounded-lg border border-slate-700/80 bg-slate-800/60 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-sky-400 hover:border-sky-500/40 hover:bg-sky-500/5 transition-all shrink-0"
          >
            Architecture
          </button>
          <button
            onClick={() => setCode(PRESET_TEMPLATES.database)}
            className="rounded-lg border border-slate-700/80 bg-slate-800/60 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-violet-400 hover:border-violet-500/40 hover:bg-violet-500/5 transition-all shrink-0"
          >
            Database
          </button>
          <button
            onClick={() => setCode(PRESET_TEMPLATES.sequence)}
            className="rounded-lg border border-slate-700/80 bg-slate-800/60 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-amber-400 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all shrink-0"
          >
            Sequence
          </button>
        </div>

        {/* Editor Body */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Syntax Error Alert */}
          {renderError && (
            <div className="mx-4 mt-3 rounded-xl border border-rose-500/30 bg-rose-950/60 p-3 text-xs font-medium text-rose-300 flex items-start gap-2 shrink-0">
              <AlertCircle size={15} className="shrink-0 text-rose-400 mt-0.5" />
              <div className="truncate">{renderError}</div>
            </div>
          )}

          {/* Code Textarea — flush left, no border, fills space */}
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            placeholder="// Type Mermaid syntax here..."
            className="flex-1 w-full bg-transparent border-none outline-none pl-5 pr-4 pt-4 pb-2 font-mono text-sm text-slate-100 placeholder:text-slate-600 leading-7 resize-none no-scrollbar caret-emerald-400"
            style={{ caretColor: '#10b981' }}
          />

          {/* Quick Tips Footer */}
          <div className="mx-5 mb-3 rounded-xl border border-slate-800/60 bg-slate-900/30 px-4 py-3 text-xs text-slate-400 leading-relaxed shrink-0">
            <span className="font-bold text-emerald-400">Tip:</span> Mermaid syntax · Click <span className="text-slate-200 font-semibold">Run &amp; Render</span> to update canvas
          </div>
        </div>

        {/* Panel Footer Action Button */}
        <div className="px-5 py-4 border-t border-slate-800/80 bg-slate-900 flex items-center justify-between gap-3">
          <button
            onClick={() => setIsExpanded(false)}
            className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 hover:text-white transition-all"
          >
            Close
          </button>

          <button
            onClick={handleRunAndRender}
            disabled={isRendering}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 px-6 py-2.5 text-sm font-bold text-slate-950 transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play size={15} fill="currentColor" />
            <span>{isRendering ? "Rendering..." : "Run & Render →"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
