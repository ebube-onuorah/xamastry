"use client";

import { CheckCircle2, XCircle, Trophy, RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
}

export default function GradingPanel({
  taskResults,
  tasks,
  isGrading,
  onGrade,
  allPassed,
}: GradingPanelProps) {
  const passedCount = Object.values(taskResults).filter((r) => r.passed).length;
  const gradedCount = Object.keys(taskResults).length;

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

      {/* Per-task results */}
      {gradedCount > 0 && (
        <div className="space-y-1.5">
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

      {/* Completion banner */}
      {allPassed && (
        <div className="mt-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-center">
          <Trophy className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
          <p className="text-emerald-300 font-semibold text-sm">Lab Complete!</p>
          <p className="text-emerald-400/60 text-xs mt-0.5">All tasks passed successfully</p>
        </div>
      )}
    </div>
  );
}
