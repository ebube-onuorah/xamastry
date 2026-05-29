"use client";

import { useState, useCallback, use } from "react";
import { ArrowLeft, BookOpen, Terminal, HelpCircle } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import LabInstructions from "@/components/labs/LabInstructions";
import GradingPanel from "@/components/labs/GradingPanel";
import { createDevice, type DeviceState } from "@/lib/ios/state";
import type { TaskResult } from "@/components/labs/GradingPanel";
import { cn } from "@/lib/utils";
import { COMMON_LAB_MISSES, getNextLab } from "@/lib/labs/progression";
import { trackUsage } from "@/components/UsageTracker";

// Dynamic import — xterm.js requires browser APIs
const CiscoTerminal = dynamic(() => import("@/components/labs/CiscoTerminal"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-[#0d1117] rounded-lg">
      <div className="text-teal-500 animate-pulse text-sm font-mono">Loading terminal...</div>
    </div>
  ),
});

// Lab definitions are loaded client-side from JSON
import lab001 from "@/content/labs/cli/lab-001-basic-router-config.json";
import lab002 from "@/content/labs/cli/lab-002-static-routing.json";
import lab003 from "@/content/labs/cli/lab-003-vlan-config.json";
import lab004 from "@/content/labs/cli/lab-004-router-on-a-stick.json";
import lab005 from "@/content/labs/cli/lab-005-ospf-single-area.json";
import lab006 from "@/content/labs/cli/lab-006-device-security.json";
import lab007 from "@/content/labs/cli/lab-007-trunk-links.json";
import lab008 from "@/content/labs/cli/lab-008-loopback-and-serial.json";
import lab009 from "@/content/labs/cli/lab-009-banner-and-motd.json";
import lab010 from "@/content/labs/cli/lab-010-full-router-setup.json";

type LabDef = {
  id: string;
  title: string;
  domain: string;
  difficulty: string;
  estimatedMinutes: number;
  scenario: string;
  initialState?: Partial<DeviceState>;
  tasks: Array<{
    id: string;
    description: string;
    hint?: string;
  }>;
};

const CLI_LABS: Record<string, LabDef> = {
  "lab-001": lab001 as LabDef,
  "lab-002": lab002 as LabDef,
  "lab-003": lab003 as LabDef,
  "lab-004": lab004 as LabDef,
  "lab-005": lab005 as LabDef,
  "lab-006": lab006 as LabDef,
  "lab-007": lab007 as LabDef,
  "lab-008": lab008 as LabDef,
  "lab-009": lab009 as LabDef,
  "lab-010": lab010 as LabDef,
};

import { useEffect } from "react";

