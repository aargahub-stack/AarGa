"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import {
  Code2,
  Download,
  FileCode2,
  Loader2,
  Save,
  Sparkles,
  Workflow,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
} from "lucide-react";
import { saveFlowchart } from "@/app/workspace/(dashboard)/flowchart/actions";

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

export default function MermaidDiagramEditor({ initialTitle = "Code Flowchart", initialCode, flowchartId: initialId }) {
  const [code, setCode] = useState(initialCode || PRESET_TEMPLATES.sop);
  const [title, setTitle] = useState(initialTitle);
  const [flowchartId, setFlowchartId] = useState(initialId || null);
  const [svgContent, setSvgContent] = useState("");
  const [renderError, setRenderError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [copied, setCopied] = useState(false);

  const containerRef = useRef(null);

  // Initialize Mermaid configuration
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      securityLevel: "loose",
      themeVariables: {
        darkMode: true,
        background: "#020617",
        primaryColor: "#10b981",
        primaryTextColor: "#ffffff",
        primaryBorderColor: "#059669",
        lineColor: "#34d399",
        secondaryColor: "#0284c7",
        tertiaryColor: "#7c3aed",
      },
    });
  }, []);

  // Render diagram on code change
  useEffect(() => {
    let isCancelled = false;

    async function renderDiagram() {
      if (!code.trim()) {
        setSvgContent("");
        setRenderError(null);
        return;
      }

      try {
        const id = `mermaid_${Date.now()}`;
        const { svg } = await mermaid.render(id, code);
        if (!isCancelled) {
          setSvgContent(svg);
          setRenderError(null);
        }
      } catch (err) {
        if (!isCancelled) {
          setRenderError(err.message || "Mermaid syntax error");
        }
      }
    }

    const timer = setTimeout(renderDiagram, 300);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [code]);

  async function handleSave() {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    // Store mermaid code in JSON state structure
    const result = await saveFlowchart({
      id: flowchartId,
      title: title || "Mermaid Code Flowchart",
      nodes: [{ id: "mermaid_code", type: "code", data: { code } }],
      edges: [],
    });

    setIsSaving(false);

    if (!result.success) {
      setSaveError(result.error);
      return;
    }

    setSaveSuccess(true);
    if (result.data?.id) {
      setFlowchartId(result.data.id);
    }
    setTimeout(() => setSaveSuccess(false), 3000);
  }

  function handleCopyCode() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownloadSvg() {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${title.replace(/\s+/g, "-").toLowerCase()}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-slate-950 font-sans text-white overflow-hidden">
      {/* Top Bar Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 bg-slate-900/90 px-6 py-3">
        <div className="flex items-center gap-3">
          <FileCode2 size={18} className="text-emerald-400" />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent text-base font-black text-white outline-none border-b border-transparent hover:border-slate-700 focus:border-emerald-400 transition-colors px-1 py-0.5"
            placeholder="Untitled Mermaid Diagram"
          />
        </div>

        {/* Template Presets Bar */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
            Presets:
          </span>
          <button
            onClick={() => setCode(PRESET_TEMPLATES.sop)}
            className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-bold text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors"
          >
            SOP Workflow
          </button>
          <button
            onClick={() => setCode(PRESET_TEMPLATES.arch)}
            className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-bold text-slate-300 hover:text-sky-400 hover:border-sky-500/40 transition-colors"
          >
            System Architecture
          </button>
          <button
            onClick={() => setCode(PRESET_TEMPLATES.database)}
            className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-bold text-slate-300 hover:text-violet-400 hover:border-violet-500/40 transition-colors"
          >
            Database Flow
          </button>
          <button
            onClick={() => setCode(PRESET_TEMPLATES.sequence)}
            className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-bold text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition-colors"
          >
            API Sequence
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {saveError && <span className="text-xs text-rose-400 font-semibold">{saveError}</span>}
          {saveSuccess && (
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
              <CheckCircle2 size={14} /> Saved
            </span>
          )}

          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copied ? "Copied" : "Copy Code"}</span>
          </button>

          <button
            onClick={handleDownloadSvg}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <Download size={14} />
            <span>Export SVG</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-4 py-1.5 text-xs font-bold text-slate-950 transition-colors disabled:opacity-60 shadow-lg shadow-emerald-500/20"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>{isSaving ? "Saving..." : "Save Cloud"}</span>
          </button>
        </div>
      </div>

      {/* Split-Screen Main Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-2 flex-1 overflow-hidden">
        {/* Left Panel: Code Input & Syntax Helper */}
        <div className="flex flex-col border-r border-slate-800 bg-slate-950 p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-300 uppercase tracking-wider">
              <Code2 size={15} className="text-emerald-400" /> Mermaid Syntax Editor
            </div>
            <span className="text-[11px] text-slate-500 font-mono">graph TD / sequence / erDiagram</span>
          </div>

          {/* Syntax Error Alert */}
          {renderError && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 mb-3 text-xs font-semibold text-rose-300 flex items-start gap-2">
              <AlertCircle size={15} className="shrink-0 text-rose-400 mt-0.5" />
              <div className="truncate">{renderError}</div>
            </div>
          )}

          {/* Code Textarea */}
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            placeholder="Type Mermaid.js code here..."
            className="flex-1 w-full bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/60 leading-relaxed resize-none shadow-inner"
          />

          {/* Syntax Tips Footer */}
          <div className="mt-3 rounded-xl border border-slate-800/80 bg-slate-900/40 p-3 text-[11px] text-slate-400 leading-relaxed">
            <span className="font-extrabold text-emerald-400">Quick Tips:</span> Use <code className="text-slate-200 bg-slate-800 px-1 py-0.5 rounded">A --&gt; B</code> for arrows, <code className="text-slate-200 bg-slate-800 px-1 py-0.5 rounded">A&#123;Decision?&#125;</code> for diamonds, or select preset templates above.
          </div>
        </div>

        {/* Right Panel: Real-Time Rendered Canvas */}
        <div className="flex flex-col bg-slate-900/50 p-4 overflow-hidden relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-300 uppercase tracking-wider">
              <Workflow size={15} className="text-sky-400" /> Live Render Preview
            </div>
            <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
              <Sparkles size={13} /> Instant Render
            </span>
          </div>

          <div
            ref={containerRef}
            className="flex-1 w-full rounded-xl border border-slate-800 bg-slate-950/80 p-6 flex items-center justify-center overflow-auto shadow-inner [&_svg]:max-w-full [&_svg]:h-auto"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        </div>
      </div>
    </div>
  );
}
