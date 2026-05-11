"use client";

import { CheckCircle2, Circle, Lightbulb, BookOpen } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface LabTask {
  id: string;
  description: string;
  hint?: string;
}

interface LabInstructionsProps {
  title: string;
  scenario: string;
  tasks: LabTask[];
  taskResults: Record<string, { passed: boolean; message: string }>;
  domain: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;
}

const difficultyColors = {
  beginner: "text-emerald-400 bg-emerald-400/10",
  intermediate: "text-yellow-400 bg-yellow-400/10",
  advanced: "text-red-400 bg-red-400/10",
};

export default function LabInstructions({
  title,
  scenario,
  tasks,
  taskResults,
  domain,
  difficulty,
  estimatedMinutes,
}: LabInstructionsProps) {
  const [expandedHint, setExpandedHint] = useState<string | null>(null);

  const passedCount = Object.values(taskResults).filter((r) => r.passed).length;
  const totalGraded = Object.keys(taskResults).length;

  return (
    <div className="flex flex-col h-full overflow-y-auto space-y-4 pr-1">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span
            className={cn(
              "text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide",
              difficultyColors[difficulty],
            )}
          >
            {difficulty}
          </span>
          <span className="text-xs text-zinc-500">{estimatedMinutes} min</span>
          <span className="text-xs text-zinc-500">·</span>
          <span className="text-xs text-zinc-500 capitalize">{domain.replace(/-/g, " ")}</span>
        </div>
        <h2 className="text-lg font-bold text-white leading-tight">{title}</h2>
      </div>

      {/* Scenario */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-teal-400 uppercase tracking-wide">
          <BookOpen className="w-3.5 h-3.5" />
          Scenario
        </div>
        <p className="text-sm text-zinc-300 leading-relaxed">{scenario}</p>
      </div>

      {/* Progress */}
      {totalGraded > 0 && (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-3">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-zinc-400">Progress</span>
            <span className="text-teal-400 font-semibold">
              {passedCount}/{tasks.length} tasks
            </span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${(passedCount / tasks.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Tasks */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Tasks</h3>
        {tasks.map((task, idx) => {
          const result = taskResults[task.id];
          const isPassed = result?.passed === true;
          const isFailed = result !== undefined && !result.passed;
          const isHintOpen = expandedHint === task.id;

          return (
            <div
              key={task.id}
              className={cn(
                "border rounded-lg p-3 transition-all duration-200",
                isPassed
                  ? "border-emerald-500/40 bg-emerald-500/5"
                  : isFailed
                    ? "border-red-500/40 bg-red-500/5"
                    : "border-zinc-800 bg-zinc-900/40",
              )}
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 flex-shrink-0">
                  {isPassed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Circle
                      className={cn("w-4 h-4", isFailed ? "text-red-400" : "text-zinc-600")}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={cn(
                        "text-sm leading-snug",
                        isPassed ? "text-emerald-300" : isFailed ? "text-red-300" : "text-zinc-200",
                      )}
                    >
                      <span className="text-zinc-500 mr-1.5 text-xs font-mono">{idx + 1}.</span>
                      {task.description}
                    </p>
                    {task.hint && !isPassed && (
                      <button
                        onClick={() => setExpandedHint(isHintOpen ? null : task.id)}
                        className="flex-shrink-0 text-yellow-500/70 hover:text-yellow-400 transition-colors"
                        title="Show hint"
                      >
                        <Lightbulb className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Feedback message */}
                  {result && !isPassed && (
                    <p className="mt-1 text-xs text-red-400/80">{result.message}</p>
                  )}
                  {isPassed && result?.message && (
                    <p className="mt-1 text-xs text-emerald-500/70">{result.message}</p>
                  )}

                  {/* Hint */}
                  {isHintOpen && task.hint && (
                    <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-300/90 leading-relaxed">
                      <span className="font-semibold text-yellow-400">Hint: </span>
                      {task.hint}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
