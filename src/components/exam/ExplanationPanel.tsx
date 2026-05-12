"use client";

import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";

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
    <aside className="flex flex-col border-2 border-black bg-[#fafafa] p-5">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className={`font-mono text-[10px] font-bold uppercase tracking-widest ${wrong ? "text-red-600" : "text-emerald-600"}`}>
            {wrong ? "Incorrect" : "Correct"}
          </p>
          <p className="mt-1 font-mono text-sm font-bold text-black">
            Correct answer:{" "}
            <span className="text-emerald-700">{correctAnswer}</span>
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-zinc-400 hover:bg-zinc-100 hover:text-black transition-colors"
        >
          <X size={15} />
        </button>
      </div>

      {/* Static explanation */}
      <div className="border border-zinc-200 bg-zinc-50 p-4 text-sm leading-7 text-zinc-700">
        {staticExplanation}
      </div>

      {/* AI explanation — wrong answers only */}
      {wrong && (
        <div className="mt-4 flex-1">
          <div className="mb-3 border-b border-zinc-200 pb-2">
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-black">
              AI Tutor · Groq / llama-3.3-70b
            </p>
          </div>
          {loading ? (
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
              <Loader2 size={13} className="animate-spin" />
              Generating explanation…
            </div>
          ) : aiText ? (
            <div className="whitespace-pre-line text-sm leading-7 text-zinc-700">
              {aiText}
            </div>
          ) : (
            <p className="font-mono text-xs text-zinc-400">AI explanation unavailable.</p>
          )}
        </div>
      )}

      {reference && (
        <p className="mt-4 border-t border-zinc-200 pt-3 font-mono text-[10px] uppercase tracking-widest text-zinc-400">
          Ref: {reference}
        </p>
      )}
    </aside>
  );
}
