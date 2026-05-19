import Link from "next/link";
import SiteNav from "@/components/nav/SiteNav";
import ContinueLearning from "@/components/ContinueLearning";
import { CONTENT_VERSION, STARTER_PATH } from "@/lib/product";

const domains = [
  { id: "1.x", name: "Network Fundamentals", score: 82, weight: 20 },
  { id: "2.x", name: "Network Access",        score: 68, weight: 20 },
  { id: "3.x", name: "IP Connectivity",       score: 74, weight: 25 },
  { id: "4.x", name: "IP Services",           score: 61, weight: 10 },
  { id: "5.x", name: "Security Fundamentals", score: 79, weight: 15 },
  { id: "6.x", name: "Automation",            score: 56, weight: 10 },
];

const labs = [
  { id: "lab-001",  title: "Basic Router Configuration",    type: "CLI",      domain: "IP Connectivity", difficulty: "EASY" },
  { id: "lab-003",  title: "VLAN Configuration on a Switch",type: "CLI",      domain: "Network Access",  difficulty: "EASY" },
  { id: "lab-005",  title: "OSPF Single-Area",              type: "CLI",      domain: "IP Connectivity", difficulty: "MED"  },
  { id: "topo-001", title: "Two-Router OSPF Adjacency",     type: "TOPOLOGY", domain: "IP Connectivity", difficulty: "MED"  },
  { id: "topo-005", title: "Campus Network Capstone",       type: "TOPOLOGY", domain: "IP Connectivity", difficulty: "HARD" },
];

const metrics = [
  { value: "400", label: "MCQ", sub: "audited answer schema" },
  { value: "15",  label: "LAB", sub: "state-graded scenarios" },
  { value: "IOS", label: "CLI", sub: "browser command parser" },
  { value: "SMART", label: "REVIEW", sub: "weak topics resurface" },
];

const terminal = [
  { prompt: "SW1>", cmd: "enable", out: false },
  { prompt: "SW1#", cmd: "configure terminal", out: false },
  { prompt: "SW1(config)#", cmd: "interface GigabitEthernet0/1", out: false },
  { prompt: "SW1(config-if)#", cmd: "switchport mode trunk", out: false },
  { prompt: "SW1(config-if)#", cmd: "switchport trunk native vlan 99", out: false },
  { prompt: "SW1(config-if)#", cmd: "no shutdown", out: false },
  { prompt: "", cmd: "%LINK-5-CHANGED: Interface GigabitEthernet0/1, changed state to up", out: true },
  { prompt: "SW1(config-if)#", cmd: "_", out: false },
];

const tasks = [
  { label: "Gi0/1 - trunk mode", status: "PASS" },
  { label: "Gi0/1 - native VLAN 99", status: "PASS" },
  { label: "Gi0/2 - native VLAN 99", status: "FAIL" },
];

function ScoreStamp({ score }: { score: number }) {
  const red = score < 60;
  return (
    <span className={`font-mono text-sm font-bold tabular-nums ${red ? "text-red-600" : "text-black"}`}>
      {score}%
    </span>
  );
}

