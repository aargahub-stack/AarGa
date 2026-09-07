"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { toPng } from "html-to-image";

import ProcessNode from "./nodes/ProcessNode";
import DecisionNode from "./nodes/DecisionNode";
import DatabaseNode from "./nodes/DatabaseNode";
import ApiCallNode from "./nodes/ApiCallNode";
import FlowchartSidebar from "./FlowchartSidebar";
import FlowchartTopBar from "./FlowchartTopBar";
import MermaidCodeDrawer from "./MermaidCodeDrawer";
import { saveFlowchart } from "@/app/workspace/(dashboard)/flowchart/actions";

const nodeTypes = {
  process: ProcessNode,
  decision: DecisionNode,
  database: DatabaseNode,
  apiCall: ApiCallNode,
};

const DEFAULT_NODES = [
  {
    id: "node_1",
    type: "process",
    position: { x: 250, y: 100 },
    data: { label: "Start Process" },
  },
  {
    id: "node_2",
    type: "decision",
    position: { x: 250, y: 220 },
    data: { label: "Valid Data?" },
  },
];

const DEFAULT_EDGES = [
  {
    id: "edge_1_2",
    source: "node_1",
    target: "node_2",
    animated: true,
    style: { stroke: "#10B981", strokeWidth: 2 },
  },
];

let idCounter = 0;
const nextId = () => `node_${Date.now()}_${idCounter++}`;

const sanitizeNodes = (rawNodes) => {
  if (!Array.isArray(rawNodes) || rawNodes.length === 0) return DEFAULT_NODES;
  const filtered = rawNodes.filter((n) => n && typeof n === "object" && n.type !== "code");
  if (filtered.length === 0) return DEFAULT_NODES;
  return filtered.map((n, i) => ({
    ...n,
    position:
      n?.position &&
      typeof n.position.x === "number" &&
      typeof n.position.y === "number"
        ? n.position
        : { x: 250, y: 100 + i * 120 },
  }));
};

