"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, RotateCcw } from "lucide-react";
import QuestionCard from "@/components/exam/QuestionCard";
import ExplanationPanel from "@/components/exam/ExplanationPanel";
import { ALL_QUESTIONS, type Question } from "@/lib/questions";
import { cn } from "@/lib/utils";

const PRACTICE_COUNT = 20;

function shuffled<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function PracticePage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [done, setDone] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const startTime = useRef<number>(Date.now());

  // Load questions + create session on mount
  useEffect(() => {
    const qs = shuffled(ALL_QUESTIONS).slice(0, PRACTICE_COUNT);
    setQuestions(qs);

    // Create session (best-effort — works only when DB is configured)
    fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "practice", totalQuestions: PRACTICE_COUNT }),
    })
      .then((r) => r.json())
      .then((d) => setSessionId(d.sessionId ?? null))
      .catch(() => null);
  }, []);

  // Keyboard: Enter to submit/advance
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Enter") {
        if (!revealed && selected) handleSubmit();
        else if (revealed) handleNext();
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const handleSubmit = useCallback(() => {
    if (!selected || revealed) return;
    const q = questions[index];
    const correct = selected === q.correct;
    const timeMs = Date.now() - startTime.current;

    setRevealed(true);
    setShowPanel(true);
    setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));

    // Save answer + update SM-2 (best-effort)
    if (sessionId) {
      fetch("/api/session", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "answer",
          sessionId,
          questionId: q.id,
          domain: q.domain,
          objective: q.objective,
          selected,
          correct,
          timeMs,
        }),
      }).catch(() => null);
    }

    fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: q.id, correct, timeMs }),
    }).catch(() => null);
  }, [selected, revealed, questions, index, sessionId]);

  function handleNext() {
    if (index + 1 >= questions.length) {
      // Complete session
      if (sessionId) {
        const domainScores: Record<string, number> = {};
        fetch("/api/session", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "complete",
            sessionId,
            correctAnswers: score.correct + (selected === questions[index].correct ? 1 : 0),
            domainScores,
          }),
        }).catch(() => null);
      }
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setRevealed(false);
    setShowPanel(false);
    startTime.current = Date.now();
  }

  function restart() {
    setQuestions(shuffled(ALL_QUESTIONS).slice(0, PRACTICE_COUNT));
    setIndex(0);
    setSelected(null);
    setRevealed(false);
    setShowPanel(false);
    setScore({ correct: 0, total: 0 });
    setDone(false);
    setSessionId(null);
    startTime.current = Date.now();
  }

  if (questions.length === 0) {
    return (
      <main className="min-h-screen bg-[#080b10] flex items-center justify-center text-slate-400">
        Loading questions…
      </main>
    );
  }

  // ── Done screen ──
  if (done) {
    const pct = Math.round((score.correct / score.total) * 100);
    const pass = pct >= 83; // ~825/1000
    return (
      <main className="min-h-screen bg-[#080b10] px-5 py-12 text-slate-100 sm:px-8">
        <div className="mx-auto max-w-xl text-center">
          <CheckCircle2
            size={56}
            className={cn("mx-auto mb-6", pass ? "text-emerald-400" : "text-amber-400")}
          />
          <h1 className="text-4xl font-semibold">Practice complete</h1>
          <p className="mt-3 text-slate-400">
            You scored{" "}
            <span className={cn("font-bold text-xl", pass ? "text-emerald-300" : "text-amber-300")}>
              {score.correct}/{score.total}
            </span>{" "}
            ({pct}%)
          </p>
          <p className={cn("mt-2 text-sm", pass ? "text-emerald-400" : "text-amber-400")}>
            {pass
              ? "Great work — you're on track for the exam!"
              : "Keep practising — focus on your weak objectives."}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              onClick={restart}
              className="flex items-center gap-2 rounded-md bg-teal-300 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-teal-200"
            >
              <RotateCcw size={15} />
              Practice again
            </button>
            <Link
              href="/dashboard"
              className="rounded-md border border-white/15 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10"
            >
              View dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const q = questions[index];

  return (
    <main className="min-h-screen bg-[#080b10] px-5 py-8 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Nav bar */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold text-teal-200 hover:text-teal-100">
            ← Xamastry
          </Link>
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <span className="text-emerald-400 font-semibold">{score.correct} correct</span>
            <span>/</span>
            <span>{score.total} answered</span>
          </div>
        </div>

        {/* Domain badge */}
        <div className="mb-4">
          <span className="rounded-md border border-teal-300/30 bg-teal-300/10 px-3 py-1 text-xs font-semibold text-teal-200">
            {q.domain.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          </span>
        </div>

        {/* Main layout */}
        <div className={cn("grid gap-6", showPanel ? "lg:grid-cols-[1fr_420px]" : "max-w-3xl")}>
          {/* Question card */}
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <QuestionCard
              question={q}
              selected={selected}
              revealed={revealed}
              onSelect={(l) => !revealed && setSelected(l)}
              index={index}
              total={questions.length}
            />

            {/* Action buttons */}
            <div className="mt-8 flex items-center gap-3">
              {!revealed ? (
                <button
                  disabled={!selected}
                  onClick={handleSubmit}
                  className="rounded-md bg-teal-300 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Submit answer
                </button>
              ) : (
                <>
                  {!showPanel && (
                    <button
                      onClick={() => setShowPanel(true)}
                      className="rounded-md border border-teal-300/40 px-4 py-2.5 text-sm font-semibold text-teal-200 hover:bg-teal-300/10"
                    >
                      Why?
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 rounded-md bg-teal-300 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-teal-200"
                  >
                    {index + 1 >= questions.length ? "Finish" : "Next question"}
                    <ArrowRight size={15} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Explanation panel */}
          {showPanel && revealed && (
            <ExplanationPanel
              questionId={q.id}
              studentAnswer={selected ?? ""}
              correctAnswer={q.correct}
              staticExplanation={q.explanation}
              reference={q.reference}
              onClose={() => setShowPanel(false)}
            />
          )}
        </div>
      </div>
    </main>
  );
}
