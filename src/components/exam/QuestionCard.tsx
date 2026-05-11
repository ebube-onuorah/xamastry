"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import type { Question } from "@/lib/questions";

interface QuestionCardProps {
  question: Question;
  selected: string | null;
  revealed: boolean;
  onSelect: (letter: string) => void;
  index: number;
  total: number;
}

const LETTERS = ["A", "B", "C", "D"] as const;

export default function QuestionCard({
  question,
  selected,
  revealed,
  onSelect,
  index,
  total,
}: QuestionCardProps) {
  // Keyboard shortcuts: 1-4 to select, Enter already handled in parent
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (revealed) return;
      if (e.key === "1") onSelect("A");
      if (e.key === "2") onSelect("B");
      if (e.key === "3") onSelect("C");
      if (e.key === "4") onSelect("D");
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [revealed, onSelect]);

  function optionState(letter: string) {
    if (!revealed) {
      return selected === letter ? "selected" : "default";
    }
    if (letter === question.correct) return "correct";
    if (letter === selected && selected !== question.correct) return "wrong";
    return "dim";
  }

  const stateClasses: Record<string, string> = {
    default: "border-white/10 bg-slate-950/60 hover:border-teal-300/50 hover:bg-slate-900 cursor-pointer",
    selected: "border-teal-300/70 bg-teal-300/10 cursor-pointer",
    correct: "border-emerald-400/70 bg-emerald-400/10",
    wrong: "border-red-400/70 bg-red-400/10",
    dim: "border-white/5 bg-slate-950/30 opacity-50",
  };

  return (
    <div>
      {/* Progress + meta */}
      <div className="mb-6 flex items-center justify-between text-sm text-slate-400">
        <span>
          Question <span className="font-semibold text-white">{index + 1}</span> of {total}
        </span>
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-white/8 px-2 py-0.5 text-xs capitalize">
            {question.difficulty}
          </span>
          <span className="rounded-md bg-white/8 px-2 py-0.5 text-xs">
            {question.objective}
          </span>
        </div>
      </div>

      {/* Question text */}
      <p className="mb-6 text-lg leading-8 text-white">{question.text}</p>

      {/* Options */}
      <div className="grid gap-3">
        {question.options.map((option, i) => {
          const letter = LETTERS[i];
          const state = optionState(letter);
          return (
            <button
              key={letter}
              disabled={revealed}
              onClick={() => onSelect(letter)}
              className={cn(
                "rounded-md border p-4 text-left text-sm transition-all",
                stateClasses[state],
              )}
            >
              <span
                className={cn(
                  "mr-3 inline-flex size-5 shrink-0 items-center justify-center rounded text-xs font-bold",
                  state === "correct"
                    ? "bg-emerald-400 text-slate-950"
                    : state === "wrong"
                    ? "bg-red-400 text-slate-950"
                    : state === "selected"
                    ? "bg-teal-300 text-slate-950"
                    : "bg-white/10 text-slate-300",
                )}
              >
                {letter}
              </span>
              <span className={state === "dim" ? "text-slate-500" : "text-slate-200"}>
                {option.replace(/^[A-D]\.\s*/, "")}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-slate-600">
        Press <kbd className="rounded bg-white/10 px-1 py-0.5 font-mono">1</kbd>–
        <kbd className="rounded bg-white/10 px-1 py-0.5 font-mono">4</kbd> to select ·{" "}
        <kbd className="rounded bg-white/10 px-1 py-0.5 font-mono">Enter</kbd> to submit
      </p>
    </div>
  );
}
