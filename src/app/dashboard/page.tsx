import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import SiteNav from "@/components/nav/SiteNav";
import DomainRadar from "@/components/dashboard/DomainRadar";
import StreakCalendar from "@/components/dashboard/StreakCalendar";
import ProgressBackup from "@/components/dashboard/ProgressBackup";
import ContinueLearning from "@/components/ContinueLearning";
import { DOMAINS } from "@/lib/questions";
import { CONTENT_VERSION } from "@/lib/product";
import { isValidUid } from "@/lib/security";

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
  const rawUserId = cookieStore.get("xamastry-uid")?.value ?? null;
  const userId = isValidUid(rawUserId) ? rawUserId : null;
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
  const recentLabAttempts = stats?.recentLabAttempts ?? [];
  const activeSessions = stats?.activeSessions ?? [];
  const activeDates = new Set(stats?.activeDates ?? []);
  const completedLabCount = stats?.completedLabCount ?? 0;

  const labTitles: Record<string, string> = {
    "lab-001": "Basic Router Configuration",
    "lab-002": "Static Routing",
    "lab-003": "VLAN Configuration",
    "lab-004": "Router-on-a-Stick",
    "lab-005": "OSPF Single-Area",
    "lab-006": "Device Security",
    "lab-007": "Trunk Links",
    "lab-008": "Loopback & Serial WAN",
    "lab-009": "Banner & Console Security",
    "lab-010": "Complete Router Setup",
    "topo-001": "Two-Router OSPF",
    "topo-002": "VLAN Inter-op",
    "topo-003": "Three-Router Static Routing",
    "topo-004": "Device Hardening",
    "topo-005": "Campus Capstone",
  };

  const statCards = [
    { label: "Current Streak",       value: `${streak.current}d`, sub: `Longest: ${streak.longest}d` },
    { label: "Questions to Review",  value: String(dueCount), sub: dueCount > 0 ? "Ready for another pass" : "Nothing waiting right now" },
    { label: "Labs Complete",        value: String(completedLabCount), sub: "Unique passed labs" },
    { label: "Last Session",
      value: recentSessions[0]
        ? `${Math.round(((recentSessions[0].correctAnswers ?? 0) / (recentSessions[0].totalQuestions || 1)) * 100)}%`
        : "—",
      sub: recentSessions[0]?.type ?? "No sessions yet" },
  ];

  const nextRecommendation = dueCount > 0
    ? {
        href: "/exam/practice?utm_source=app&utm_medium=dashboard&utm_campaign=due_review",
        title: "Review due questions",
        body: `${dueCount} question${dueCount === 1 ? "" : "s"} are ready for another pass.`,
      }
    : completedLabCount === 0
      ? {
          href: "/labs/cli/lab-001?utm_source=app&utm_medium=dashboard&utm_campaign=first_lab",
          title: "Try your first lab",
          body: "Start with Basic Router Configuration and use Check My Work.",
        }
      : {
          href: "/exam/full?utm_source=app&utm_medium=dashboard&utm_campaign=mock_exam",
          title: "Take a mock exam",
          body: "Use a timed session when you want a readiness check.",
        };

  return (
    <main className="min-h-screen bg-[#fafafa]">

      <SiteNav />

      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8">

        {/* Page header */}
        <div className="border-b-2 border-black pb-8 mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">CCNA 200-301</p>
            <h1 className="font-playfair mt-2 text-4xl font-extrabold text-black sm:text-5xl">
              Your readiness.
            </h1>
            {!hasData && (
              <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                Demo data — scores update as you practise
              </p>
            )}
            <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-zinc-400">
              {CONTENT_VERSION}
            </p>
          </div>
          <div className="w-full md:w-72">
            <ContinueLearning />
          </div>
        </div>

        {/* Stat cards */}
        <div className="mb-8 grid gap-0 border-2 border-black sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((s, i) => (
            <div
              key={s.label}
              className={`px-6 py-5 ${i < statCards.length - 1 ? "border-b-2 sm:border-b-0 sm:border-r-2 border-black" : ""}`}
            >
              <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">{s.label}</p>
              <p className="mt-2 font-mono text-3xl font-bold text-black">{s.value}</p>
              <p className="mt-1 font-mono text-[10px] text-zinc-400">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="mb-8 border-2 border-black p-6">
          <div className="mb-4 border-b border-zinc-200 pb-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Start Here</p>
            <h2 className="mt-1 font-mono text-base font-bold uppercase tracking-wide text-black">What to do next</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Link href={nextRecommendation.href} className="border-2 border-black p-4 transition-colors hover:bg-zinc-100">
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-black">{nextRecommendation.title}</p>
              <p className="mt-2 text-sm leading-6 text-zinc-600">{nextRecommendation.body}</p>
            </Link>
            <Link href="/exam/practice" className="border border-zinc-300 p-4 transition-colors hover:border-black">
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-black">Practice Questions</p>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                Build your score and reveal weak CCNA objectives.
              </p>
            </Link>
            <Link href="/labs" className="border border-zinc-300 p-4 transition-colors hover:border-black">
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-black">Do a Lab</p>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                Configure IOS-style tasks and save your lab checks here.
              </p>
            </Link>
          </div>
          <div className="mt-3">
            <ProgressBackup />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">

          {/* Domain radar + bars */}
          <div className="border-2 border-black p-6">
            <div className="mb-4 flex items-end justify-between border-b border-zinc-200 pb-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Objective Map</p>
                <h2 className="mt-1 font-mono text-base font-bold uppercase tracking-wide text-black">Domain Readiness</h2>
              </div>
            </div>

            <DomainRadar scores={displayScores} />

            <div className="mt-4 space-y-3">
              {displayScores.map((d) => {
                const barColor = d.score >= 75 ? "bg-black" : d.score >= 60 ? "bg-zinc-400" : "bg-red-600";
                const textColor = d.score < 60 ? "text-red-600" : "text-black";
                return (
                  <div key={d.domain}>
                    <div className="mb-1.5 flex justify-between font-mono text-[10px] uppercase tracking-wider">
                      <span className="text-zinc-600">{d.label}</span>
                      <span className={`font-bold ${textColor}`}>{d.score}%</span>
                    </div>
                    <div className="h-1.5 bg-zinc-200">
                      <div className={`h-1.5 ${barColor} transition-all`} style={{ width: `${d.score}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-6">

            {/* Activity calendar */}
            <div className="border-2 border-black p-6">
              <div className="mb-4 border-b border-zinc-200 pb-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Study History</p>
                <h2 className="mt-1 font-mono text-base font-bold uppercase tracking-wide text-black">Activity</h2>
              </div>
              <StreakCalendar activeDates={activeDates} />
              <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                Completed practice and exam sessions are marked here.
              </p>
            </div>

            {/* Weak areas */}
            <div className="border-2 border-black p-6">
              <div className="mb-4 border-b border-zinc-200 pb-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Below 60%</p>
                <h2 className="mt-1 font-mono text-base font-bold uppercase tracking-wide text-black">Weak Areas</h2>
              </div>
              {weakAreas.length === 0 ? (
                <p className="font-mono text-xs text-zinc-400">No weak areas detected yet.</p>
              ) : (
                <div className="divide-y divide-zinc-200">
                  {weakAreas.map((area) => (
                    <Link
                      key={area}
                      href="/exam/practice"
                      className="flex items-center justify-between py-3 transition-colors hover:text-red-600"
                    >
                      <span className="font-sans text-sm text-zinc-700">{area}</span>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 hover:text-red-600">
                        Drill →
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Recent sessions */}
            <div className="border-2 border-black p-6">
              <div className="mb-4 border-b border-zinc-200 pb-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">History</p>
                <h2 className="mt-1 font-mono text-base font-bold uppercase tracking-wide text-black">Recent Sessions</h2>
              </div>
              {recentSessions.length === 0 ? (
                <p className="font-mono text-xs text-zinc-400">No sessions yet. Start practising!</p>
              ) : (
                <div className="divide-y divide-zinc-200">
                  {recentSessions.map((s) => (
                    <div key={s.id} className="grid grid-cols-3 py-3 font-mono text-xs">
                      <span className="capitalize text-zinc-600">{s.type}</span>
                      <span className="font-bold text-black">
                        {s.score != null ? `${s.score}/1000` : "—"}
                      </span>
                      <span className="text-right text-zinc-400">
                        {s.completedAt ? new Date(s.completedAt).toLocaleDateString() : "In progress"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent labs */}
            <div className="border-2 border-black p-6">
              <div className="mb-4 border-b border-zinc-200 pb-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Labs</p>
                <h2 className="mt-1 font-mono text-base font-bold uppercase tracking-wide text-black">Recent Lab Checks</h2>
              </div>
              {recentLabAttempts.length === 0 ? (
                <p className="font-mono text-xs text-zinc-400">No lab checks yet. Open a lab and use Check My Work.</p>
              ) : (
                <div className="divide-y divide-zinc-200">
                  {recentLabAttempts.slice(0, 5).map((attempt) => {
                    const tasks = Array.isArray(attempt.tasksJson) ? attempt.tasksJson : [];
                    const passed = tasks.filter((task) => {
                      return typeof task === "object" && task !== null && "passed" in task && task.passed === true;
                    }).length;
                    const href =
                      attempt.labType === "topology"
                        ? `/labs/topology/${attempt.labId}`
                        : `/labs/cli/${attempt.labId}`;

                    return (
                      <Link
                        key={attempt.id}
                        href={href}
                        className="grid grid-cols-[1fr_auto] gap-3 py-3 transition-colors hover:text-red-600"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-sans text-sm text-zinc-700">
                            {labTitles[attempt.labId] ?? attempt.labId}
                          </p>
                          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                            {attempt.labType} · {attempt.completedAt.toLocaleDateString()}
                          </p>
                        </div>
                        <span className={attempt.passedAll ? "font-mono text-xs font-bold text-black" : "font-mono text-xs font-bold text-red-600"}>
                          {passed}/{tasks.length}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {activeSessions.length > 0 && (
              <div className="border-2 border-black p-6">
                <div className="mb-4 border-b border-zinc-200 pb-4">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Open</p>
                  <h2 className="mt-1 font-mono text-base font-bold uppercase tracking-wide text-black">In Progress</h2>
                </div>
                <div className="divide-y divide-zinc-200">
                  {activeSessions.map((s) => (
                    <div key={s.id} className="grid grid-cols-3 py-3 font-mono text-xs">
                      <span className="capitalize text-zinc-600">{s.type}</span>
                      <span className="font-bold text-zinc-400">{s.totalQuestions} Q</span>
                      <span className="text-right text-zinc-400">
                        {new Date(s.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