export default function CliLabPage({ params }: { params: Promise<{ labId: string }> }) {
  const { labId } = use(params);
  const [lab, setLab] = useState<LabDef | null>(null);
  const [deviceState, setDeviceState] = useState<DeviceState | null>(null);
  const [taskResults, setTaskResults] = useState<Record<string, TaskResult>>({});
  const [isGrading, setIsGrading] = useState(false);
  const [allPassed, setAllPassed] = useState(false);
  const [activeTab, setActiveTab] = useState<"instructions" | "grading">("instructions");

  useEffect(() => {
    setLab(CLI_LABS[labId] ?? null);
  }, [labId]);

  useEffect(() => {
    trackUsage("lab_opened", { labId, labType: "cli" });
  }, [labId]);

  useEffect(() => {
    if (!lab) return;
    const initialState = lab.initialState as Partial<DeviceState> | undefined;
    setDeviceState({
      ...createDevice(initialState?.hostname ?? "Router"),
      ...(initialState ?? {}),
    });
  }, [lab]);

  const handleStateChange = useCallback((state: DeviceState) => {
    setDeviceState(state);
  }, []);

  const handleGrade = useCallback(async () => {
    if (!deviceState || !lab) return;
    setIsGrading(true);
    try {
      const res = await fetch("/api/grade-lab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labId: lab.id, labType: "cli", deviceState }),
      });
      if (!res.ok) throw new Error("Failed to grade lab");
      const data = await res.json();
      setTaskResults(data.taskResults ?? {});
      setAllPassed(data.allPassed ?? false);
      setActiveTab("grading");
    } catch (error) {
      console.error("[cli-lab:grade]", error);
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
  }, [deviceState, lab]);

  if (!lab) {
    return (
      <div className="min-h-screen bg-[#080b10] flex items-center justify-center">
        <div className="text-teal-500 animate-pulse font-mono">Loading lab...</div>
      </div>
    );
  }

  const initialState = lab.initialState as Partial<DeviceState> | undefined;
  const nextLab = getNextLab(lab.id, "cli");

  return (
    <div className="min-h-screen bg-[#080b10] flex flex-col lg:h-screen lg:overflow-hidden">
      {/* Top bar */}
      <div className="flex flex-shrink-0 flex-wrap items-center gap-2 border-b border-zinc-800/60 bg-zinc-950/80 px-3 py-2.5 backdrop-blur-sm sm:flex-nowrap sm:gap-4 sm:px-4">
        <Link
          href="/labs"
          className="flex w-full items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-white sm:w-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to labs
        </Link>
        <div className="hidden h-4 w-px bg-zinc-800 sm:block" />
        <div className="flex min-w-0 items-center gap-2">
          <Terminal className="w-4 h-4 text-teal-500" />
          <span className="text-white font-semibold text-sm truncate">{lab.title}</span>
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs text-zinc-500">
          <span className="hidden sm:block capitalize">{lab.domain.replace(/-/g, " ")}</span>
          <span className="hidden sm:block">·</span>
          <span>{lab.estimatedMinutes} min</span>
        </div>
      </div>

      {/* Main layout: instructions left (40%) + terminal right (60%) */}
      <div className="flex flex-1 flex-col lg:min-h-0 lg:flex-row">
        {/* Left panel — instructions + grading */}
        <div className="flex max-h-[48vh] min-h-[360px] w-full flex-col border-b border-zinc-800/60 bg-zinc-950/40 lg:max-h-none lg:min-h-0 lg:w-[40%] lg:min-w-[320px] lg:border-b-0 lg:border-r">
          {/* Tab bar */}
          <div className="flex-shrink-0 flex border-b border-zinc-800/60">
            <button
              onClick={() => setActiveTab("instructions")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors",
                activeTab === "instructions"
                  ? "text-teal-400 border-b-2 border-teal-500"
                  : "text-zinc-500 hover:text-zinc-300",
              )}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Instructions
            </button>
            <button
              onClick={() => setActiveTab("grading")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors",
                activeTab === "grading"
                  ? "text-teal-400 border-b-2 border-teal-500"
                  : "text-zinc-500 hover:text-zinc-300",
              )}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Check Work
              {Object.keys(taskResults).length > 0 && (
                <span
                  className={cn(
                    "ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                    allPassed ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400",
                  )}
                >
                  {Object.values(taskResults).filter((r) => r.passed).length}/
                  {lab.tasks.length}
                </span>
              )}
            </button>
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === "instructions" ? (
              <LabInstructions
                id={lab.id}
                title={lab.title}
                scenario={lab.scenario}
                tasks={lab.tasks}
                taskResults={taskResults}
                domain={lab.domain}
                difficulty={lab.difficulty as "beginner" | "intermediate" | "advanced"}
                estimatedMinutes={lab.estimatedMinutes}
              />
            ) : (
              <GradingPanel
                taskResults={taskResults}
                tasks={lab.tasks}
                isGrading={isGrading}
                onGrade={handleGrade}
                allPassed={allPassed}
                labId={lab.id}
                labType="cli"
                nextLab={nextLab}
                commonMisses={COMMON_LAB_MISSES[lab.id] ?? []}
                onBackToTasks={() => setActiveTab("instructions")}
              />
            )}
          </div>

          {/* Grade button always visible at bottom */}
          {activeTab === "instructions" && (
            <div className="flex-shrink-0 p-3 border-t border-zinc-800/60">
              <button
                onClick={handleGrade}
                disabled={isGrading}
                className="w-full py-2 px-4 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-teal-300 text-sm font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGrading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
                    Grading...
                  </>
                ) : (
                  "Check My Work"
                )}
              </button>
            </div>
          )}
        </div>

        {/* Right panel — terminal */}
        <div className="flex min-h-[70vh] flex-1 flex-col gap-2 p-3 lg:min-h-0 lg:min-w-0">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>
            <span className="text-xs text-zinc-500 font-mono">cisco-ios-simulator</span>
          </div>
          <CiscoTerminal
            initialState={initialState}
            onStateChange={handleStateChange}
            className="flex-1 min-h-0 rounded-lg overflow-hidden"
          />
        </div>
      </div>
    </div>
  );
}
