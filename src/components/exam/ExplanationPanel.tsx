"use client";

import { useState } from "react";
import { X, Loader2, Sparkles } from "lucide-react";

const AI_DAILY_LIMIT = 5;

function getLocalUsedToday(): number {
  if (typeof window === "undefined") return 0;
  const today = new Date().toISOString().slice(0, 10);
  const key = `xamastry-ai-${today}`;
  return parseInt(localStorage.getItem(key) ?? "0", 10);
}

function incrementLocalUsed(): number {
  const today = new Date().toISOString().slice(0, 10);
  const key = `xamastry-ai-${today}`;
  const next = getLocalUsedToday() + 1;
  localStorage.setItem(key, String(next));
  return next;
}

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
  const [limitReached, setLimitReached] = useState(false);
  const [usedToday, setUsedToday] = useState(() => getLocalUsedToday());
  const [aiRequested, setAiRequested] = useState(false);

  const wrong = studentAnswer !== correctAnswer;
  const remaining = Math.max(0, AI_DAILY_LIMIT - usedToday);

  async function requestAiExplanation() {
    if (loading || aiRequested) return;
    if (usedToday >= AI_DAILY_LIMIT) {
      setLimitReached(true);
      return;
    }

    setLoading(true);
    setAiRequested(true);

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, studentAnswer }),
      });

      if (res.status === 429) {
        setLimitReached(true);
        setAiRequested(false);
        return;
      }

      if (!res.ok) throw new Error("API error");

      const data = await res.json();
      setAiText(data.explanation ?? null);
      const next = incrementLocalUsed();
      setUsedToday(next);
    } catch {
      setAiText(null);
      setAiRequested(false);
    } finally {
      setLoading(false);
    }
  }

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

      {/* Static explanation — always visible */}
      <div className="border border-zinc-200 bg-zinc-50 p-4 text-sm leading-7 text-zinc-700">
        {staticExplanation}
      </div>

      {/* AI explanation — wrong answers only, explicit opt-in */}
      {wrong && (
        <div className="mt-4">
          <div className="mb-3 flex items-center justify-between border-b border-zinc-200 pb-2">
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-black">
              AI Tutor · Groq / llama-3.3-70b
            </p>
            <p className="font-mono text-[10px] text-zinc-400">
              {remaining} / {AI_DAILY_LIMIT} remaining today
            </p>
          </div>

          {/* Not yet requested — show the button */}
          {!aiRequested && !limitReached && (
            <button
              onClick={requestAiExplanation}
              disabled={remaining === 0}
              className="flex items-center gap-2 border border-black px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest text-black transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:border-zinc-200 disabled:text-zinc-300"
            >
              <Sparkles size={12} />
              {remaining === 0
                ? "Daily limit reached"
                : `Get AI explanation · ${remaining} left today`}
            </button>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
              <Loader2 size={13} className="animate-spin" />
              Generating explanation…
            </div>
          )}

          {/* Limit reached (from server 429 or local check) */}
          {limitReached && (
            <div className="border border-zinc-200 bg-zinc-50 p-4">
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-red-600">
                Daily limit reached
              </p>
              <p className="mt-1 font-sans text-sm text-zinc-600">
                You&apos;ve used all {AI_DAILY_LIMIT} AI explanations for today. Resets at midnight UTC.
                In the meantime, the explanation above and the reference below cover the concept.
              </p>
            </div>
          )}

          {/* AI text returned */}
          {!loading && aiText && (
            <div className="whitespace-pre-line text-sm leading-7 text-zinc-700">
              {aiText}
            </div>
          )}

          {/* Fetch failed (not a limit error) */}
          {!loading && aiRequested && !aiText && !limitReached && (
            <p className="font-mono text-xs text-zinc-400">
              Could not load AI explanation. Check your connection.
            </p>
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
