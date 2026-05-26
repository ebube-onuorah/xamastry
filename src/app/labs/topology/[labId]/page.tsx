"use client";

import { useState, useCallback, use, useEffect } from "react";
import { ArrowLeft, BookOpen, HelpCircle, Terminal, Monitor } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import LabInstructions from "@/components/labs/LabInstructions";
import GradingPanel from "@/components/labs/GradingPanel";
import type { TaskResult } from "@/components/labs/GradingPanel";
import type { DeviceState } from "@/lib/ios/state";
import { createDevice } from "@/lib/ios/state";
import { cn } from "@/lib/utils";
import { getNextLab } from "@/lib/labs/progression";
import { trackUsage } from "@/components/UsageTracker";
import topo001 from "@/content/labs/topology/topo-001-two-router-ospf.json";
import topo002 from "@/content/labs/topology/topo-002-vlan-interop.json";
import topo003 from "@/content/labs/topology/topo-003-three-router-static.json";
import topo004 from "@/content/labs/topology/topo-004-device-hardening.json";
import topo005 from "@/content/labs/topology/topo-005-full-campus.json";

const TopologyCanvas = dynamic(() => import("@/components/labs/TopologyCanvas"), { ssr: false });
const CiscoTerminal = dynamic(() => import("@/components/labs/CiscoTerminal"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-[#0d1117] rounded-lg">
      <div className="text-teal-500 animate-pulse text-sm font-mono">Loading terminal...</div>
    </div>
  ),
});

interface TopoDevice {
  id: string;
  type: "router" | "switch" | "pc" | "cloud";
  label: string;
  position: { x: number; y: number };
  initialState?: Partial<DeviceState>;
}

interface TopoTask {
  deviceId: string;
  id: string;
  description: string;
  hint?: string;
  check: { type: string; description: string; expected: Record<string, unknown> };
}

interface TopoDef {
  id: string;
  title: string;
  domain: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;
  description: string;
  scenario: string;
  devices: TopoDevice[];
  links: Array<{ id: string; source: string; target: string; label?: string }>;
  tasks: TopoTask[];
}

const TOPOLOGY_LABS: Record<string, TopoDef> = {
  "topo-001": topo001 as TopoDef,
  "topo-002": topo002 as TopoDef,
  "topo-003": topo003 as TopoDef,
  "topo-004": topo004 as TopoDef,
  "topo-005": topo005 as TopoDef,
};

