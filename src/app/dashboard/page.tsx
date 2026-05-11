import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { BookOpen, Flame, Clock, ChevronRight } from "lucide-react";
import DomainRadar from "@/components/dashboard/DomainRadar";
import StreakCalendar from "@/components/dashboard/StreakCalendar";
import { DOMAINS } from "@/lib/questions";

export const metadata: Metadata = {
  title: "Dashboard | Xamastry",
  description: "Track your CCNA 200-301 progress, study streak, weak domains, and upcoming practice sessions.",
};

async function getStats(userId: string) {
  try {
    const { getDashboardStats } = await import("@/lib/db/queries");
    return await getDashboardStats(userId);
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("xamastry-uid")?.value ?? null;

  const stats = userId ? await getStats(userId) : null;

  const domainScores = DOMAINS.map((d) => {
    const row = stats?.domainStats.find((s) => s.domain === d.id);
    const score = row ? Math.round((Number(row.correct) / Number(row.total)) * 100) : 0;
    return { domain: d.id, label: d.label, score };
  });

  const hasData = domainScores.some((d) => d.score > 0);

  const displayScores = hasData
    ? domainScores
    : DOMAINS.map((d, i) => ({
        domain: d.id,
        label: d.label,
        score: [82, 68, 74, 61, 79, 56][i],
      }));

  const streak = stats?.streak ?? { current: 0, longest: 0 };
  const dueCount = stats?.dueCount ?? 0;

  const weakAreas = stats?.objectiveStats
    .filter((o) => Number(o.total) > 2 && Number(o.correct) / Number(o.total) < 0.6)
    .sort((a, b) => Number(a.correct) / Number(a.total) - Number(b.correct) / Number(b.total))
    .slice(0, 3)
    .map((o) => `${o.objective} — ${o.domain.replace(/-/g, " ")}`) ?? [
    "2.4 Configure and verify VLANs",
    "4.3 Explain DHCP and DNS operations",
    "6.2 Interpret REST-based API responses",
  ];

  const recentSessions = stats?.recentSessions ?? [];

  return (
    <main className="min-h-screen bg-[#080b10] px-5 py-8 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Nav */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-md bg-teal-400 font-black text-slate-950 text-sm">
              X
            </span>
            <span className="font-semibold text-white">Xamastry</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/exam/practice" className="text-sm text-slate-300 hover:text-white">
              Practice
            </Link>
            <Link href="/labs" className="text-sm text-slate-300 hover:text-white">
              Labs
            </Link>
          </div>
        </div>

        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm text-slate-400">Dashboard</p>
            <h1 className="mt-1 text-4xl font-semibold">Your CCNA readiness</h1>
          </div>
          <Link
            href="/exam/practice"
            className="w-fit rounded-md bg-teal-300 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-teal-200"
          >
            Practice now
          </Link>
        </div>

        {/* Stats row */}
        <section className="mb-6 grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: <Flame size={18} className="text-amber-400" />,
              value: `${streak.current} days`,
              label: "Current streak",
              sub: `Longest: ${streak.longest} days`,
            },
            {
              icon: <Clock size={18} className="text-teal-400" />,
              value: dueCount > 0 ? String(dueCount) : "—",
              label: "Questions due today",
              sub: "SM-2 review queue",
            },
            {
              icon: <BookOpen size={18} className="text-sky-400" />,
              value: recentSessions.length > 0
                ? `${Math.round(((recentSessions[0].correctAnswers ?? 0) / (recentSessions[0].totalQuestions || 1)) * 100)}%`
                : "—",
              label: "Last session score",
              sub: recentSessions[0]?.type ?? "No sessions yet",
            },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
              <div className="mb-3 flex items-center gap-2 text-sm text-slate-400">
                {item.icon}
                {item.label}
              </div>
              <p className="text-3xl font-bold text-white">{item.value}</p>
              <p className="mt-1 text-xs text-slate-500">{item.sub}</p>
            </div>
          ))}
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          {/* Radar chart */}
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-teal-300">Objective map</p>
                <h2 className="mt-1 text-xl font-semibold">Domain readiness</h2>
              </div>
              {!hasData && (
                <span className="text-xs text-slate-500">Demo data — start practising!</span>
              )}
            </div>
            <DomainRadar scores={displayScores} />

            <div className="mt-4 space-y-3">
              {displayScores.map((d) => (
                <div key={d.domain}>
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="text-slate-300">{d.label}</span>
                    <span className={d.score < 60 ? "text-amber-400" : "text-slate-400"}>
                      {d.score}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-800">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-teal-400 to-sky-400 transition-all"
                      style={{ width: `${d.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {/* Streak calendar */}
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
              <h2 className="mb-4 text-xl font-semibold">Activity</h2>
              <StreakCalendar activeDates={new Set<string>()} />
              <p className="mt-3 text-xs text-slate-500">Study every day to build your streak.</p>
            </div>

            {/* Weak areas */}
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
              <h2 className="mb-4 text-xl font-semibold">Weak areas</h2>
              {weakAreas.length === 0 ? (
                <p className="text-sm text-slate-400">No weak areas detected yet. Keep practising!</p>
              ) : (
                <div className="space-y-2">
                  {weakAreas.map((area) => (
                    <Link
                      key={area}
                      href="/exam/practice"
                      className="flex items-center justify-between rounded-md border border-white/8 bg-slate-950/60 p-3 text-sm transition hover:border-teal-300/40"
                    >
                      <span className="text-slate-300">{area}</span>
                      <ChevronRight size={14} className="text-teal-400" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Recent sessions */}
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
              <h2 className="mb-4 text-xl font-semibold">Recent sessions</h2>
              {recentSessions.length === 0 ? (
                <p className="text-sm text-slate-400">No sessions yet. Start practising!</p>
              ) : (
                <div className="overflow-hidden rounded-md border border-white/10">
                  {recentSessions.map((s) => (
                    <div
                      key={s.id}
                      className="grid grid-cols-3 border-b border-white/8 p-3 text-sm last:border-0"
                    >
                      <span className="capitalize text-slate-300">{s.type}</span>
                      <span className="text-teal-300">
                        {s.score != null ? `${s.score}/1000` : "—"}
                      </span>
                      <span className="text-right text-slate-500 text-xs">
                        {s.completedAt
                          ? new Date(s.completedAt).toLocaleDateString()
                          : "In progress"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
