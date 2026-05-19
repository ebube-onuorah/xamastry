"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  getCorrectAnswers,
  getRequiredAnswerCount,
  isMultiAnswerQuestion,
  type AnswerSelection,
  type Question,
} from "@/lib/questions";
import ReportIssue from "@/components/ReportIssue";

interface QuestionCardProps {
  question: Question;
  selected: AnswerSelection;
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
  const correctAnswers = getCorrectAnswers(question);
  const requiredAnswers = getRequiredAnswerCount(question);
  const isMultiAnswer = isMultiAnswerQuestion(question);

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
    const isSelected = selected.includes(letter);
    const isCorrect = correctAnswers.includes(letter);
    if (!revealed) return isSelected ? "selected" : "default";
    if (isCorrect) return "correct";
    if (isSelected) return "wrong";
    return "dim";
  }

  const stateClasses: Record<string, string> = {
    default: "border-zinc-200 bg-white hover:border-black cursor-pointer",
    selected: "border-black bg-zinc-100 cursor-pointer",
    correct: "border-emerald-600 bg-emerald-50",
    wrong: "border-red-600 bg-red-50",
    dim: "border-zinc-100 bg-white opacity-40",
  };

  const letterClasses: Record<string, string> = {
    default: "bg-zinc-100 text-zinc-500",
    selected: "bg-black text-white",
    correct: "bg-emerald-600 text-white",
    wrong: "bg-red-600 text-white",
    dim: "bg-zinc-100 text-zinc-400",
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
          Q{index + 1} / {total}
        </span>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="border border-zinc-300 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            {question.difficulty}
          </span>
          <span className="border border-zinc-300 px-2 py-0.5 font-mono text-[10px] text-zinc-500">
            obj {question.objective}
          </span>
          <span className="border border-zinc-300 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            {isMultiAnswer ? `select ${requiredAnswers}` : "select 1"}
          </span>
        </div>
      </div>

      <p className="mb-6 text-base leading-8 text-black">{question.text}</p>

      <div className="grid gap-2">
        {question.options.map((option, i) => {
          const letter = LETTERS[i];
          const state = optionState(letter);
          return (
            <button
              key={letter}
              disabled={revealed}
              onClick={() => onSelect(letter)}
              className={cn(
                "border p-4 text-left text-sm transition-all flex items-start gap-3",
                stateClasses[state],
              )}
            >
              <span
                className={cn(
                  "inline-flex size-5 shrink-0 items-center justify-center font-mono text-xs font-bold",
                  letterClasses[state],
                )}
              >
                {letter}
              </span>
              <span
                className={cn(
                  "text-sm leading-6",
                  state === "dim" ? "text-zinc-400" : "text-black",
                )}
              >
                {option.replace(/^[A-D]\.\s*/, "")}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-4 font-mono text-[10px] text-zinc-400 uppercase tracking-widest">
        {isMultiAnswer ? `Choose exactly ${requiredAnswers} options. ` : "Choose one option. "}
        Press <kbd className="border border-zinc-300 px-1 py-0.5">1</kbd>-
        <kbd className="border border-zinc-300 px-1 py-0.5">4</kbd> to select.
      </p>
      <ReportIssue contentType="question" contentId={question.id} />
    </div>
  );
}