export default function TopologyLabPage({ params }: { params: Promise<{ labId: string }> }) {
  const { labId } = use(params);
  const [lab, setLab] = useState<TopoDef | null>(null);
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);
  const [deviceStates, setDeviceStates] = useState<Record<string, DeviceState>>({});
  const [taskResults, setTaskResults] = useState<Record<string, TaskResult>>({});
  const [isGrading, setIsGrading] = useState(false);
  const [allPassed, setAllPassed] = useState(false);
  const [activeTab, setActiveTab] = useState<"instructions" | "grading">("instructions");

  useEffect(() => {
    const nextLab = TOPOLOGY_LABS[labId] ?? null;
    setLab(nextLab);
    if (nextLab) {
      const states: Record<string, DeviceState> = {};
      for (const d of nextLab.devices) {
        if (d.type === "router" || d.type === "switch") {
          states[d.id] = {
            ...createDevice(d.initialState?.hostname ?? d.id),
            ...(d.initialState ?? {}),
          } as DeviceState;
        }
      }
      setDeviceStates(states);
    }
  }, [labId]);

  useEffect(() => {
    trackUsage("lab_opened", { labId, labType: "topology" });
  }, [labId]);

  const handleStateChange = useCallback((deviceId: string, state: DeviceState) => {
    setDeviceStates((prev) => ({ ...prev, [deviceId]: state }));
  }, []);

  const handleGrade = useCallback(async () => {
    if (!lab) return;
    setIsGrading(true);
    try {
      const allResults: Record<string, TaskResult> = {};
      let allPassed = true;

      // Group tasks by device and grade each
      const tasksByDevice: Record<string, TopoTask[]> = {};
      for (const task of lab.tasks) {
        if (!tasksByDevice[task.deviceId]) tasksByDevice[task.deviceId] = [];
        tasksByDevice[task.deviceId].push(task);
      }

      for (const [deviceId, tasks] of Object.entries(tasksByDevice)) {
        const state = deviceStates[deviceId];
        if (!state) {
          for (const t of tasks) {
            allResults[t.id] = { passed: false, message: `Device ${deviceId} not configured` };
            allPassed = false;
          }
          continue;
        }
        const res = await fetch("/api/grade-lab", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            labId: lab.id,
            labType: "topology",
            deviceState: state,
            taskIds: tasks.map((t) => t.id),
            tasks: tasks.map((t) => ({ id: t.id, check: t.check })),
          }),
        });
        if (!res.ok) throw new Error(`Failed to grade ${deviceId}`);
        const data = await res.json();
        Object.assign(allResults, data.taskResults ?? {});
        if (!data.allPassed) allPassed = false;
      }

      setTaskResults(allResults);
      setAllPassed(allPassed);
      setActiveTab("grading");
    } catch (error) {
      console.error("[topology-lab:grade]", error);
      setTaskResults({
        error: {
          passed: false,
          message: "Could not check your work. Please try again.",
        },
      });
      setAllPassed(false);
      setActiveTab("grading");
    } finally {
      setIsGrading(false);
    }
  }, [lab, deviceStates]);

  const activeDevice = lab?.devices.find((d) => d.id === activeDeviceId);
  const activeState = activeDeviceId ? deviceStates[activeDeviceId] : null;

  // Tasks as LabInstructions format
  const flatTasks = lab?.tasks.map((t) => ({
    id: t.id,
    description: `[${t.deviceId}] ${t.description}`,
    hint: t.hint,
  })) ?? [];

  if (!lab) {
    return (
      <div className="min-h-screen bg-[#080b10] flex items-center justify-center">
        <div className="text-teal-500 animate-pulse font-mono">Loading topology lab...</div>
      </div>
    );
  }

  const configurableDevices = lab.devices.filter((d) => d.type === "router" || d.type === "switch");
  const nextLab = getNextLab(lab.id, "topology");

  return (
    <div className="min-h-screen bg-[#080b10] flex flex-col lg:h-screen lg:overflow-hidden">
      {/* Top bar */}
      <div className="flex flex-shrink-0 flex-wrap items-center gap-2 border-b border-zinc-800/60 bg-zinc-950/80 px-3 py-2.5 backdrop-blur-sm sm:flex-nowrap sm:gap-4 sm:px-4">
        <Link href="/labs" className="flex w-full items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-white sm:w-auto">
          <ArrowLeft className="w-4 h-4" />
          Back to labs
        </Link>
        <div className="hidden h-4 w-px bg-zinc-800 sm:block" />
        <div className="flex min-w-0 items-center gap-2">
          <Monitor className="w-4 h-4 text-purple-400" />
          <span className="text-white font-semibold text-sm truncate">{lab.title}</span>
        </div>
        <div className="ml-auto flex items-center gap-3 text-xs text-zinc-500">
          <span className="hidden sm:block capitalize">{lab.domain.replace(/-/g, " ")}</span>
          <span>·</span>
          <span>{lab.estimatedMinutes} min</span>
        </div>
      </div>

      {/* Body: left panel + main area */}
      <div className="flex flex-1 flex-col lg:min-h-0 lg:flex-row">
        {/* Left panel */}
        <div className="flex max-h-[45vh] min-h-[320px] w-full flex-shrink-0 flex-col border-b border-zinc-800/60 bg-zinc-950/40 lg:max-h-none lg:min-h-0 lg:w-[320px] lg:border-b-0 lg:border-r">
          {/* Tabs */}
          <div className="flex-shrink-0 flex border-b border-zinc-800/60">
            <button
              onClick={() => setActiveTab("instructions")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors",
                activeTab === "instructions" ? "text-teal-400 border-b-2 border-teal-500" : "text-zinc-500 hover:text-zinc-300",
              )}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Tasks
            </button>
            <button
              onClick={() => setActiveTab("grading")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors",
                activeTab === "grading" ? "text-teal-400 border-b-2 border-teal-500" : "text-zinc-500 hover:text-zinc-300",
              )}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Grade
              {Object.keys(taskResults).length > 0 && (
                <span className={cn(
                  "ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                  allPassed ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400",
                )}>
                  {Object.values(taskResults).filter((r) => r.passed).length}/{lab.tasks.length}
                </span>
              )}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === "instructions" ? (
              <LabInstructions
                id={lab.id}
                title={lab.title}
                scenario={lab.scenario}
                tasks={flatTasks}
                taskResults={taskResults}
                domain={lab.domain}
                difficulty={lab.difficulty}
                estimatedMinutes={lab.estimatedMinutes}
              />
            ) : (
              <GradingPanel
                taskResults={taskResults}
                tasks={flatTasks}
                isGrading={isGrading}
                onGrade={handleGrade}
                allPassed={allPassed}
                labId={lab.id}
                labType="topology"
                nextLab={nextLab}
              />
            )}
          </div>

          {activeTab === "instructions" && (
            <div className="flex-shrink-0 p-3 border-t border-zinc-800/60">
              <button
                onClick={handleGrade}
                disabled={isGrading}
                className="w-full py-2 px-4 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-teal-300 text-sm font-semibold rounded-lg transition-all disabled:opacity-50"
              >
                {isGrading ? "Grading..." : "Check My Work"}
              </button>
            </div>
          )}
        </div>

        {/* Right: topology (top 55%) + terminal (bottom 45%) */}
        <div className="flex min-h-[92vh] flex-1 flex-col lg:min-h-0">
          {/* Topology canvas */}
          <div className="relative h-[46vh] min-h-[300px] lg:h-[55%] lg:min-h-0">
            <TopologyCanvas
              devices={lab.devices}
              links={lab.links}
              activeDeviceId={activeDeviceId}
              onSelectDevice={setActiveDeviceId}
            />
            {/* Click hint */}
            {!activeDeviceId && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-zinc-900/80 border border-zinc-700/60 text-zinc-400 text-xs px-3 py-1.5 rounded-full pointer-events-none">
                Click a router or switch to open its terminal
              </div>
            )}
          </div>

          {/* Device selector + terminal */}
          <div className="flex min-h-[52vh] flex-1 flex-col border-t border-zinc-800/60 lg:min-h-0">
            {/* Device tab strip */}
            <div className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 border-b border-zinc-800/60 bg-zinc-950/60 overflow-x-auto">
              <Terminal className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0 mr-1" />
              {configurableDevices.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setActiveDeviceId(d.id)}
                  className={cn(
                    "flex-shrink-0 px-2.5 py-1 rounded text-xs font-mono font-semibold transition-colors",
                    activeDeviceId === d.id
                      ? d.type === "router"
                        ? "bg-teal-500/20 text-teal-300 border border-teal-500/40"
                        : "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60",
                  )}
                >
                  {d.id}
                </button>
              ))}
              {!activeDeviceId && (
                <span className="text-xs text-zinc-600 ml-2">— select a device above</span>
              )}
            </div>

            {/* Terminal */}
            <div className="flex-1 min-h-0 p-2">
              {activeDeviceId && activeState ? (
                <CiscoTerminal
                  key={activeDeviceId}
                  initialState={activeState}
                  onStateChange={(s) => handleStateChange(activeDeviceId, s)}
                  className="h-full rounded-lg overflow-hidden"
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-[#0d1117] rounded-lg">
                  <p className="text-zinc-600 text-sm font-mono">
                    {activeDevice
                      ? `${activeDevice.label} is not configurable`
                      : "Select a device to open its terminal"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
