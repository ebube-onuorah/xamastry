import Link from "next/link";

const domains = [
  { name: "Network Fundamentals", score: 82, weight: "20%" },
  { name: "Network Access", score: 68, weight: "20%" },
  { name: "IP Connectivity", score: 74, weight: "25%" },
  { name: "IP Services", score: 61, weight: "10%" },
  { name: "Security Fundamentals", score: 79, weight: "15%" },
  { name: "Automation", score: 56, weight: "10%" },
];

const labs = [
  {
    title: "Configure Router Interfaces",
    type: "CLI",
    domain: "IP Connectivity",
    status: "Real config-state grading",
  },
  {
    title: "Switch Access VLANs",
    type: "CLI",
    domain: "Network Access",
    status: "Task checklist ready",
  },
  {
    title: "Default Route to ISP",
    type: "Topology",
    domain: "IP Services",
    status: "React Flow canvas planned",
  },
];

const stats = [
  ["500+", "domain-tagged questions"],
  ["55+", "CLI and topology labs"],
  ["SM-2", "adaptive review engine"],
  ["Groq", "AI tutor explanations"],
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#080b10] text-slate-100">
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.18),transparent_36%),linear-gradient(135deg,#0b1020_0%,#111827_48%,#1b1410_100%)]">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link className="flex items-center gap-3" href="/">
            <span className="grid size-9 place-items-center rounded-md bg-teal-400 font-black text-slate-950">
              X
            </span>
            <span className="text-lg font-semibold tracking-wide">Xamastry</span>
          </Link>
          <div className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <Link href="/exam/practice" className="hover:text-white">
              Practice
            </Link>
            <Link href="/labs" className="hover:text-white">
              Labs
            </Link>
            <Link href="/dashboard" className="hover:text-white">
              Dashboard
            </Link>
          </div>
          <Link
            href="/exam/practice"
            className="rounded-md bg-teal-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-teal-200"
          >
            Start free
          </Link>
        </nav>

        <div className="mx-auto grid max-w-7xl gap-10 px-5 pb-12 pt-8 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:pb-16">
          <div className="flex flex-col justify-center">
            <p className="mb-4 w-fit rounded-md border border-teal-300/30 bg-teal-300/10 px-3 py-1 text-sm font-medium text-teal-100">
              CCNA 200-301 practice, labs, and memory work
            </p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-tight text-white sm:text-6xl">
              Xamastry helps you pass the CCNA without paywalls.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Practice adaptive MCQs, configure browser-based Cisco IOS labs,
              and get concise AI explanations when a concept refuses to stick.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/exam/practice"
                className="rounded-md bg-teal-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-teal-200"
              >
                Launch practice
              </Link>
              <Link
                href="/labs"
                className="rounded-md border border-white/15 px-5 py-3 text-sm font-bold text-white transition hover:border-white/35 hover:bg-white/10"
              >
                Browse labs
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-white/12 bg-slate-950/70 p-4 shadow-2xl shadow-black/30">
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <p className="text-sm text-slate-400">Live practice console</p>
                <h2 className="text-xl font-semibold">R1 configuration lab</h2>
              </div>
              <span className="rounded-md bg-emerald-400/15 px-3 py-1 text-sm font-semibold text-emerald-200">
                2/3 passed
              </span>
            </div>
            <div className="rounded-md bg-black p-4 font-mono text-sm leading-7 text-emerald-300">
              <p>R1&gt; enable</p>
              <p>R1# configure terminal</p>
              <p>R1(config)# interface fa0/0</p>
              <p>R1(config-if)# ip address 192.168.1.1 255.255.255.0</p>
              <p>R1(config-if)# no shutdown</p>
              <p className="text-amber-200">R1(config-if)# _</p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {["Fa0/0 IP", "Fa0/0 up", "Fa0/1 pending"].map((task, index) => (
                <div
                  key={task}
                  className="rounded-md border border-white/10 bg-white/[0.03] p-3"
                >
                  <p className="text-xs uppercase text-slate-500">Task</p>
                  <p className="mt-1 text-sm font-semibold">{task}</p>
                  <p
                    className={
                      index < 2
                        ? "mt-2 text-sm text-emerald-300"
                        : "mt-2 text-sm text-amber-300"
                    }
                  >
                    {index < 2 ? "Validated" : "Needs config"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-5 py-8 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
        {stats.map(([value, label]) => (
          <div key={label} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <p className="text-3xl font-bold text-white">{value}</p>
            <p className="mt-2 text-sm text-slate-400">{label}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 pb-14 sm:px-8 lg:grid-cols-[1fr_0.85fr]">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-teal-200">Objective map</p>
              <h2 className="text-2xl font-semibold">Current readiness</h2>
            </div>
            <Link href="/dashboard" className="text-sm font-semibold text-teal-200 hover:text-teal-100">
              Open dashboard
            </Link>
          </div>
          <div className="space-y-4">
            {domains.map((domain) => (
              <div key={domain.name}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-slate-200">{domain.name}</span>
                  <span className="text-slate-400">
                    {domain.score}% · weight {domain.weight}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-800">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-teal-300 via-sky-300 to-amber-300"
                    style={{ width: `${domain.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="mb-5">
            <p className="text-sm font-medium text-amber-200">Hands-on labs</p>
            <h2 className="text-2xl font-semibold">Next up</h2>
          </div>
          <div className="space-y-3">
            {labs.map((lab) => (
              <Link
                href="/labs"
                key={lab.title}
                className="block rounded-md border border-white/10 bg-slate-950/50 p-4 transition hover:border-teal-300/50"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-white">{lab.title}</h3>
                  <span className="rounded-md bg-white/10 px-2 py-1 text-xs text-slate-200">
                    {lab.type}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-400">{lab.domain}</p>
                <p className="mt-3 text-sm text-teal-200">{lab.status}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