function FlowchartCanvasInner({ initialFlowchart, teamMemberId, isStandalone }) {
  const router = useRouter();
  const [isCodeDrawerOpen, setIsCodeDrawerOpen] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState(
    sanitizeNodes(initialFlowchart?.nodes)
  );

  const [edges, setEdges, onEdgesChange] = useEdgesState(
    initialFlowchart?.edges && Array.isArray(initialFlowchart.edges)
      ? initialFlowchart.edges
      : DEFAULT_EDGES
  );

  const [title, setTitle] = useState(initialFlowchart?.title || "Untitled Flowchart");
  const [flowchartId, setFlowchartId] = useState(initialFlowchart?.id || null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  useEffect(() => {
    if (!reactFlowInstance || nodes.length === 0) return;

    const frame = requestAnimationFrame(() => {
      reactFlowInstance.fitView({ padding: 0.2, duration: 350 });
    });

    return () => cancelAnimationFrame(frame);
  }, [nodes, edges, reactFlowInstance]);

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: "#10B981", strokeWidth: 2 },
          },
          eds
        )
      ),
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow-node-type");
      const label = event.dataTransfer.getData("application/reactflow-node-label");
      if (!type || !reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: nextId(),
        type,
        position,
        data: { label: label || type },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  async function handleSave() {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    const result = await saveFlowchart({
      id: flowchartId,
      title,
      nodes,
      edges,
    });

    setIsSaving(false);

    if (!result.success) {
      setSaveError(result.error);
      return;
    }

    setSaveSuccess(true);
    setFlowchartId(result.data.id);

    if (!flowchartId && result.data?.id && !isStandalone) {
      router.replace(`/workspace/flowchart?id=${result.data.id}`);
    }

    setTimeout(() => setSaveSuccess(false), 3000);
  }

  async function handleExportPng() {
    if (!reactFlowWrapper.current) return;
    const viewport = reactFlowWrapper.current.querySelector(".react-flow__viewport");
    if (!viewport) return;

    try {
      const dataUrl = await toPng(viewport, {
        backgroundColor: "#020617",
        quality: 0.95,
      });
      const link = document.createElement("a");
      link.download = `${title.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      setSaveError("Failed to render PNG export.");
    }
  }

  function handleExportJson() {
    const payload = JSON.stringify({ title, nodes, edges }, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${title.replace(/\s+/g, "-").toLowerCase()}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleImportJson(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (Array.isArray(parsed.nodes)) setNodes(sanitizeNodes(parsed.nodes));
        if (Array.isArray(parsed.edges)) setEdges(parsed.edges);
        if (parsed.title) setTitle(parsed.title);
        setFlowchartId(null);
      } catch {
        setSaveError("Invalid JSON file — could not import.");
      }
    };
    reader.readAsText(file);
  }

  // Parse Mermaid graph syntax into ReactFlow nodes & edges
  const parseMermaidToFlow = (code) => {
    const sourceLines = code.split("\n").map((line) => line.trim()).filter(Boolean);
    const graphLine = sourceLines.find((line) => /^(graph|flowchart)\s+/i.test(line));
    const direction = graphLine?.match(/^(?:graph|flowchart)\s+(TD|TB|LR|RL|BT)/i)?.[1]?.toUpperCase() || "TD";
    const lines = sourceLines
      .filter((l) => l && !/^(graph|flowchart)\s+(TD|LR|TB|RL|BT)/i.test(l) && !/^sequenceDiagram/i.test(l) && !/^erDiagram/i.test(l) && !/^autonumber/i.test(l));

    const nodeMap = {}; // id -> { label, type }
    const edgeList = []; // { source, target, label }

    // Regex: match edges like A-->B, A-- label -->B, A--"label"-->B, A[X]-->B[Y]
    const edgeRe = /^(.+?)\s*(-[-.]->?|--\|.+?\||--\s*.+?\s*-->)\s*(.+)$/;
    // Extract node id + optional label from token: A[Label], A{Label}, A(Label), or plain A
    const parseToken = (raw) => {
      raw = raw.trim();
      const brMatch = raw.match(/^([\w\s]+)\[(.+?)\]$/);
      if (brMatch) return { id: brMatch[1].trim().replace(/\s+/g, "_"), label: brMatch[2], type: "process" };
      const cuMatch = raw.match(/^([\w\s]+)\{(.+?)\}$/);
      if (cuMatch) return { id: cuMatch[1].trim().replace(/\s+/g, "_"), label: cuMatch[2], type: "decision" };
      const paMatch = raw.match(/^([\w\s]+)\((.+?)\)$/);
      if (paMatch) return { id: paMatch[1].trim().replace(/\s+/g, "_"), label: paMatch[2], type: "process" };
      // plain id
      const plain = raw.replace(/\s+/g, "_");
      return { id: plain, label: raw, type: "process" };
    };

    lines.forEach((line) => {
      // Skip style/class lines
      if (/^(style|classDef|class|linkStyle)/i.test(line)) return;
      // Check if edge line
      const arrow = line.includes("-->") || line.includes("---") || line.includes("-.->")
        || line.includes("-.->") || line.includes("==>");
      if (arrow) {
        // Split on --> to get source and target sides (handle edge labels)
        const parts = line.split(/\s*-->\s*|\s*---\s*|\s*-\.->\s*|\s*==>\s*/);
        if (parts.length >= 2) {
          // Handle edge label syntax: A -- label --> B
          let srcRaw = parts[0];
          let tgtRaw = parts[parts.length - 1];
          // Strip inline edge label like "-- Yes -->" from src
          srcRaw = srcRaw.replace(/\s*--\s+.*$/, "").trim();

          const src = parseToken(srcRaw);
          const tgt = parseToken(tgtRaw);
          if (!nodeMap[src.id]) nodeMap[src.id] = { label: src.label, type: src.type };
          if (!nodeMap[tgt.id]) nodeMap[tgt.id] = { label: tgt.label, type: tgt.type };
          edgeList.push({ source: src.id, target: tgt.id });
        }
      } else {
        // Standalone node definition
        const node = parseToken(line);
        if (!nodeMap[node.id]) nodeMap[node.id] = { label: node.label, type: node.type };
      }
    });

    const nodeIds = Object.keys(nodeMap);
    if (nodeIds.length === 0) return null;

    // Place nodes in dependency layers so branches render beside each other.
    const incoming = Object.fromEntries(nodeIds.map((id) => [id, 0]));
    const outgoing = Object.fromEntries(nodeIds.map((id) => [id, []]));
    edgeList.forEach(({ source, target }) => {
      if (outgoing[source] && incoming[target] !== undefined) {
        outgoing[source].push(target);
        incoming[target] += 1;
      }
    });

    const layers = [];
    const remaining = new Set(nodeIds);
    let available = nodeIds.filter((id) => incoming[id] === 0);

    while (remaining.size > 0) {
      if (available.length === 0) available = [...remaining];
      const layer = [...new Set(available)].filter((id) => remaining.has(id));
      if (layer.length === 0) break;

      layers.push(layer);
      layer.forEach((id) => remaining.delete(id));
      layer.forEach((id) => {
        outgoing[id].forEach((target) => {
          incoming[target] -= 1;
        });
      });
      available = [...remaining].filter((id) => incoming[id] <= 0);
    }

    const positionById = {};
    const LAYER_GAP = 230;
    const NODE_GAP = 150;
    layers.forEach((layer, layerIndex) => {
      const crossAxisOffset = ((layer.length - 1) * NODE_GAP) / 2;
      layer.forEach((id, index) => {
        const primary = 120 + layerIndex * LAYER_GAP;
        const crossAxis = 320 - crossAxisOffset + index * NODE_GAP;

        if (direction === "LR") positionById[id] = { x: primary, y: crossAxis };
        else if (direction === "RL") positionById[id] = { x: 120 - layerIndex * LAYER_GAP, y: crossAxis };
        else if (direction === "BT") positionById[id] = { x: crossAxis, y: 120 - layerIndex * LAYER_GAP };
        else positionById[id] = { x: crossAxis, y: primary };
      });
    });

    const NODE_GAP_FALLBACK = 150;
    const rfNodes = nodeIds.map((id, i) => ({
      id,
      type: nodeMap[id].type,
      position: positionById[id] || { x: 320, y: 120 + i * NODE_GAP_FALLBACK },
      data: { label: nodeMap[id].label },
    }));

    const rfEdges = edgeList.map((e, i) => ({
      id: `mermaid_edge_${i}`,
      source: e.source,
      target: e.target,
      animated: true,
      style: { stroke: "#10B981", strokeWidth: 2 },
    }));

    return { nodes: rfNodes, edges: rfEdges };
  };

  // Handle Mermaid Code Drawer Run & Render callback
  const handleMermaidRenderSuccess = ({ code }) => {
    const result = parseMermaidToFlow(code);
    if (result) {
      setNodes(result.nodes);
      setEdges(result.edges);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 font-sans overflow-hidden relative">
      {/* Visual Components Sidebar */}
      <FlowchartSidebar />

      {/* Main Viewport Container */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Studio Top Bar */}
        <FlowchartTopBar
          title={title}
          onTitleChange={setTitle}
          onSave={handleSave}
          isSaving={isSaving}
          saveSuccess={saveSuccess}
          saveError={saveError}
          onExportPng={handleExportPng}
          onExportJson={handleExportJson}
          onImportJson={handleImportJson}
          isCodeDrawerOpen={isCodeDrawerOpen}
          onToggleCodeDrawer={() => setIsCodeDrawerOpen((prev) => !prev)}
        />

        {/* Live Visual Canvas Area */}
        <div className="flex-1 relative w-full h-full" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#1e293b" gap={24} size={1.5} />
            <Controls className="!bg-slate-900/90 !border-slate-800 !rounded-xl !shadow-xl [&_button]:!bg-transparent [&_button]:!border-slate-800 [&_button]:!text-slate-200 hover:[&_button]:!bg-slate-800" />
            <MiniMap
              className="!bg-slate-900/90 !border !border-slate-800 !rounded-xl"
              maskColor="rgba(2, 6, 23, 0.75)"
              nodeColor="#10B981"
            />
          </ReactFlow>
        </div>

        {/* Slide-Out 35% Mermaid Code Drawer overlay with Arrow Handle */}
        <MermaidCodeDrawer
          isOpen={isCodeDrawerOpen}
          onClose={() => setIsCodeDrawerOpen(false)}
          onRenderSuccess={handleMermaidRenderSuccess}
          initialCode={initialFlowchart?.nodes?.[0]?.data?.code}
        />
      </div>
    </div>
  );
}

export default function FlowchartCanvas(props) {
  return (
    <ReactFlowProvider>
      <FlowchartCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
