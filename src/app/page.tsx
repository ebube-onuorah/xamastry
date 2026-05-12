import Link from "next/link";

const domains = [
  { id: "1.x", name: "Network Fundamentals", score: 82, weight: 20 },
  { id: "2.x", name: "Network Access",        score: 68, weight: 20 },
  { id: "3.x", name: "IP Connectivity",       score: 74, weight: 25 },
  { id: "4.x", name: "IP Services",           score: 61, weight: 10 },
  { id: "5.x", name: "Security Fundamentals", score: 79, weight: 15 },
  { id: "6.x", name: "Automation",            score: 56, weight: 10 },
];

const labQueue = [
  { id: "lab-001",  title: "Basic Router Configuration",     type: "CLI",      domain: "IP Connectivity",       diff: "EASY", est: "15 min", status: "DONE"    },
  { id: "lab-003",  title: "VLAN Configuration on a Switch", type: "CLI",      domain: "Network Access",        diff: "EASY", est: "20 min", status: "DONE"    },
  { id: "lab-005",  title: "OSPF Single-Area",               type: "CLI",      domain: "IP Connectivity",       diff: "MED",  est: "30 min", status: "ACTIVE"  },
  { id: "topo-001", title: "Two-Router OSPF Adjacency",      type: "TOPOLOGY", domain: "IP Connectivity",       diff: "MED",  est: "45 min", status: "PENDING" },
  { id: "lab-007",  title: "DHCP Server Configuration",      type: "CLI",      domain: "IP Services",           diff: "MED",  est: "25 min", status: "PENDING" },
  { id: "topo-005", title: "Campus Network Capstone",        type: "TOPOLOGY", domain: "IP Connectivity",       diff: "HARD", est: "90 min", status: "PENDING" },
];

const activity = [
  { time: "2 min ago",  type: "ANSWER",  text: "Answered nf-043 correctly · Network Fundamentals",   color: "text-emerald-400" },
  { time: "8 min ago",  type: "LAB",     text: "Lab lab-003 completed · 3/3 tasks passed",            color: "text-emerald-400" },
  { time: "14 min ago", type: "ANSWER",  text: "Answered ic-017 incorrectly · IP Connectivity",       color: "text-red-400"     },
  { time: "22 min ago", type: "EXPLAIN", text: "AI explanation requested for ic-017",                 color: "text-blue-400"    },
  { time: "1 hr ago",   type: "LAB",     text: "Lab lab-001 completed · 3/3 tasks passed",            color: "text-emerald-400" },
  { time: "3 hr ago",   type: "ANSWER",  text: "Practice session · 18/25 correct (72%)",              color: "text-amber-400"   },
];

const terminal = [
  { prompt: "R1>",           cmd: "enable",                                out: false },
  { prompt: "R1#",           cmd: "configure terminal",                   out: false },
  { prompt: "R1(config)#",   cmd: "interface GigabitEthernet0/0",         out: false },
  { prompt: "R1(config-if)#",cmd: "ip address 192.168.1.1 255.255.255.0", out: false },
  { prompt: "R1(config-if)#",cmd: "no shutdown",                          out: false },
  { prompt: "",              cmd: "%LINK-5-CHANGED: Interface Gi0/0, changed state to up", out: true },
  { prompt: "R1(config-if)#",cmd: "_",                                    out: false },
];

const labTasks = [
  { label: "Gi0/0 — IP address", status: "PASS"    },
  { label: "Gi0/0 — no shutdown", status: "PASS"   },
  { label: "Gi0/1 — IP address", status: "PENDING" },
];

const queueStats = [
  { label: "Due Reviews",        value: "14",  color: "text-amber-400"  },
  { label: "Weak Objectives",    value: "3",   color: "text-red-400"    },
  { label: "New Questions",      value: "8",   color: "text-blue-400"   },
  { label: "Recommended Drill",  value: "ic-017", color: "text-slate-300" },
];

const question = {
  id: "ic-019",
  objective: "3.4",
  domain: "IP Connectivity",
  difficulty: "MED",
  due: "Due today",
  text: "A router has the following entries in its routing table:\n• 10.0.0.0/8 via 192.168.1.2\n• 10.10.0.0/16 via 192.168.1.3\n• 10.10.10.0/24 via 192.168.1.4\n\nA packet destined for 10.10.10.5 will be forwarded to which next-hop?",
  options: [
    { key: "A", text: "192.168.1.2 — matches the /8 prefix" },
    { key: "B", text: "192.168.1.3 — matches the /16 prefix" },
    { key: "C", text: "192.168.1.4 — longest prefix match wins" },
    { key: "D", text: "Dropped — no default route present" },
  ],
};

