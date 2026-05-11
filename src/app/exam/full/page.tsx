"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Flag, ChevronLeft, ChevronRight, Send, Clock, AlertTriangle } from "lucide-react";
import { sampleFullExam } from "@/lib/questions";
import type { Question } from "@/lib/questions";
import { cn } from "@/lib/utils";

const EXAM_MINUTES = 120;
const EXAM_SECONDS = EXAM_MINUTES * 60;

type AnswerMap = Record<string, string>;
type FlagSet = Set<string>;

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function FullExamPage() {
  const router = useRouter();
  const [questions] = useState<Question[]>(() => sampleFullExam());
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [flagged, setFlagged] = useState<FlagSet>(new Set());
  const [timeLeft, setTimeLeft] = useState(EXAM_SECONDS);
  const [phase, setPhase] = useState<"exam" | "review" | "submitting">("exam");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const startTimeRef = useRef(Date.now());

  const current = questions[currentIdx];
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;

  // Timer
  useEffect(() => {
    if (phase !== "exam") return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Create session on mount
  useEffect(() => {
    fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "full", totalQuestions: questions.length }),
    })
      .then((r) => r.json())
      .then((d) => setSessionId(d.sessionId ?? null))
      .catch(() => null);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const selectAnswer = useCallback((questionId: string, letter: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: letter }));
  }, []);

  const toggleFlag = useCallback((questionId: string) => {
    setFlagged((prev) => {
      const next = new Set(prev);
      next.has(questionId) ? next.delete(questionId) : next.add(questionId);
      return next;
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (phase === "submitting") return;
    setPhase("submitting");

    const timeUsedMs = Date.now() - startTimeRef.current;

    try {
      if (sessionId) {
        // Save all answers
        for (const q of questions) {
          const selected = answers[q.id] ?? "";
          await fetch("/api/session", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "answer",
              sessionId,
              questionId: q.id,
              domain: q.domain,
              objective: q.objective,
              selected,
              correct: q.correct,
              timeMs: Math.round(timeUsedMs / questions.length),
            }),
          });
        }
        // Complete session
        await fetch("/api/session", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "complete", sessionId }),
        });
        router.push(`/exam/results/${sessionId}`);
      } else {
        // Offline fallback — compute score locally and pass via query param
        const correct = questions.filter((q) => answers[q.id] === q.correct).length;
        const score = Math.round((correct / questions.length) * 1000);
        router.push(`/exam/results/local?score=${score}&total=${questions.length}&correct=${correct}`);
      }
    } catch {
      // fallback
      const correct = questions.filter((q) => answers[q.id] === q.correct).length;
      const score = Math.round((correct / questions.length) * 1000);
      router.push(`/exam/results/local?score=${score}&total=${questions.length}&correct=${correct}`);
    }
  }, [phase, sessionId, questions, answers, router]);

  const isWarning = timeLeft < EXAM_SECONDS * 0.25;
  const isDanger = timeLeft < EXAM_SECONDS * 0.1;

  if (phase === "submitting") {
    return (
      <div className="min-h-screen bg-[#080b10] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white font-semibold">Submitting your exam...</p>
        </div>
      </div>
    );
  }

  if (phase === "review") {
    return (
      <ReviewScreen
        questions={questions}
        answers={answers}
        flagged={flagged}
        timeLeft={timeLeft}
        onGoToQuestion={(idx) => { setCurrentIdx(idx); setPhase("exam"); }}
        onSubmit={handleSubmit}
        isDanger={isDanger}
        isWarning={isWarning}
      />
    );
  }

  if (!current) return null;

  const letterOptions: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };

  return (
    <div className="min-h-screen bg-[#080b10] flex flex-col text-white">
      {/* Top bar */}
      <div className="flex-shrink-0 border-b border-zinc-800/60 bg-zinc-950/90 backdrop-blur-sm px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">CCNA 200-301</span>
          <span className="text-xs text-zinc-700">·</span>
          <span className="text-xs font-semibold text-white">Full Exam</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="text-xs text-zinc-400">
            {answeredCount}/{questions.length} answered
          </div>
          <div
            className={cn(
              "flex items-center gap-1.5 font-mono font-bold text-sm px-3 py-1 rounded-md",
              isDanger
                ? "text-red-400 bg-red-500/20 animate-pulse"
                : isWarning
                  ? "text-yellow-400 bg-yellow-500/15"
                  : "text-teal-400 bg-teal-500/15",
            )}
          >
            <Clock className="w-3.5 h-3.5" />
            {formatTime(timeLeft)}
          </div>
          <button
            onClick={() => setPhase("review")}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-md transition-colors"
          >
            Review & Submit
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Question navigator sidebar */}
        <div className="hidden lg:flex flex-col w-56 flex-shrink-0 border-r border-zinc-800/60 bg-zinc-950/40 p-3 overflow-y-auto">
          <p className="text-xs font-semibold text-zinc-500 mb-3 uppercase tracking-wide">Questions</p>
          <div className="grid grid-cols-5 gap-1">
            {questions.map((q, idx) => {
              const answered = !!answers[q.id];
              const isFlagged = flagged.has(q.id);
              const isCurrent = idx === currentIdx;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(idx)}
                  className={cn(
                    "w-8 h-8 rounded text-xs font-mono font-semibold transition-all",
                    isCurrent
                      ? "bg-teal-500 text-black"
                      : isFlagged
                        ? "bg-yellow-500/20 border border-yellow-500/40 text-yellow-300"
                        : answered
                          ? "bg-zinc-700 text-zinc-200"
                          : "bg-zinc-900 text-zinc-500 border border-zinc-800 hover:border-zinc-600",
                  )}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
          <div className="mt-4 space-y-1.5 text-xs text-zinc-500">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-teal-500 inline-block" />Current</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-zinc-700 inline-block" />Answered</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-yellow-500/20 border border-yellow-500/40 inline-block" />Flagged</div>
          </div>
        </div>

        {/* Question body */}
        <div className="flex-1 flex flex-col items-center py-8 px-4 overflow-y-auto">
          <div className="w-full max-w-2xl space-y-6">
            {/* Question header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-zinc-500 mb-1">
                  Question {currentIdx + 1} of {questions.length}
                  <span className="mx-2 text-zinc-700">·</span>
                  <span className="capitalize">{current.domain.replace(/-/g, " ")}</span>
                </p>
                <p className="text-base font-medium text-white leading-relaxed">{current.text}</p>
              </div>
              <button
                onClick={() => toggleFlag(current.id)}
                className={cn(
                  "flex-shrink-0 p-2 rounded-md transition-colors",
                  flagged.has(current.id)
                    ? "text-yellow-400 bg-yellow-500/15"
                    : "text-zinc-500 hover:text-yellow-400 hover:bg-yellow-500/10",
                )}
                title="Flag for review"
              >
                <Flag className="w-4 h-4" />
              </button>
            </div>

            {/* Options */}
            <div className="space-y-2.5">
              {current.options.map((option) => {
                const letter = option.charAt(0);
                const selected = answers[current.id] === letter;
                return (
                  <button
                    key={option}
                    onClick={() => selectAnswer(current.id, letter)}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-lg border text-sm transition-all duration-150",
                      selected
                        ? "border-teal-500/60 bg-teal-500/10 text-teal-200"
                        : "border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800/60",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block w-6 h-6 rounded-full text-xs font-bold text-center leading-6 mr-3 flex-shrink-0",
                        selected ? "bg-teal-500 text-black" : "bg-zinc-800 text-zinc-400",
                      )}
                    >
                      {letter}
                    </span>
                    {option.slice(3)}
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                disabled={currentIdx === 0}
                className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              {currentIdx < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIdx((i) => i + 1)}
                  className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setPhase("review")}
                  className="flex items-center gap-1.5 text-sm font-semibold text-teal-400 hover:text-teal-300 transition-colors"
                >
                  Review & Submit
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ReviewScreenProps {
  questions: Question[];
  answers: AnswerMap;
  flagged: FlagSet;
  timeLeft: number;
  onGoToQuestion: (idx: number) => void;
  onSubmit: () => void;
  isDanger: boolean;
  isWarning: boolean;
}

function ReviewScreen({
  questions,
  answers,
  flagged,
  timeLeft,
  onGoToQuestion,
  onSubmit,
  isDanger,
  isWarning,
}: ReviewScreenProps) {
  const unanswered = questions.filter((q) => !answers[q.id]);
  const flaggedList = questions.filter((q) => flagged.has(q.id));

  return (
    <div className="min-h-screen bg-[#080b10] text-white flex flex-col">
      <div className="flex-shrink-0 border-b border-zinc-800/60 bg-zinc-950/90 px-4 py-3 flex items-center gap-4">
        <h1 className="text-sm font-semibold">Review & Submit</h1>
        <div className="ml-auto flex items-center gap-3">
          <div
            className={cn(
              "flex items-center gap-1.5 font-mono font-bold text-sm px-3 py-1 rounded-md",
              isDanger
                ? "text-red-400 bg-red-500/20 animate-pulse"
                : isWarning
                  ? "text-yellow-400 bg-yellow-500/15"
                  : "text-teal-400 bg-teal-500/15",
            )}
          >
            <Clock className="w-3.5 h-3.5" />
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-8 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-teal-400">{Object.keys(answers).length}</p>
              <p className="text-xs text-zinc-400 mt-1">Answered</p>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4 text-center">
              <p className={cn("text-2xl font-bold", unanswered.length > 0 ? "text-yellow-400" : "text-emerald-400")}>
                {unanswered.length}
              </p>
              <p className="text-xs text-zinc-400 mt-1">Unanswered</p>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-yellow-400">{flaggedList.length}</p>
              <p className="text-xs text-zinc-400 mt-1">Flagged</p>
            </div>
          </div>

          {unanswered.length > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-semibold text-yellow-300">
                  {unanswered.length} question{unanswered.length > 1 ? "s" : ""} unanswered
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {unanswered.map((q, _) => {
                  const idx = questions.indexOf(q);
                  return (
                    <button
                      key={q.id}
                      onClick={() => onGoToQuestion(idx)}
                      className="w-8 h-8 rounded bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 text-xs font-mono font-semibold hover:bg-yellow-500/30 transition-colors"
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {flaggedList.length > 0 && (
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
              <p className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
                <Flag className="w-4 h-4 text-yellow-400" />
                Flagged for review
              </p>
              <div className="flex flex-wrap gap-1.5">
                {flaggedList.map((q) => {
                  const idx = questions.indexOf(q);
                  return (
                    <button
                      key={q.id}
                      onClick={() => onGoToQuestion(idx)}
                      className="w-8 h-8 rounded bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 text-xs font-mono font-semibold hover:bg-yellow-500/30 transition-colors"
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <button
            onClick={onSubmit}
            className="w-full py-3.5 bg-teal-500 hover:bg-teal-400 text-black font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Submit Exam
          </button>
          <p className="text-xs text-zinc-500 text-center">
            Once submitted, you cannot change your answers.
          </p>
        </div>
      </div>
    </div>
  );
}
