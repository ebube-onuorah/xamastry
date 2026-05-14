"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Trophy, RotateCcw, BookOpen, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { ALL_QUESTIONS, getCorrectAnswers } from "@/lib/questions";
import BackButton from "@/components/nav/BackButton";

const PASS_THRESHOLD = 825;

interface SessionData {
  score: number;
  totalQuestions: number;
  correctCount: number;
  domainScores: Record<string, number>;
}

interface AnswerData {
  questionId: string;
  domain: string;
  objective: string;
  selected: string;
  correct: boolean;
}

const DOMAIN_LABELS: Record<string, string> = {
  "network-fundamentals": "Network Fundamentals",
  "network-access": "Network Access",
  "ip-connectivity": "IP Connectivity",
  "ip-services": "IP Services",
  "security-fundamentals": "Security Fundamentals",
  automation: "Automation",
};

export default function ResultsPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const searchParams = useSearchParams();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [answers, setAnswers] = useState<AnswerData[]>([]);
  const [studyPlan, setStudyPlan] = useState<string | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [expandedQ, setExpandedQ] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // Local offline fallback (from query params)
      if (sessionId === "local") {
        const score = parseInt(searchParams.get("score") ?? "0");
        const total = parseInt(searchParams.get("total") ?? "120");
        const correct = parseInt(searchParams.get("correct") ?? "0");
        setSessionData({ score, totalQuestions: total, correctCount: correct, domainScores: {} });
        setLoading(false);
        return;
      }

      try {
        const sessionRes = await fetch(`/api/session?id=${sessionId}`);
        if (sessionRes.ok) {
          const d = await sessionRes.json();
          const session = d.session;
          if (session) {
            setSessionData({
              score: session.score ?? 0,
              totalQuestions: session.totalQuestions ?? 0,
              correctCount: session.correctAnswers ?? 0,
              domainScores: session.domainScores ?? {},
            });
          }
          setAnswers(d.answers ?? []);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sessionId, searchParams]);

  const generateStudyPlan = async () => {
    if (!sessionData) return;
    setLoadingPlan(true);
    try {
      const weakObjectives = answers
        .filter((a) => !a.correct)
        .reduce<Record<string, number>>((acc, a) => {
          acc[a.objective] = (acc[a.objective] ?? 0) + 1;
          return acc;
        }, {});
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "study_plan",
          domainScores: sessionData.domainScores,
          weakObjectives,
        }),
      });
      const data = await res.json();
      setStudyPlan(data.plan ?? data.explanation ?? "Unable to generate plan.");
    } catch {
      setStudyPlan("Unable to generate study plan. Check your GROQ_API_KEY.");
    } finally {
      setLoadingPlan(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080b10] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  const passed = (sessionData?.score ?? 0) >= PASS_THRESHOLD;
  const score = sessionData?.score ?? 0;
  const totalQ = sessionData?.totalQuestions ?? 120;
  const correct = sessionData?.correctCount ?? 0;

  // Domain breakdown from live answers if domainScores is empty
  const domainScores = sessionData?.domainScores ?? {};
  if (Object.keys(domainScores).length === 0 && answers.length > 0) {
    const byDomain: Record<string, { correct: number; total: number }> = {};
    for (const a of answers) {
      if (!byDomain[a.domain]) byDomain[a.domain] = { correct: 0, total: 0 };
      byDomain[a.domain].total++;
      if (a.correct) byDomain[a.domain].correct++;
    }
    for (const [domain, { correct: c, total: t }] of Object.entries(byDomain)) {
      domainScores[domain] = t > 0 ? Math.round((c / t) * 100) : 0;
    }
  }

  return (
    <div className="min-h-screen bg-[#080b10] text-white px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <BackButton fallbackHref="/dashboard" className="text-zinc-500 hover:text-white" />

        {/* Score card */}
        <div
          className={cn(
            "rounded-2xl border p-8 text-center",
            passed
              ? "border-emerald-500/30 bg-emerald-500/5"
              : "border-red-500/30 bg-red-500/5",
          )}
        >
          <div className="flex justify-center mb-4">
            {passed ? (
              <Trophy className="w-14 h-14 text-emerald-400" />
            ) : (
              <XCircle className="w-14 h-14 text-red-400" />
            )}
          </div>
          <h1 className="text-5xl font-black mb-2" style={{ color: passed ? "#34d399" : "#f87171" }}>
            {score}
            <span className="text-2xl font-normal text-zinc-500">/1000</span>
          </h1>
          <p className={cn("text-xl font-bold mb-1", passed ? "text-emerald-300" : "text-red-300")}>
            {passed ? "PASS" : "FAIL"}
          </p>
          <p className="text-sm text-zinc-400">
            {correct} of {totalQ} questions correct · Pass threshold: {PASS_THRESHOLD}/1000
          </p>
        </div>

        {/* Domain breakdown */}
        {Object.keys(domainScores).length > 0 && (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white">Domain Breakdown</h2>
            {Object.entries(domainScores).map(([domain, pct]) => (
              <div key={domain}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-zinc-300">{DOMAIN_LABELS[domain] ?? domain}</span>
                  <span className={cn("font-semibold", (pct as number) >= 70 ? "text-emerald-400" : "text-red-400")}>
                    {pct as number}%
                  </span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      (pct as number) >= 70 ? "bg-emerald-500" : "bg-red-500",
                    )}
                    style={{ width: `${pct as number}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AI Study Plan */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-400" />
              AI Study Plan
            </h2>
            {!studyPlan && (
              <button
                onClick={generateStudyPlan}
                disabled={loadingPlan}
                className="text-xs font-semibold text-teal-400 hover:text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 disabled:opacity-60"
              >
                {loadingPlan ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                Generate Plan
              </button>
            )}
          </div>
          {studyPlan ? (
            <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{studyPlan}</div>
          ) : (
            <p className="text-sm text-zinc-500">
              Get a personalised 1-week study plan based on your weak areas. Powered by Groq AI.
            </p>
          )}
        </div>

        {/* Question review */}
        {answers.length > 0 && (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 space-y-3">
            <h2 className="text-base font-bold text-white mb-4">Question Review</h2>
            {answers.map((a) => {
              const q = ALL_QUESTIONS.find((q) => q.id === a.questionId);
              if (!q) return null;
              const isCorrect = a.correct;
              const isExpanded = expandedQ === a.questionId;
              const correctLetters = getCorrectAnswers(q);
              const selectedLetters = a.selected.split(",").map((letter) => letter.trim()).filter(Boolean);
              return (
                <div
                  key={a.questionId}
                  className={cn(
                    "border rounded-lg overflow-hidden",
                    isCorrect ? "border-emerald-500/20" : "border-red-500/20",
                  )}
                >
                  <button
                    onClick={() => setExpandedQ(isExpanded ? null : a.questionId)}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-zinc-800/40 transition-colors"
                  >
                    {isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    )}
                    <span className="text-sm text-zinc-200 flex-1 line-clamp-1">{q.text}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3 bg-zinc-900/40">
                      <p className="text-sm text-zinc-200 pt-2">{q.text}</p>
                      <div className="space-y-1.5">
                        {q.options.map((opt) => {
                          const letter = opt.charAt(0);
                          return (
                            <div
                              key={opt}
                              className={cn(
                                "px-3 py-1.5 rounded text-sm",
                                correctLetters.includes(letter)
                                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                                  : selectedLetters.includes(letter) && !isCorrect
                                    ? "bg-red-500/15 text-red-300 border border-red-500/30"
                                    : "text-zinc-500",
                              )}
                            >
                              {opt}
                              {correctLetters.includes(letter) && (
                                <span className="ml-2 text-xs text-emerald-500">✓ Correct</span>
                              )}
                              {selectedLetters.includes(letter) && !isCorrect && (
                                <span className="ml-2 text-xs text-red-500">✗ Your answer</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {q.explanation && (
                        <p className="text-xs text-zinc-400 bg-zinc-800/60 rounded p-2.5 leading-relaxed">
                          {q.explanation}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href="/exam/practice"
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-300 font-semibold text-sm rounded-lg transition-all"
          >
            <BookOpen className="w-4 h-4" />
            Practice Mode
          </Link>
          <Link
            href="/exam/full"
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-sm rounded-lg transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Retake Exam
          </Link>
          <Link
            href="/dashboard"
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-semibold text-sm rounded-lg transition-all"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
