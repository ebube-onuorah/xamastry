import Link from "next/link";

const domains = [
  { id: "1.x", name: "Network Fundamentals", score: 82, weight: 20 },
  { id: "2.x", name: "Network Access",        score: 68, weight: 20 },
  { id: "3.x", name: "IP Connectivity",       score: 74, weight: 25 },
  { id: "4.x", name: "IP Services",           score: 61, weight: 10 },
  { id: "5.x", name: "Security Fundamentals", score: 79, weight: 15 },
  { id: "6.x", name: "Automation",            score: 56, weight: 10 },
];

const labs = [
  { id: "lab-001", title: "Basic Router Configuration",    type: "CLI",      domain: "IP Connectivity", difficulty: "EASY"   },
  { id: "lab-003", title: "VLAN Configuration on a Switch",type: "CLI",      domain: "Network Access",  difficulty: "EASY"   },
  { id: "lab-005", title: "OSPF Single-Area",              type: "CLI",      domain: "IP Connectivity", difficulty: "MED"    },
  { id: "topo-001",title: "Two-Router OSPF Adjacency",     type: "TOPOLOGY", domain: "IP Connectivity", difficulty: "MED"    },
  { id: "topo-005",title: "Campus Network Capstone",       type: "TOPOLOGY", domain: "IP Connectivity", difficulty: "HARD"   },
];

const metrics = [
  { value: "400",   unit: "MCQ",  label: "domain-tagged questions" },
  { value: "15",    unit: "LAB",  label: "CLI and topology labs"   },
  { value: "SM-2",  unit: "ALGO", label: "adaptive spaced repetition" },
  { value: "llama", unit: "AI",   label: "Groq AI explanations"    },
];

const terminal = [
  { prompt: "R1>",          cmd: "enable",                                   out: false },
  { prompt: "R1#",          cmd: "configure terminal",                       out: false },
  { prompt: "R1(config)#",  cmd: "interface GigabitEthernet0/0",             out: false },
  { prompt: "R1(config-if)#",cmd:"ip address 192.168.1.1 255.255.255.0",    out: false },
  { prompt: "R1(config-if)#",cmd:"no shutdown",                              out: false },
  { prompt: "",             cmd: "%LINK-5-CHANGED: Interface Gi0/0, changed state to up", out: true },
  { prompt: "R1(config-if)#",cmd:"_",                                        out: false },
];

const tasks = [
  { label: "Gi0/0 — IP address", status: "PASS" },
  { label: "Gi0/0 — no shutdown", status: "PASS" },
  { label: "Gi0/1 — IP address", status: "FAIL" },
];

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 75 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : "text-red-400";
  return <span className={`font-mono text-sm font-semibold ${color}`}>{score}%</span>;
}

