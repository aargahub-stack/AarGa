"use client";

import { useCallback, useRef, useState } from "react";
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

function FlowchartCanvasInner({ initialFlowchart, teamMemberId }) {
  const router = useRouter();

  const [nodes, setNodes, onNodesChange] = useNodesState(
    initialFlowchart?.nodes && initialFlowchart.nodes.length > 0
      ? initialFlowchart.nodes
      : DEFAULT_NODES
  );

  const [edges, setEdges, onEdgesChange] = useEdgesState(
    initialFlowchart?.edges && initialFlowchart.edges.length > 0
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
    
    // Update URL if new chart created
    if (!flowchartId && result.data?.id) {
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
    } catch (err) {
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
        if (Array.isArray(parsed.nodes)) setNodes(parsed.nodes);
        if (Array.isArray(parsed.edges)) setEdges(parsed.edges);
        if (parsed.title) setTitle(parsed.title);
        setFlowchartId(null);
      } catch {
        setSaveError("Invalid JSON file — could not import.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="flex h-[calc(100vh-56px)] w-full bg-slate-950 font-['Space_Grotesk'] overflow-hidden border-t border-slate-800">
      <FlowchartSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
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
        />
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