function DiffTag({ diff }: { diff: string }) {
  const red = diff === "HARD";
  return (
    <span className={`border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest ${
      red ? "border-red-600 text-red-600" : "border-black text-black"
    }`}>
      {diff}
    </span>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fafafa] text-black">

      <SiteNav />

      {/* ── HERO ── */}
      <section className="border-b-2 border-black">
        <div className="mx-auto grid max-w-7xl lg:grid-cols-[1fr_1fr]">

          {/* Left — copy */}
          <div className="flex flex-col justify-center gap-7 border-b-2 border-black px-6 py-14 sm:px-8 lg:border-b-0 lg:border-r-2 lg:py-20">

            <span className="flex w-fit items-center gap-2 border border-black px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
              <span className="size-1.5 bg-red-600" />
              CCNA 200-301 · Exam Prep Platform
            </span>

            <h1 className="font-playfair text-5xl font-extrabold leading-[1.1] tracking-tight text-black sm:text-6xl">
              CCNA study cockpit.<br />
              <span className="text-zinc-400">Questions, CLI labs, review.</span>
            </h1>

            <p className="max-w-sm font-sans text-sm leading-7 text-zinc-600">
              Drill exam objectives, configure IOS-style labs in the browser, and
              verify work against device state instead of memorising isolated answers.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/exam/practice"
                className="bg-black px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-red-600"
              >
                Launch practice
              </Link>
              <Link
                href="/labs"
                className="border-2 border-black px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-black transition-colors hover:border-red-600 hover:text-red-600"
              >
                Browse labs
              </Link>
            </div>

            <ContinueLearning />

            {/* Metric grid */}
            <div className="grid grid-cols-2 gap-0 border-t-2 border-black pt-0 sm:grid-cols-4">
              {metrics.map((m, i) => (
                <div
                  key={m.label}
                  className={`border-t-2 border-black px-4 py-4 ${i < metrics.length - 1 ? "border-r border-r-zinc-200" : ""}`}
                >
                  <p className="font-mono text-[10px] uppercase tracking-widest text-red-600">{m.label}</p>
                  <p className="mt-1 font-mono text-2xl font-bold text-black">{m.value}</p>
                  <p className="mt-0.5 font-sans text-[11px] text-zinc-500">{m.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — terminal */}
          <div className="flex flex-col bg-[#0a0a0a]">
            {/* Title bar */}
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3">
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-zinc-700" />
                <span className="size-2.5 rounded-full bg-zinc-700" />
                <span className="size-2.5 rounded-full bg-zinc-700" />
              </div>
              <span className="font-mono text-xs text-zinc-500">lab-007 - trunk-native-vlan</span>
              <span className="flex items-center gap-1.5 font-mono text-xs text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                2 / 3 PASS
              </span>
            </div>

            {/* Terminal output */}
            <div className="flex-1 px-5 py-4 font-mono text-sm leading-6">
              {terminal.map((line, i) => (
                <div key={i} className={line.out ? "text-zinc-500 text-xs" : ""}>
                  {line.out ? (
                    <span>{line.cmd}</span>
                  ) : (
                    <>
                      <span className="text-emerald-500">{line.prompt} </span>
                      <span className={line.cmd === "_" ? "text-white animate-pulse" : "text-white"}>
                        {line.cmd}
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Task checklist */}
            <div className="border-t border-zinc-800">
              <div className="border-b border-zinc-800 px-5 py-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                  Task Validation
                </span>
              </div>
              {tasks.map((t) => (
                <div
                  key={t.label}
                  className="flex items-center justify-between border-b border-zinc-800/60 px-5 py-2.5 last:border-0"
                >
                  <span className="font-mono text-xs text-zinc-400">{t.label}</span>
                  <span className={`font-mono text-xs font-bold ${t.status === "PASS" ? "text-emerald-400" : "text-red-500"}`}>
                    {t.status}
                  </span>
                </div>
              ))}
              <div className="border-t border-zinc-800 px-5 py-3">
                <Link
                  href="/labs/cli/lab-007"
                  className="font-mono text-[10px] uppercase tracking-widest text-emerald-400 hover:text-white transition-colors"
                >
                  Open in full lab →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STARTER PATH */}
      <section className="border-b-2 border-black">
        <div className="mx-auto max-w-7xl">
          <div className="border-b border-zinc-200 px-6 py-5 sm:px-8">
            <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">New Here?</p>
            <h2 className="mt-1 font-mono text-lg font-bold uppercase tracking-wide text-black">
              Recommended First 20 Minutes
            </h2>
          </div>
          <div className="grid sm:grid-cols-3">
            {STARTER_PATH.map((step, index) => (
              <Link
                key={step.href}
                href={step.href}
                className={`px-6 py-6 transition-colors hover:bg-zinc-100 sm:px-8 ${
                  index < STARTER_PATH.length - 1 ? "border-b sm:border-b-0 sm:border-r border-zinc-200" : ""
                }`}
              >
                <span className="font-mono text-3xl font-bold text-zinc-200">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-mono text-sm font-bold uppercase tracking-widest text-black">
                  {step.label}
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600">{step.body}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── DOMAIN READINESS ── */}
      <section className="border-b-2 border-black">
        <div className="mx-auto max-w-7xl">

          {/* Section header */}
          <div className="flex items-end justify-between border-b border-zinc-200 px-6 py-5 sm:px-8">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                CCNA 200-301 Blueprint
              </p>
              <h2 className="mt-1 font-mono text-lg font-bold uppercase tracking-wide text-black">
                Domain Readiness
              </h2>
              <p className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-zinc-400">
                Sample scores until you complete practice sessions
              </p>
            </div>
            <Link
              href="/dashboard"
              className="font-mono text-[10px] uppercase tracking-widest text-red-600 hover:underline"
            >
              View Dashboard →
            </Link>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[3rem_1fr_4rem_4rem_10rem] gap-4 border-b border-zinc-300 bg-zinc-100 px-6 py-2 font-mono text-[10px] uppercase tracking-widest text-zinc-500 sm:px-8">
            <span>ID</span>
            <span>Domain</span>
            <span className="text-right">Weight</span>
            <span className="text-right">Score</span>
            <span className="pl-2">Progress</span>
          </div>

          {/* Rows */}
          <div>
            {domains.map((d, i) => {
              const barColor = d.score >= 75 ? "bg-black" : d.score >= 60 ? "bg-zinc-500" : "bg-red-600";
              return (
                <div
                  key={d.id}
                  className={`grid grid-cols-[3rem_1fr_4rem_4rem_10rem] items-center gap-4 px-6 py-3.5 sm:px-8 ${
                    i < domains.length - 1 ? "border-b border-zinc-200" : ""
                  }`}
                >
                  <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">{d.id}</span>
                  <span className="border border-black px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-black w-fit">
                    {d.name}
                  </span>
                  <span className="font-mono text-xs text-right text-zinc-500">{d.weight}%</span>
                  <span className="text-right"><ScoreStamp score={d.score} /></span>
                  <div className="h-1.5 bg-zinc-200 pl-2">
                    <div className={`h-1.5 ${barColor}`} style={{ width: `${d.score}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── LABS ── */}
      <section className="border-b-2 border-black">
        <div className="mx-auto max-w-7xl">

          {/* Section header */}
          <div className="flex items-end justify-between border-b border-zinc-200 px-6 py-5 sm:px-8">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                Hands-On Practice
              </p>
              <h2 className="mt-1 font-mono text-lg font-bold uppercase tracking-wide text-black">
                Labs
              </h2>
            </div>
            <Link
              href="/labs"
              className="font-mono text-[10px] uppercase tracking-widest text-red-600 hover:underline"
            >
              All Labs →
            </Link>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[5rem_1fr_auto_auto] gap-4 border-b border-zinc-300 bg-zinc-100 px-6 py-2 font-mono text-[10px] uppercase tracking-widest text-zinc-500 sm:px-8">
            <span>Type</span>
            <span>Lab</span>
            <span>Domain</span>
            <span>Diff</span>
          </div>

          <div>
            {labs.map((lab, i) => {
              const href = lab.type === "TOPOLOGY"
                ? `/labs/topology/${lab.id}`
                : `/labs/cli/${lab.id}`;
              return (
                <Link
                  key={lab.id}
                  href={href}
                  className={`grid grid-cols-[5rem_1fr_auto_auto] items-center gap-4 px-6 py-3.5 transition-colors hover:bg-zinc-100 sm:px-8 ${
                    i < labs.length - 1 ? "border-b border-zinc-200" : ""
                  }`}
                >
                  <span className={`border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest w-fit ${
                    lab.type === "TOPOLOGY"
                      ? "border-red-600 text-red-600"
                      : "border-black text-black"
                  }`}>
                    {lab.type}
                  </span>
                  <span className="font-sans text-sm text-black">{lab.title}</span>
                  <span className="hidden font-mono text-[10px] uppercase tracking-wider text-zinc-400 sm:block">
                    {lab.domain}
                  </span>
                  <DiffTag diff={lab.difficulty} />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="border-b-2 border-black">
        <div className="mx-auto max-w-7xl">
          <div className="border-b border-zinc-200 px-6 py-5 sm:px-8">
            <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Method</p>
            <h2 className="mt-1 font-mono text-lg font-bold uppercase tracking-wide text-black">
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3">
            {[
              {
                n: "01",
                title: "Answer MCQs",
                body: "400+ questions mapped to every CCNA 200-301 exam objective. Missed and weak questions are scheduled to come back when they are worth reviewing.",
              },
              {
                n: "02",
                title: "Run CLI Labs",
                body: "Type real Cisco IOS commands in a browser terminal. Each lab is graded against actual device state — not keyword matching. Topology labs add multi-device scenarios.",
              },
              {
                n: "03",
                title: "Get AI Explanations",
                body: "When a concept refuses to stick, ask for an explanation. Groq's llama-3.3-70b acts as a CCNA instructor: concept, common mistake, memory trick, textbook reference.",
              },
            ].map((step, i) => (
              <div
                key={step.n}
                className={`px-6 py-8 sm:px-8 ${i < 2 ? "border-b sm:border-b-0 sm:border-r border-zinc-200" : ""}`}
              >
                <span className="font-mono text-3xl font-bold text-zinc-200">{step.n}</span>
                <h3 className="mt-3 font-mono text-sm font-bold uppercase tracking-widest text-black">
                  {step.title}
                </h3>
                <p className="mt-2 font-sans text-sm leading-6 text-zinc-600">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-b-2 border-black">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-6 py-14 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <h2 className="font-playfair text-3xl font-extrabold text-black">
              Free. No account. Start now.
            </h2>
            <p className="mt-2 font-sans text-sm text-zinc-500">
              Progress is saved in your browser. No sign-up friction.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              href="/exam/practice"
              className="bg-black px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-red-600"
            >
              Start practice
            </Link>
            <Link
              href="/exam/full"
              className="border-2 border-black px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-black transition-colors hover:border-red-600 hover:text-red-600"
            >
              Full exam mode
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="mx-auto max-w-7xl px-6 py-5 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
            Xamastry - {CONTENT_VERSION}
          </span>
          <div className="flex gap-4 font-mono text-[10px] uppercase tracking-widest text-zinc-400">
            <Link href="/privacy" className="hover:text-black">Privacy</Link>
            <Link href="/terms" className="hover:text-black">Terms</Link>
          </div>
        </div>
      </footer>

    </main>
  );
}
