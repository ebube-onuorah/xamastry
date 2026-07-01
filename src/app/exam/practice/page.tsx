"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw } from "lucide-react";
import QuestionCard from "@/components/exam/QuestionCard";
import ExplanationPanel from "@/components/exam/ExplanationPanel";
import BackButton from "@/components/nav/BackButton";
import ThemeToggle from "@/components/nav/ThemeToggle";
import {
  ALL_QUESTIONS,
  formatAnswer,
  getRequiredAnswerCount,
  isAnswerCorrect,
  isMultiAnswerQuestion,
  type AnswerSelection,
  type Question,
} from "@/lib/questions";
import { cn } from "@/lib/utils";

const PRACTICE_COUNT = 20;

function shuffled<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function PracticePage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<AnswerSelection>([]);
  const [revealed, setRevealed] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [done, setDone] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const startTime = useRef<number>(Date.now());

  useEffect(() => {
    const qs = shuffled(ALL_QUESTIONS).slice(0, PRACTICE_COUNT);
    setQuestions(qs);
    fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "practice", totalQuestions: PRACTICE_COUNT }),
    })
      .then((r) => r.json())
      .then((d) => setSessionId(d.sessionId ?? null))
      .catch(() => null);
  }, []);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Enter") {
        const current = questions[index];
        if (!revealed && current && selected.length === getRequiredAnswerCount(current)) handleSubmit();
        else if (revealed) handleNext();
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const handleSubmit = useCallback(() => {
    const q = questions[index];
    if (!q || revealed || selected.length !== getRequiredAnswerCount(q)) return;
    const correct = isAnswerCorrect(q, selected);
    const selectedAnswer = formatAnswer(selected);
    const timeMs = Date.now() - startTime.current;
    setRevealed(true);
    setShowPanel(true);
    setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    if (sessionId) {
      fetch("/api/session", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "answer", sessionId,
          questionId: q.id, domain: q.domain, objective: q.objective,
          selected: selectedAnswer, correct, timeMs,
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
      if (sessionId) {
        fetch("/api/session", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "complete", sessionId,
            correctAnswers: score.correct,
            domainScores: {},
          }),
        }).catch(() => null);
      }
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected([]);
    setRevealed(false);
    setShowPanel(false);
    startTime.current = Date.now();
  }

  function restart() {
    setQuestions(shuffled(ALL_QUESTIONS).slice(0, PRACTICE_COUNT));
    setIndex(0); setSelected([]); setRevealed(false);
    setShowPanel(false); setScore({ correct: 0, total: 0 });
    setDone(false); setSessionId(null);
    startTime.current = Date.now();
  }

  // ── Loading ──
  if (questions.length === 0) {
    return (
      <main className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <span className="font-mono text-xs uppercase tracking-widest text-zinc-400">Loading…</span>
      </main>
    );
  }

  // ── Done screen ──
  if (done) {
    const pct = Math.round((score.correct / score.total) * 100);
    const pass = pct >= 83;
    return (
      <main className="min-h-screen bg-[#fafafa]">
        <nav className="border-b-2 border-black px-6 py-3 sm:px-8">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/dashboard" className="text-zinc-500 hover:text-black" />
            <Link href="/" className="flex items-center gap-3 w-fit">
              <span className="grid size-7 place-items-center bg-black font-mono text-sm font-bold text-white">X</span>
              <span className="font-mono text-sm font-bold uppercase tracking-widest text-black">Xamastry</span>
            </Link>
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </div>
        </nav>

        <div className="mx-auto max-w-xl px-6 py-20 sm:px-8 text-center">
          <span className={`font-mono text-[10px] uppercase tracking-widest ${pass ? "text-emerald-600" : "text-red-600"}`}>
            {pass ? "Pass" : "Keep practising"}
          </span>
          <h1 className="font-playfair mt-3 text-5xl font-extrabold text-black">
            {score.correct}/{score.total}
          </h1>
          <p className="mt-2 font-mono text-2xl font-bold text-zinc-400">{pct}%</p>
          <p className="mt-4 font-sans text-sm text-zinc-600">
            {pass
              ? "You're on track for the exam. Keep the streak going."
              : "Focus on your weak objectives. Review the explanations and drill again."}
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <button
              onClick={restart}
              className="flex items-center gap-2 bg-black px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-red-600"
            >
              <RotateCcw size={13} />
              Practice again
            </button>
            <Link
              href="/dashboard"
              className="border-2 border-black px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-black transition-colors hover:border-red-600 hover:text-red-600"
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
    <main className="min-h-screen bg-[#fafafa]">

      {/* Nav */}
      <nav className="border-b-2 border-black">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 sm:px-8">
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <span className="grid size-7 place-items-center bg-black font-mono text-sm font-bold text-white">X</span>
            <span className="hidden sm:inline font-mono text-sm font-bold uppercase tracking-widest text-black">Xamastry</span>
          </Link>
          <BackButton fallbackHref="/dashboard" className="text-zinc-500 hover:text-black" />
          <ThemeToggle />
          <div className="flex items-center gap-2 sm:gap-4 font-mono text-xs text-zinc-400">
            <span className="text-emerald-700 font-bold">
              {score.correct}<span className="hidden sm:inline"> correct</span>
            </span>
            <span>/</span>
            <span>{score.total}<span className="hidden sm:inline"> answered</span></span>
          </div>
        </div>
      </nav>

      {/* Progress bar */}
      <div className="h-0.5 bg-zinc-200">
        <div
          className="h-0.5 bg-black transition-all"
          style={{ width: `${((index) / questions.length) * 100}%` }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8">

        {/* Domain stamp */}
        <div className="mb-6">
          <span className="border border-black px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-black">
            {q.domain.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          </span>
        </div>

        {/* Main layout */}
        <div className={cn("grid gap-6", showPanel ? "lg:grid-cols-[1fr_400px]" : "max-w-3xl")}>

          {/* Question card */}
          <div className="border-2 border-black bg-white p-6 sm:p-8">
            <QuestionCard
              question={q}
              selected={selected}
              revealed={revealed}
              onSelect={(letter) => {
                if (revealed) return;
                setSelected((current) => {
                  if (!isMultiAnswerQuestion(q)) return [letter];
                  if (current.includes(letter)) return current.filter((item) => item !== letter);
                  if (current.length >= getRequiredAnswerCount(q)) return current;
                  return [...current, letter];
                });
              }}
              index={index}
              total={questions.length}
            />

            {/* Actions */}
            <div className="mt-8 flex items-center gap-3">
              {!revealed ? (
                <button
                  disabled={selected.length !== getRequiredAnswerCount(q)}
                  onClick={handleSubmit}
                  className="bg-black px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Submit answer
                </button>
              ) : (
                <>
                  {!showPanel && (
                    <button
                      onClick={() => setShowPanel(true)}
                      className="border-2 border-black px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest text-black transition-colors hover:border-red-600 hover:text-red-600"
                    >
                      Explain
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 bg-black px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-red-600"
                  >
                    {index + 1 >= questions.length ? "Finish" : "Next"}
                    <ArrowRight size={13} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Explanation panel */}
          {showPanel && revealed && (
            <ExplanationPanel
              questionId={q.id}
              studentAnswer={formatAnswer(selected)}
              correctAnswer={formatAnswer(q.correct)}
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
