"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, XCircle, Trophy, RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackUsage } from "@/components/UsageTracker";
import type { LabProgressionItem } from "@/lib/labs/progression";

export interface TaskResult {
  passed: boolean;
  message: string;
}

interface GradingPanelProps {
  taskResults: Record<string, TaskResult>;
  tasks: Array<{ id: string; description: string }>;
  isGrading: boolean;
  onGrade: () => void;
  allPassed: boolean;
  labId: string;
  labType: "cli" | "topology";
  nextLab?: LabProgressionItem | null;
}

export default function GradingPanel({
  taskResults,
  tasks,
  isGrading,
  onGrade,
  allPassed,
  labId,
  labType,
  nextLab,
}: GradingPanelProps) {
  const passedCount = Object.values(taskResults).filter((r) => r.passed).length;
  const gradedCount = Object.keys(taskResults).length;
  const taskIds = new Set(tasks.map((task) => task.id));
  const generalResults = Object.entries(taskResults).filter(([id]) => !taskIds.has(id));
  const attempted = gradedCount > 0;
  const close = attempted && !allPassed && tasks.length > 0 && passedCount >= Math.max(1, tasks.length - 1);

  return (
    <div className="flex flex-col gap-3">
      {/* Grade button */}
      <button
        onClick={onGrade}
        disabled={isGrading}
        className={cn(
          "w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-200",
          allPassed
            ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 cursor-default"
            : "bg-teal-500/20 border border-teal-500/40 text-teal-300 hover:bg-teal-500/30 hover:border-teal-500/60",
        )}
      >
        {isGrading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Grading...
          </>
        ) : allPassed ? (
          <>
            <Trophy className="w-4 h-4" />
            All Tasks Passed!
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4" />
            Check My Work
          </>
        )}
      </button>

      {/* Score bar */}
      {gradedCount > 0 && (
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-zinc-400">Score</span>
            <span className={cn("font-semibold", allPassed ? "text-emerald-400" : "text-teal-400")}>
              {passedCount}/{tasks.length}
            </span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700",
                allPassed ? "bg-emerald-500" : "bg-teal-500",
              )}
              style={{ width: `${tasks.length > 0 ? (passedCount / tasks.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {attempted && (
        <div
          className={cn(
            "border p-3",
            allPassed
              ? "border-emerald-500/30 bg-emerald-500/10"
              : close
                ? "border-yellow-500/30 bg-yellow-500/10"
                : "border-zinc-800 bg-zinc-900/60",
          )}
        >
          <p
            className={cn(
              "font-mono text-[10px] font-bold uppercase tracking-widest",
              allPassed ? "text-emerald-300" : close ? "text-yellow-300" : "text-zinc-400",
            )}
          >
            {allPassed ? "Lab complete" : close ? "Almost there" : "Keep going"}
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            {allPassed
              ? "Nice work. Your final device state passed every task."
              : close
                ? "You are one step away. Open the failed task, compare the expected state, and check again."
                : "Use the failed task messages as your checklist. Most lab misses come from interface status, subnet details, or applying config in the wrong mode."}
          </p>
          {nextLab && (
            <Link
              href={nextLab.href}
              onClick={() => {
                trackUsage("next_lab_clicked", {
                  fromLabId: labId,
                  fromLabType: labType,
                  toLabId: nextLab.id,
                  toLabType: nextLab.type,
                  allPassed,
                  passedTasks: passedCount,
                  totalTasks: tasks.length,
                });
              }}
              className={cn(
                "mt-3 flex items-center justify-between gap-3 border px-3 py-2.5 transition-colors",
                allPassed
                  ? "border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/10"
                  : "border-zinc-700 text-zinc-200 hover:border-teal-500/60 hover:bg-teal-500/10",
              )}
            >
              <span className="min-w-0">
                <span className="block font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                  Next lab
                </span>
                <span className="mt-1 block truncate text-sm font-semibold">{nextLab.title}</span>
                <span className="mt-0.5 block text-xs text-zinc-500">{nextLab.focus}</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
          )}
        </div>
      )}

      {/* Per-task results */}
      {gradedCount > 0 && (
        <div className="space-y-1.5">
          {generalResults.map(([id, result]) => (
            <div
              key={id}
              className={cn(
                "flex items-start gap-2 p-2 rounded-md text-xs",
                result.passed
                  ? "bg-emerald-500/8 border border-emerald-500/20"
                  : "bg-red-500/8 border border-red-500/20",
              )}
            >
              {result.passed ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <span className={result.passed ? "text-emerald-300/80" : "text-red-300/80"}>
                {result.message}
              </span>
            </div>
          ))}

          {tasks.map((task) => {
            const result = taskResults[task.id];
            if (!result) return null;
            return (
              <div
                key={task.id}
                className={cn(
                  "flex items-start gap-2 p-2 rounded-md text-xs",
                  result.passed
                    ? "bg-emerald-500/8 border border-emerald-500/20"
                    : "bg-red-500/8 border border-red-500/20",
                )}
              >
                {result.passed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <span className={result.passed ? "text-emerald-300/80" : "text-red-300/80"}>
                  {result.message}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {allPassed && (
        <div className="mt-2 border border-emerald-500/30 bg-emerald-500/10 p-3 text-center">
          <Trophy className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
          <p className="text-emerald-300 font-semibold text-sm">Lab Complete!</p>
          <p className="text-emerald-400/60 text-xs mt-0.5">All tasks passed successfully.</p>
        </div>
      )}
    </div>
  );
}
