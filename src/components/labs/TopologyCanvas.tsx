"use client";

import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type NodeTypes,
  type Node,
  type Edge,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { cn } from "@/lib/utils";

// ── Custom node types ──────────────────────────────────────────────────────

function RouterNode({ data, selected }: { data: { label: string; isActive?: boolean }; selected?: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1.5 cursor-pointer select-none",
        selected && "scale-110 transition-transform",
      )}
    >
      <div
        className={cn(
          "w-14 h-14 rounded-full border-2 flex items-center justify-center bg-[#0d1117] transition-all",
          selected
            ? "border-teal-400 shadow-[0_0_16px_rgba(45,212,191,0.5)]"
            : data.isActive
              ? "border-teal-500/70"
              : "border-zinc-600 hover:border-teal-500/50",
        )}
      >
        {/* Router SVG icon */}
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-teal-400">
          <rect x="2" y="8" width="20" height="8" rx="2" />
          <circle cx="6" cy="12" r="1.5" fill="currentColor" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          <circle cx="18" cy="12" r="1.5" fill="currentColor" />
          <path d="M7 8V6M12 8V5M17 8V6" strokeLinecap="round" />
        </svg>
      </div>
      <span className={cn(
        "text-xs font-mono font-semibold text-center leading-tight whitespace-pre-line",
        selected ? "text-teal-300" : "text-zinc-300",
      )}>
        {data.label}
      </span>
    </div>
  );
}

function SwitchNode({ data, selected }: { data: { label: string; isActive?: boolean }; selected?: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1.5 cursor-pointer select-none",
        selected && "scale-110 transition-transform",
      )}
    >
      <div
        className={cn(
          "w-14 h-10 rounded border-2 flex items-center justify-center bg-[#0d1117] transition-all",
          selected
            ? "border-purple-400 shadow-[0_0_16px_rgba(192,132,252,0.5)]"
            : data.isActive
              ? "border-purple-500/70"
              : "border-zinc-600 hover:border-purple-500/50",
        )}
      >
        {/* Switch SVG icon */}
        <svg width="28" height="20" viewBox="0 0 28 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-purple-400">
          <rect x="1" y="4" width="26" height="12" rx="2" />
          {[4, 8, 12, 16, 20, 24].map((x) => (
            <line key={x} x1={x} y1="4" x2={x} y2="1" strokeLinecap="round" />
          ))}
          {[6, 14, 22].map((x) => (
            <circle key={x} cx={x} cy="10" r="1.5" fill="currentColor" stroke="none" />
          ))}
        </svg>
      </div>
      <span className={cn(
        "text-xs font-mono font-semibold text-center leading-tight whitespace-pre-line",
        selected ? "text-purple-300" : "text-zinc-300",
      )}>
        {data.label}
      </span>
    </div>
  );
}

function PCNode({ data, selected }: { data: { label: string }; selected?: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1.5 select-none",
        selected && "scale-110 transition-transform",
      )}
    >
      <div
        className={cn(
          "w-12 h-10 rounded border flex items-center justify-center bg-[#0d1117]",
          selected ? "border-sky-400" : "border-zinc-700",
        )}
      >
        <svg width="22" height="18" viewBox="0 0 22 18" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sky-400">
          <rect x="1" y="1" width="20" height="13" rx="1.5" />
          <path d="M7 17h8M11 14v3" strokeLinecap="round" />
        </svg>
      </div>
      <span className={cn(
        "text-[10px] font-mono text-center leading-tight whitespace-pre-line",
        selected ? "text-sky-300" : "text-zinc-500",
      )}>
        {data.label}
      </span>
    </div>
  );
}

function CloudNode({ data, selected }: { data: { label: string }; selected?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5 select-none">
      <div className={cn(
        "w-16 h-12 flex items-center justify-center",
        selected && "scale-110 transition-transform",
      )}>
        <svg width="52" height="38" viewBox="0 0 52 38" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-400">
          <path d="M14 30c-6 0-10-4-10-9a9 9 0 0 1 12-8.5A12 12 0 0 1 38 16c5 0 9 4 9 9 0 4-3 7-7 7H14z" />
        </svg>
      </div>
      <span className="text-[10px] font-mono text-zinc-500 text-center whitespace-pre-line">{data.label}</span>
    </div>
  );
}

const NODE_TYPES: NodeTypes = {
  router: RouterNode as NodeTypes["router"],
  switch: SwitchNode as NodeTypes["switch"],
  pc: PCNode as NodeTypes["pc"],
  cloud: CloudNode as NodeTypes["cloud"],
};

// ── Main canvas component ──────────────────────────────────────────────────

export interface TopoDevice {
  id: string;
  type: "router" | "switch" | "pc" | "cloud";
  label: string;
  position: { x: number; y: number };
}

export interface TopoLink {
  id: string;
  source: string;
  target: string;
  label?: string;
}

interface TopologyCanvasProps {
  devices: TopoDevice[];
  links: TopoLink[];
  activeDeviceId: string | null;
  onSelectDevice: (id: string | null) => void;
}

export default function TopologyCanvas({
  devices,
  links,
  activeDeviceId,
  onSelectDevice,
}: TopologyCanvasProps) {
  const nodes = useMemo<Node[]>(() =>
    devices.map((d) => ({
      id: d.id,
      type: d.type,
      position: d.position,
      data: { label: d.label, isActive: d.id === activeDeviceId },
      selected: d.id === activeDeviceId,
    })),
    [devices, activeDeviceId],
  );

  const edges = useMemo<Edge[]>(() =>
    links.map((l) => ({
      id: l.id,
      source: l.source,
      target: l.target,
      label: l.label,
      style: { stroke: "#374151", strokeWidth: 2 },
      labelStyle: { fill: "#6b7280", fontSize: 10, fontFamily: "monospace" },
      labelBgStyle: { fill: "#0d1117", fillOpacity: 0.8 },
    })),
    [links],
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (node.type === "pc" || node.type === "cloud") return;
      onSelectDevice(activeDeviceId === node.id ? null : node.id);
    },
    [activeDeviceId, onSelectDevice],
  );

  const onPaneClick = useCallback(() => {
    onSelectDevice(null);
  }, [onSelectDevice]);

  return (
    <div className="w-full h-full bg-[#080b10] rounded-lg overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        panOnDrag={true}
        zoomOnScroll={true}
        minZoom={0.3}
        maxZoom={2}
        colorMode="dark"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#1f2937" />
        <Controls
          style={{ background: "#0f172a", border: "1px solid #1f2937" }}
          showInteractive={false}
        />
        <MiniMap
          style={{ background: "#0a0f1a", border: "1px solid #1f2937" }}
          nodeColor={(n) =>
            n.type === "router" ? "#14b8a6" : n.type === "switch" ? "#a855f7" : "#374151"
          }
          maskColor="rgba(0,0,0,0.6)"
        />
      </ReactFlow>
      <div className="absolute bottom-14 right-3 flex flex-col gap-1 text-[10px] text-zinc-500">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-teal-500/60 inline-block" />Router
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-purple-500/60 inline-block" />Switch
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-sky-500/60 inline-block" />PC
        </div>
      </div>
    </div>
  );
}