function StatusDot({ status }: { status: "PASS" | "FAIL" | "PENDING" }) {
  const map = {
    PASS:    "text-emerald-400",
    FAIL:    "text-red-400",
    PENDING: "text-slate-500",
  };
  return (
    <span className={`font-mono text-xs font-semibold ${map[status]}`}>
      {status}
    </span>
  );
}

function DiffBadge({ diff }: { diff: string }) {
  const map: Record<string, string> = {
    EASY: "text-emerald-400 border-emerald-900",
    MED:  "text-amber-400  border-amber-900",
    HARD: "text-red-400    border-red-900",
  };
  return (
    <span className={`font-mono text-[10px] border px-1.5 py-0.5 rounded-sm ${map[diff] ?? "text-slate-400 border-slate-700"}`}>
      {diff}
    </span>
  );
}

function LabStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    DONE:    "text-emerald-400 bg-emerald-950/40 border-emerald-900",
    ACTIVE:  "text-blue-400   bg-blue-950/40    border-blue-900",
    PENDING: "text-slate-500  bg-slate-900      border-slate-800",
  };
  return (
    <span className={`font-mono text-[10px] border px-1.5 py-0.5 rounded-sm ${map[status] ?? ""}`}>
      {status}
    </span>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-100">

      {/* ── SYSTEM BAR ── */}
      <header className="border-b border-slate-800 bg-[#0a0a0a]">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-3 sm:px-6">

          {/* Left — identity */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="grid size-6 place-items-center rounded-sm bg-slate-100 font-bold text-slate-950 text-xs">
                X
              </span>
              <span className="font-semibold text-sm tracking-wide text-slate-100">Xamastry</span>
            </Link>
            <div className="hidden items-center gap-3 md:flex">
              <span className="font-mono text-[10px] text-slate-600">·</span>
              <span className="font-mono text-[10px] text-slate-500">CCNA 200-301</span>
              <span className="font-mono text-[10px] text-slate-600">·</span>
              <span className="font-mono text-[10px] text-slate-500">FREE</span>
              <span className="font-mono text-[10px] text-slate-600">·</span>
              <span className="font-mono text-[10px] text-slate-500">NO ACCOUNT REQUIRED</span>
            </div>
          </div>

          {/* Center nav */}
          <nav className="hidden items-center gap-5 text-xs text-slate-400 md:flex">
            <Link href="/exam/practice" className="hover:text-slate-100 transition-colors">Practice</Link>
            <Link href="/labs"          className="hover:text-slate-100 transition-colors">Labs</Link>
            <Link href="/dashboard"     className="hover:text-slate-100 transition-colors">Dashboard</Link>
            <Link href="/exam/full"     className="hover:text-slate-100 transition-colors">Full Exam</Link>
          </nav>

          {/* Right — CTAs */}
          <div className="flex items-center gap-2">
            <Link
              href="/labs"
              className="hidden rounded-sm border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors sm:block"
            >
              Open Labs
            </Link>
            <Link
              href="/exam/practice"
              className="rounded-sm bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-slate-300 transition-colors"
            >
              Start Practice
            </Link>
          </div>
        </div>
      </header>

      {/* ── MAIN GRID ── */}
      <main className="mx-auto max-w-[1400px] px-5 py-5 sm:px-6">

        {/* Top row: 2 left modules + 2 right modules */}
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">

          {/* ── LEFT COLUMN ── */}
          <div className="flex flex-col gap-4">

            {/* Today's Queue */}
            <div className="rounded-sm border border-slate-800 bg-[#111111]">
              <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  Review Queue
                </span>
                <span className="font-mono text-[10px] text-slate-600">Session State</span>
              </div>
              <div className="grid grid-cols-2 divide-x divide-slate-800">
                {queueStats.map((s) => (
                  <div key={s.label} className="px-4 py-3 border-b border-slate-800">
                    <p className="font-mono text-xs text-slate-600">{s.label}</p>
                    <p className={`mt-0.5 font-mono text-lg font-bold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="font-mono text-[10px] text-slate-600">
                  <span className="text-amber-400">14</span> cards due · SM-2 algorithm
                </span>
                <Link
                  href="/exam/practice"
                  className="font-mono text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
                >
                  DRILL DUE →
                </Link>
              </div>
            </div>

            {/* Active Question */}
            <div className="rounded-sm border border-slate-800 bg-[#111111]">
              <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  Active Question
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-slate-600">{question.id}</span>
                  <span className="font-mono text-[10px] text-slate-600">·</span>
                  <span className="font-mono text-[10px] text-slate-600">obj {question.objective}</span>
                  <span className="font-mono text-[10px] text-slate-600">·</span>
                  <DiffBadge diff={question.difficulty} />
                </div>
              </div>

              <div className="px-4 py-4">
                <p className="text-xs font-mono text-slate-500 mb-2">{question.domain} · {question.due}</p>
                <p className="text-sm leading-6 text-slate-200 whitespace-pre-line">{question.text}</p>
              </div>

              <div className="border-t border-slate-800">
                {question.options.map((o) => (
                  <div
                    key={o.key}
                    className="flex items-start gap-3 border-b border-slate-800/60 px-4 py-2.5 last:border-0 cursor-pointer hover:bg-slate-900 transition-colors"
                  >
                    <span className="font-mono text-xs font-semibold text-slate-500 mt-0.5 shrink-0">{o.key}</span>
                    <span className="text-sm text-slate-300">{o.text}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 border-t border-slate-800 px-4 py-2.5">
                <Link
                  href="/exam/practice"
                  className="rounded-sm bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-slate-300 transition-colors"
                >
                  Submit
                </Link>
                <Link
                  href="/exam/practice"
                  className="rounded-sm border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:bg-slate-800 transition-colors"
                >
                  Explain
                </Link>
                <Link
                  href="/exam/practice"
                  className="rounded-sm border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:bg-slate-800 transition-colors"
                >
                  Skip
                </Link>
                <span className="ml-auto font-mono text-[10px] text-slate-600">keyboard: 1–4 · Enter · →</span>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="flex flex-col gap-4">

            {/* CLI Lab Session */}
            <div className="rounded-sm border border-slate-800 bg-[#111111]">
              <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  CLI Lab Session
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-slate-600">lab-005</span>
                  <span className="font-mono text-[10px] text-slate-600">·</span>
                  <span className="font-mono text-[10px] text-slate-600">R1</span>
                  <span className="font-mono text-[10px] text-slate-600">·</span>
                  <span className="flex items-center gap-1 font-mono text-[10px] text-blue-400">
                    <span className="size-1.5 rounded-full bg-blue-400" />
                    ACTIVE
                  </span>
                </div>
              </div>

              {/* Terminal */}
              <div className="bg-[#0a0a0a] px-4 py-3 font-mono text-xs leading-5 border-b border-slate-800">
                {terminal.map((line, i) => (
                  <div key={i} className={line.out ? "text-slate-600" : ""}>
                    {line.out ? (
                      <span>{line.cmd}</span>
                    ) : (
                      <>
                        <span className="text-slate-600">{line.prompt} </span>
                        <span className={line.cmd === "_" ? "text-slate-300 animate-pulse" : "text-slate-200"}>
                          {line.cmd}
                        </span>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Task checklist */}
              <div className="border-b border-slate-800">
                <div className="px-4 py-2 font-mono text-[10px] text-slate-600 border-b border-slate-800/60">
                  Config Validation · 2 / 3 PASS
                </div>
                {labTasks.map((t) => (
                  <div
                    key={t.label}
                    className="flex items-center justify-between border-b border-slate-800/60 px-4 py-2 last:border-0"
                  >
                    <span className="font-mono text-xs text-slate-400">{t.label}</span>
                    <StatusDot status={t.status as "PASS" | "FAIL" | "PENDING"} />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="font-mono text-[10px] text-slate-600">OSPF Single-Area · IP Connectivity · MED</span>
                <Link
                  href="/labs/cli/lab-005"
                  className="font-mono text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
                >
                  RESUME LAB →
                </Link>
              </div>
            </div>

            {/* Readiness Snapshot */}
            <div className="rounded-sm border border-slate-800 bg-[#111111]">
              <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  Readiness Snapshot
                </span>
                <span className="font-mono text-[10px] text-slate-600">Objective Coverage</span>
              </div>

              {/* Domain table */}
              <div className="divide-y divide-slate-800/60">
                <div className="grid grid-cols-[2.5rem_1fr_3rem_3rem_8rem] gap-3 px-4 py-2 font-mono text-[10px] text-slate-600">
                  <span>ID</span>
                  <span>DOMAIN</span>
                  <span className="text-right">WT</span>
                  <span className="text-right">SCORE</span>
                  <span className="pl-2">BAR</span>
                </div>
                {domains.map((d) => {
                  const color = d.score >= 75 ? "bg-emerald-500" : d.score >= 60 ? "bg-amber-500" : "bg-red-500";
                  const textColor = d.score >= 75 ? "text-emerald-400" : d.score >= 60 ? "text-amber-400" : "text-red-400";
                  return (
                    <div
                      key={d.id}
                      className="grid grid-cols-[2.5rem_1fr_3rem_3rem_8rem] items-center gap-3 px-4 py-2"
                    >
                      <span className="font-mono text-[10px] text-slate-600">{d.id}</span>
                      <span className="text-xs text-slate-300 truncate">{d.name}</span>
                      <span className="font-mono text-[10px] text-right text-slate-600">{d.weight}%</span>
                      <span className={`font-mono text-xs text-right font-semibold ${textColor}`}>{d.score}%</span>
                      <div className="h-1 bg-slate-800 rounded-none pl-2">
                        <div className={`h-1 ${color}`} style={{ width: `${d.score}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between border-t border-slate-800 px-4 py-2.5">
                <span className="font-mono text-[10px] text-slate-600">
                  Exam Readiness: <span className="text-amber-400">72%</span> weighted avg
                </span>
                <Link
                  href="/dashboard"
                  className="font-mono text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
                >
                  FULL DASHBOARD →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── LOWER ROW ── */}
        <div className="mt-4 grid gap-4 lg:grid-cols-[3fr_2fr]">

          {/* Lab Queue */}
          <div className="rounded-sm border border-slate-800 bg-[#111111]">
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                Lab Queue
              </span>
              <Link
                href="/labs"
                className="font-mono text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
              >
                ALL LABS →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[540px]">
                {/* Header */}
                <div className="grid grid-cols-[4.5rem_1fr_auto_auto_5rem_4.5rem] gap-3 border-b border-slate-800 px-4 py-2 font-mono text-[10px] text-slate-600">
                  <span>TYPE</span>
                  <span>LAB</span>
                  <span>DOMAIN</span>
                  <span>DIFF</span>
                  <span>EST</span>
                  <span>STATUS</span>
                </div>

                <div className="divide-y divide-slate-800/60">
                  {labQueue.map((lab) => {
                    const href = lab.type === "TOPOLOGY"
                      ? `/labs/topology/${lab.id}`
                      : `/labs/cli/${lab.id}`;
                    return (
                      <Link
                        key={lab.id}
                        href={href}
                        className="grid grid-cols-[4.5rem_1fr_auto_auto_5rem_4.5rem] items-center gap-3 px-4 py-2.5 hover:bg-slate-900 transition-colors"
                      >
                        <span className={`flex w-fit items-center gap-1 rounded-sm border px-1.5 py-0.5 font-mono text-[10px] ${
                          lab.type === "TOPOLOGY"
                            ? "border-violet-800 text-violet-400"
                            : "border-slate-700 text-slate-400"
                        }`}>
                          {lab.type}
                        </span>
                        <span className="text-xs text-slate-200 truncate">{lab.title}</span>
                        <span className="hidden font-mono text-[10px] text-slate-500 sm:block">{lab.domain}</span>
                        <DiffBadge diff={lab.diff} />
                        <span className="font-mono text-[10px] text-slate-600">{lab.est}</span>
                        <LabStatusBadge status={lab.status} />
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-sm border border-slate-800 bg-[#111111]">
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                Recent Activity
              </span>
              <Link
                href="/dashboard"
                className="font-mono text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
              >
                DASHBOARD →
              </Link>
            </div>

            <div className="divide-y divide-slate-800/60">
              {activity.map((a, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-2.5">
                  <span className={`font-mono text-[10px] font-semibold shrink-0 mt-0.5 ${a.color}`}>
                    {a.type}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-300 truncate">{a.text}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-slate-600">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-800 px-4 py-2.5">
              <span className="font-mono text-[10px] text-slate-600">
                400 questions · 15 labs · SM-2 spaced repetition · Groq AI
              </span>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}
