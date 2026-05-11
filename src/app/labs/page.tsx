"use client";

import Link from "next/link";
import { Terminal, Network, Clock, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const TOPOLOGY_LABS = [
  {
    id: "topo-001",
    title: "Two-Router OSPF Adjacency",
    type: "Topology",
    domain: "IP Connectivity",
    difficulty: "intermediate",
    estimatedMinutes: 35,
    description: "Configure OSPF between two routers over a serial link and establish area 0 adjacency.",
    objectives: ["3.4"],
  },
  {
    id: "topo-002",
    title: "VLAN Inter-op: Switch + Router-on-a-Stick",
    type: "Topology",
    domain: "Network Access",
    difficulty: "intermediate",
    estimatedMinutes: 30,
    description: "Configure VLANs on a switch, set trunk/access ports, then wire inter-VLAN routing on the router.",
    objectives: ["2.1", "3.5"],
  },
  {
    id: "topo-003",
    title: "Three-Router Static Routing",
    type: "Topology",
    domain: "IP Connectivity",
    difficulty: "beginner",
    estimatedMinutes: 30,
    description: "Build a three-router chain using static routes — each router needs routes to all remote networks.",
    objectives: ["3.3"],
  },
  {
    id: "topo-004",
    title: "Multi-Device Security Hardening",
    type: "Topology",
    domain: "Security Fundamentals",
    difficulty: "intermediate",
    estimatedMinutes: 30,
    description: "Harden both a router and a switch: enable secrets, local users, SSH v2, VTY restrictions.",
    objectives: ["5.3", "5.6"],
  },
  {
    id: "topo-005",
    title: "Campus Network: VLANs + OSPF Capstone",
    type: "Topology",
    domain: "IP Connectivity",
    difficulty: "advanced",
    estimatedMinutes: 50,
    description: "Full campus: VLANs on access switch, trunking, inter-VLAN routing, OSPF to WAN, device security.",
    objectives: ["2.1", "2.2", "3.4", "3.5", "5.3"],
  },
];

const CLI_LABS = [
  {
    id: "lab-001",
    title: "Basic Router Configuration",
    type: "CLI",
    domain: "IP Connectivity",
    difficulty: "beginner",
    estimatedMinutes: 15,
    description: "Configure hostname, interface IPs, and bring interfaces up on a fresh router.",
    objectives: ["3.1"],
  },
  {
    id: "lab-002",
    title: "Static Routing",
    type: "CLI",
    domain: "IP Connectivity",
    difficulty: "beginner",
    estimatedMinutes: 20,
    description: "Add static routes and a default route to build a complete routing table.",
    objectives: ["3.3"],
  },
  {
    id: "lab-003",
    title: "VLAN Configuration on a Switch",
    type: "CLI",
    domain: "Network Access",
    difficulty: "beginner",
    estimatedMinutes: 20,
    description: "Create VLANs, name them, and assign switch ports to the correct VLANs.",
    objectives: ["2.1"],
  },
  {
    id: "lab-004",
    title: "Router-on-a-Stick",
    type: "CLI",
    domain: "IP Connectivity",
    difficulty: "intermediate",
    estimatedMinutes: 25,
    description: "Configure 802.1Q subinterfaces for inter-VLAN routing on a single router port.",
    objectives: ["3.5"],
  },
  {
    id: "lab-005",
    title: "OSPF Single-Area",
    type: "CLI",
    domain: "IP Connectivity",
    difficulty: "intermediate",
    estimatedMinutes: 30,
    description: "Configure OSPFv2, set the router-id, and advertise networks into area 0.",
    objectives: ["3.4"],
  },
  {
    id: "lab-006",
    title: "Device Security Hardening",
    type: "CLI",
    domain: "Security Fundamentals",
    difficulty: "beginner",
    estimatedMinutes: 20,
    description: "Enable secret, local users, SSH v2, and VTY login-local on a new router.",
    objectives: ["5.3", "5.6"],
  },
  {
    id: "lab-007",
    title: "Trunk Links and Native VLAN",
    type: "CLI",
    domain: "Network Access",
    difficulty: "intermediate",
    estimatedMinutes: 20,
    description: "Configure 802.1Q trunk ports and document uplinks with interface descriptions.",
    objectives: ["2.2"],
  },
  {
    id: "lab-008",
    title: "Loopback Interfaces and Serial WAN",
    type: "CLI",
    domain: "IP Connectivity",
    difficulty: "beginner",
    estimatedMinutes: 15,
    description: "Create loopback interfaces for stable router-ids and configure a serial WAN link.",
    objectives: ["3.1", "3.4"],
  },
  {
    id: "lab-009",
    title: "Banner MOTD and Console Security",
    type: "CLI",
    domain: "Security Fundamentals",
    difficulty: "beginner",
    estimatedMinutes: 15,
    description: "Configure a legal warning banner and secure the console port with a password.",
    objectives: ["5.3"],
  },
  {
    id: "lab-010",
    title: "Complete Router Setup Challenge",
    type: "CLI",
    domain: "IP Connectivity",
    difficulty: "advanced",
    estimatedMinutes: 40,
    description:
      "Capstone: hostname, interfaces, static routing, OSPF, and full device security from scratch.",
    objectives: ["3.1", "3.3", "3.4", "5.3", "5.6"],
  },
];

type FilterType = "All" | "CLI" | "Topology";
type FilterDiff = "All" | "beginner" | "intermediate" | "advanced";

const difficultyLabel = { beginner: "Easy", intermediate: "Medium", advanced: "Hard" };
const difficultyColors = {
  beginner: "text-emerald-400",
  intermediate: "text-yellow-400",
  advanced: "text-red-400",
};

export default function LabsPage() {
  const [typeFilter, setTypeFilter] = useState<FilterType>("All");
  const [diffFilter, setDiffFilter] = useState<FilterDiff>("All");
  const [domainFilter, setDomainFilter] = useState("All");

  const ALL_LABS = [...CLI_LABS, ...TOPOLOGY_LABS];
  const domains = ["All", ...Array.from(new Set(ALL_LABS.map((l) => l.domain)))];

  const filtered = ALL_LABS.filter((lab) => {
    if (typeFilter !== "All" && lab.type !== typeFilter) return false;
    if (diffFilter !== "All" && lab.difficulty !== diffFilter) return false;
    if (domainFilter !== "All" && lab.domain !== domainFilter) return false;
    return true;
  });

  return (
    <main className="min-h-screen bg-[#080b10] px-5 py-8 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm font-semibold text-teal-200">
          Xamastry
        </Link>

        <div className="mt-6 flex flex-col gap-3 border-b border-white/10 pb-6">
          <p className="text-sm text-slate-400">Lab browser</p>
          <h1 className="text-4xl font-semibold">Practice like the CLI matters.</h1>
          <p className="max-w-2xl leading-7 text-slate-300">
            Xamastry labs grade against real device state — passing a task means the config is
            correct, not just that a command string matched. Type real IOS commands in a
            browser-based terminal.
          </p>
          <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-teal-400" />
              {CLI_LABS.length} CLI labs
            </span>
            <span className="flex items-center gap-1.5">
              <Network className="w-4 h-4 text-purple-400" />
              {TOPOLOGY_LABS.length} topology labs
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap gap-2">
          {(["All", "CLI", "Topology"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-sm transition",
                typeFilter === f
                  ? "border-teal-400/60 bg-teal-400/10 text-teal-300"
                  : "border-white/10 text-slate-400 hover:border-teal-300/30 hover:text-slate-200",
              )}
            >
              {f}
            </button>
          ))}
          <div className="w-px bg-white/10 mx-1" />
          {(["All", "beginner", "intermediate", "advanced"] as FilterDiff[]).map((f) => (
            <button
              key={f}
              onClick={() => setDiffFilter(f)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-sm transition capitalize",
                diffFilter === f
                  ? "border-teal-400/60 bg-teal-400/10 text-teal-300"
                  : "border-white/10 text-slate-400 hover:border-teal-300/30 hover:text-slate-200",
              )}
            >
              {f === "All" ? "All Levels" : difficultyLabel[f]}
            </button>
          ))}
          <div className="w-px bg-white/10 mx-1" />
          {domains.map((d) => (
            <button
              key={d}
              onClick={() => setDomainFilter(d)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-sm transition",
                domainFilter === d
                  ? "border-teal-400/60 bg-teal-400/10 text-teal-300"
                  : "border-white/10 text-slate-400 hover:border-teal-300/30 hover:text-slate-200",
              )}
            >
              {d}
            </button>
          ))}
        </div>

        <p className="mt-4 text-xs text-slate-500">
          Showing {filtered.length} of {ALL_LABS.length} labs
        </p>

        <section className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((lab) => {
            const isTopology = lab.type === "Topology";
            const href = isTopology ? `/labs/topology/${lab.id}` : `/labs/cli/${lab.id}`;
            return (
              <article
                key={lab.id}
                className={cn(
                  "group rounded-lg border bg-white/[0.03] p-5 transition",
                  isTopology
                    ? "border-purple-500/20 hover:border-purple-400/40 hover:bg-white/[0.05]"
                    : "border-white/10 hover:border-teal-300/40 hover:bg-white/[0.05]",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "rounded-md px-2 py-0.5 text-xs font-semibold flex items-center gap-1",
                      isTopology
                        ? "bg-purple-400/10 text-purple-300"
                        : "bg-teal-300/10 text-teal-300",
                    )}>
                      {isTopology ? <Network className="w-3 h-3" /> : <Terminal className="w-3 h-3" />}
                      {lab.type}
                    </span>
                    <span className="text-xs text-slate-500 capitalize">{lab.domain}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    {lab.estimatedMinutes}m
                  </div>
                </div>

                <h2 className="mt-3 text-base font-semibold text-white leading-snug">{lab.title}</h2>
                <p className="mt-1.5 text-sm text-slate-400 leading-relaxed line-clamp-2">
                  {lab.description}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <span className={cn(
                    "text-xs font-semibold capitalize",
                    difficultyColors[lab.difficulty as keyof typeof difficultyColors],
                  )}>
                    {difficultyLabel[lab.difficulty as keyof typeof difficultyLabel]}
                  </span>
                  <Link
                    href={href}
                    className={cn(
                      "flex items-center gap-1 text-sm font-semibold transition-colors group-hover:gap-2",
                      isTopology ? "text-purple-300 hover:text-purple-200" : "text-teal-300 hover:text-teal-200",
                    )}
                  >
                    Open lab
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            );
          })}

          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-500">
              No labs match the selected filters.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
