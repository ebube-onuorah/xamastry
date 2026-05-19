"use client";

import { CheckCircle2, Lightbulb, BookOpen, XCircle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import ReportIssue from "@/components/ReportIssue";

export interface LabTask {
  id: string;
  description: string;
  hint?: string;
}

interface LabInstructionsProps {
  id: string;
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
  id,
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
        <ReportIssue contentType="lab" contentId={id} label="Report lab issue" tone="dark" />
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
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">Tasks</h3>
        <ol className="divide-y divide-zinc-800 border-y border-zinc-800">
          {tasks.map((task, idx) => {
            const result = taskResults[task.id];
            const isPassed = result?.passed === true;
            const isFailed = result !== undefined && !result.passed;
            const isHintOpen = expandedHint === task.id;

            return (
              <li key={task.id} className="py-2.5">
                <div className="grid grid-cols-[1.75rem_1fr_auto] items-start gap-2">
                  <span
                    className={cn(
                      "pt-0.5 font-mono text-xs tabular-nums",
                      isPassed ? "text-emerald-400" : isFailed ? "text-red-400" : "text-zinc-500",
                    )}
                  >
                    {idx + 1}.
                  </span>

                  <div className="min-w-0">
                    <p
                      className={cn(
                        "text-sm leading-snug",
                        isPassed ? "text-emerald-300" : isFailed ? "text-red-300" : "text-zinc-200",
                      )}
                    >
                      {task.description}
                    </p>

                    {result && (
                      <p
                        className={cn(
                          "mt-1 text-xs leading-relaxed",
                          isPassed ? "text-emerald-500/75" : "text-red-400/80",
                        )}
                      >
                        {result.message}
                      </p>
                    )}

                    {isHintOpen && task.hint && (
                      <div className="mt-2 border border-yellow-500/20 bg-yellow-500/10 p-2 text-xs leading-relaxed text-yellow-300/90">
                        <span className="font-semibold text-yellow-400">Hint: </span>
                        {task.hint}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-0.5">
                    {isPassed && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                    {isFailed && <XCircle className="h-4 w-4 text-red-400" />}
                    {task.hint && !isPassed && (
                      <button
                        onClick={() => setExpandedHint(isHintOpen ? null : task.id)}
                        className="text-yellow-500/70 transition-colors hover:text-yellow-400"
                        title="Show hint"
                      >
                        <Lightbulb className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
