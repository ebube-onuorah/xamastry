"use client";

import { useEffect, useState } from "react";
import { X, Loader2, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExplanationPanelProps {
  questionId: string;
  studentAnswer: string;
  correctAnswer: string;
  staticExplanation: string;
  reference?: string;
  onClose: () => void;
}

export default function ExplanationPanel({
  questionId,
  studentAnswer,
  correctAnswer,
  staticExplanation,
  reference,
  onClose,
}: ExplanationPanelProps) {
  const [aiText, setAiText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const wrong = studentAnswer !== correctAnswer;

  // Only hit Groq when the student got it wrong
  useEffect(() => {
    if (!wrong) return;
    setLoading(true);
    fetch("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId, studentAnswer }),
    })
      .then((r) => r.json())
      .then((d) => setAiText(d.explanation ?? null))
      .catch(() => setAiText(null))
      .finally(() => setLoading(false));
  }, [questionId, studentAnswer, wrong]);

  return (
    <aside className="flex flex-col rounded-lg border border-white/10 bg-slate-950/80 p-5 backdrop-blur">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className={cn("text-xs font-semibold uppercase tracking-wider", wrong ? "text-red-400" : "text-emerald-400")}>
            {wrong ? "Incorrect" : "Correct"}
          </p>
          <p className="mt-1 text-sm font-semibold text-white">
            Correct answer: <span className="text-teal-300">{correctAnswer}</span>
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-slate-400 hover:bg-white/10 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>

      {/* Static explanation always shown */}
      <div className="rounded-md border border-white/8 bg-white/[0.03] p-4 text-sm leading-7 text-slate-300">
        {staticExplanation}
      </div>

      {/* AI explanation — only for wrong answers */}
      {wrong && (
        <div className="mt-4 flex-1">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-teal-200">
            <BookOpen size={13} />
            AI Tutor explanation
          </div>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Loader2 size={14} className="animate-spin" />
              Generating explanation…
            </div>
          ) : aiText ? (
            <div className="whitespace-pre-line text-sm leading-7 text-slate-300">
              {aiText}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Could not load AI explanation.</p>
          )}
        </div>
      )}

      {reference && (
        <p className="mt-4 border-t border-white/10 pt-3 text-xs text-slate-500">
          📖 {reference}
        </p>
      )}
    </aside>
  );
}