function DiffDot({ diff }: { diff: string }) {
  const colors: Record<string, string> = {
    EASY: "bg-emerald-500",
    MED:  "bg-amber-500",
    HARD: "bg-red-500",
  };
  return (
    <span className="flex items-center gap-1.5 font-mono text-xs text-slate-500">
      <span className={`size-1.5 rounded-full ${colors[diff] ?? "bg-slate-500"}`} />
      {diff}
    </span>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-slate-100">

      {/* ── NAV ── */}
      <nav className="border-b border-slate-800 bg-[#0a0a0a]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid size-7 place-items-center rounded-sm bg-slate-100 font-bold text-slate-950 text-sm">
              X
            </span>
            <span className="font-semibold tracking-wide text-slate-100">Xamastry</span>
          </Link>

          <div className="hidden items-center gap-6 text-sm text-slate-400 md:flex">
            <Link href="/exam/practice" className="hover:text-slate-100 transition-colors">Practice</Link>
            <Link href="/labs"          className="hover:text-slate-100 transition-colors">Labs</Link>
            <Link href="/dashboard"     className="hover:text-slate-100 transition-colors">Dashboard</Link>
          </div>

          <Link
            href="/exam/practice"
            className="rounded-sm bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-950 hover:bg-slate-300 transition-colors"
          >
            Start free
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="border-b border-slate-800">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 sm:px-8 lg:grid-cols-2 lg:py-20">

          {/* Left — copy */}
          <div className="flex flex-col justify-center gap-6">
            <span className="flex w-fit items-center gap-2 rounded-sm border border-slate-700 bg-slate-900 px-3 py-1 font-mono text-xs text-slate-400">
              <span className="size-1.5 rounded-full bg-blue-400" />
              CCNA 200-301 · EXAM PREP PLATFORM
            </span>

            <h1 className="text-4xl font-semibold leading-tight text-slate-50 sm:text-5xl">
              Pass the CCNA.<br />
              <span className="text-slate-400">No paywalls. No fluff.</span>
            </h1>

            <p className="max-w-md text-base leading-7 text-slate-400">
              Adaptive MCQs, browser-based Cisco IOS labs graded against real device state,
              and AI explanations when a concept refuses to stick.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/exam/practice"
                className="rounded-sm bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-slate-300 transition-colors"
              >
                Launch practice
              </Link>
              <Link
                href="/labs"
                className="rounded-sm border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-colors"
              >
                Browse labs
              </Link>
            </div>

            {/* Metric pills */}
            <div className="grid grid-cols-2 gap-2 pt-2 sm:grid-cols-4">
              {metrics.map((m) => (
                <div key={m.unit} className="rounded-sm border border-slate-800 bg-[#111111] px-3 py-2.5">
                  <p className="font-mono text-xs font-semibold text-blue-400">{m.unit}</p>
                  <p className="mt-0.5 font-mono text-lg font-bold text-slate-100">{m.value}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{m.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — terminal widget */}
          <div className="rounded-sm border border-slate-800 bg-[#111111]">
            {/* Title bar */}
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-slate-700" />
                <span className="size-2.5 rounded-full bg-slate-700" />
                <span className="size-2.5 rounded-full bg-slate-700" />
              </div>
              <span className="font-mono text-xs text-slate-500">lab-001 — basic-router-config</span>
              <span className="flex items-center gap-1.5 font-mono text-xs text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                2 / 3 PASS
              </span>
            </div>

            {/* Terminal output */}
            <div className="px-4 py-3 font-mono text-sm leading-6">
              {terminal.map((line, i) => (
                <div key={i} className={line.out ? "text-slate-500 text-xs" : ""}>
                  {line.out ? (
                    <span>{line.cmd}</span>
                  ) : (
                    <>
                      <span className="text-slate-500">{line.prompt} </span>
                      <span className={line.cmd === "_" ? "text-slate-300 animate-pulse" : "text-slate-200"}>
                        {line.cmd}
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Task checklist */}
            <div className="border-t border-slate-800">
              {tasks.map((t) => (
                <div
                  key={t.label}
                  className="flex items-center justify-between border-b border-slate-800/60 px-4 py-2.5 last:border-0"
                >
                  <span className="font-mono text-xs text-slate-400">{t.label}</span>
                  <span className={`font-mono text-xs font-semibold ${t.status === "PASS" ? "text-emerald-400" : "text-red-400"}`}>
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── DOMAIN READINESS ── */}
      <section className="border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="font-mono text-xs text-slate-500">CCNA 200-301 BLUEPRINT</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-100">Domain readiness</h2>
            </div>
            <Link
              href="/dashboard"
              className="font-mono text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              VIEW DASHBOARD →
            </Link>
          </div>

          {/* Table header */}
          <div className="mb-1 grid grid-cols-[3rem_1fr_4rem_4rem_12rem] gap-4 border-b border-slate-800 pb-2 font-mono text-xs text-slate-600">
            <span>ID</span>
            <span>DOMAIN</span>
            <span className="text-right">WEIGHT</span>
            <span className="text-right">SCORE</span>
            <span className="pl-3">PROGRESS</span>
          </div>

          {/* Table rows */}
          <div className="divide-y divide-slate-800/60">
            {domains.map((d) => (
              <div
                key={d.id}
                className="grid grid-cols-[3rem_1fr_4rem_4rem_12rem] items-center gap-4 py-3"
              >
                <span className="font-mono text-xs text-slate-600">{d.id}</span>
                <span className="text-sm text-slate-300">{d.name}</span>
                <span className="font-mono text-xs text-right text-slate-500">{d.weight}%</span>
                <span className="text-right"><ScoreBadge score={d.score} /></span>
                <div className="h-1 rounded-none bg-slate-800">
                  <div
                    className={`h-1 ${d.score >= 75 ? "bg-emerald-500" : d.score >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                    style={{ width: `${d.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LABS ── */}
      <section className="border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="font-mono text-xs text-slate-500">HANDS-ON PRACTICE</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-100">Labs</h2>
            </div>
            <Link
              href="/labs"
              className="font-mono text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              ALL LABS →
            </Link>
          </div>

          {/* Table header */}
          <div className="mb-1 grid grid-cols-[6rem_1fr_auto_auto] gap-4 border-b border-slate-800 pb-2 font-mono text-xs text-slate-600">
            <span>TYPE</span>
            <span>LAB</span>
            <span>DOMAIN</span>
            <span>DIFF</span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {labs.map((lab) => {
              const href = lab.type === "TOPOLOGY"
                ? `/labs/topology/${lab.id}`
                : `/labs/cli/${lab.id}`;
              return (
                <Link
                  key={lab.id}
                  href={href}
                  className="grid grid-cols-[6rem_1fr_auto_auto] items-center gap-4 py-3 transition-colors hover:bg-slate-900"
                >
                  <span className={`flex w-fit items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono text-xs ${
                    lab.type === "TOPOLOGY"
                      ? "border-violet-800 bg-violet-900/30 text-violet-300"
                      : "border-slate-700 bg-slate-800/50 text-slate-300"
                  }`}>
                    {lab.type}
                  </span>
                  <span className="text-sm text-slate-200">{lab.title}</span>
                  <span className="hidden font-mono text-xs text-slate-500 sm:block">{lab.domain}</span>
                  <DiffDot diff={lab.difficulty} />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="mx-auto max-w-7xl px-5 py-6 sm:px-8">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-slate-700">XAMASTRY · CCNA 200-301</span>
          <span className="font-mono text-xs text-slate-700">FREE · OPEN · NO ACCOUNT REQUIRED</span>
        </div>
      </footer>

    </main>
  );
}
