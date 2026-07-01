"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import SiteNav from "@/components/nav/SiteNav";

const TOPOLOGY_LABS = [
  { id: "topo-001", title: "Two-Router OSPF Adjacency",         type: "TOPOLOGY", domain: "IP Connectivity",       difficulty: "MED",  est: 35, description: "Configure OSPF between two routers over a serial link and establish area 0 adjacency.", objectives: ["3.4"] },
  { id: "topo-002", title: "VLAN Inter-op: Switch + Router-on-a-Stick", type: "TOPOLOGY", domain: "Network Access", difficulty: "MED",  est: 30, description: "Configure VLANs on a switch, set trunk/access ports, then wire inter-VLAN routing on the router.", objectives: ["2.1", "3.5"] },
  { id: "topo-003", title: "Three-Router Static Routing",       type: "TOPOLOGY", domain: "IP Connectivity",       difficulty: "EASY", est: 30, description: "Build a three-router chain using static routes — each router needs routes to all remote networks.", objectives: ["3.3"] },
  { id: "topo-004", title: "Multi-Device Security Hardening",   type: "TOPOLOGY", domain: "Security Fundamentals", difficulty: "MED",  est: 30, description: "Harden both a router and a switch: enable secrets, local users, SSH v2, VTY restrictions.", objectives: ["5.3", "5.6"] },
  { id: "topo-005", title: "Campus Network: VLANs + OSPF Capstone", type: "TOPOLOGY", domain: "IP Connectivity",  difficulty: "HARD", est: 50, description: "Full campus: VLANs on access switch, trunking, inter-VLAN routing, OSPF to WAN, device security.", objectives: ["2.1", "2.2", "3.4", "3.5", "5.3"] },
];

const CLI_LABS = [
  { id: "lab-001", title: "Basic Router Configuration",    type: "CLI", domain: "IP Connectivity",       difficulty: "EASY", est: 15, description: "Configure hostname, interface IPs, and bring interfaces up on a fresh router.",           objectives: ["3.1"] },
  { id: "lab-002", title: "Static Routing",                type: "CLI", domain: "IP Connectivity",       difficulty: "EASY", est: 20, description: "Add static routes and a default route to build a complete routing table.",                  objectives: ["3.3"] },
  { id: "lab-003", title: "VLAN Configuration on a Switch",type: "CLI", domain: "Network Access",        difficulty: "EASY", est: 20, description: "Create VLANs, name them, and assign switch ports to the correct VLANs.",                   objectives: ["2.1"] },
  { id: "lab-004", title: "Router-on-a-Stick",             type: "CLI", domain: "IP Connectivity",       difficulty: "MED",  est: 25, description: "Configure 802.1Q subinterfaces for inter-VLAN routing on a single router port.",          objectives: ["3.5"] },
  { id: "lab-005", title: "OSPF Single-Area",              type: "CLI", domain: "IP Connectivity",       difficulty: "MED",  est: 30, description: "Configure OSPFv2, set the router-id, and advertise networks into area 0.",               objectives: ["3.4"] },
  { id: "lab-006", title: "Device Security Hardening",     type: "CLI", domain: "Security Fundamentals", difficulty: "EASY", est: 20, description: "Enable secret, local users, SSH v2, and VTY login-local on a new router.",               objectives: ["5.3", "5.6"] },
  { id: "lab-007", title: "Trunk Links and Native VLAN",   type: "CLI", domain: "Network Access",        difficulty: "MED",  est: 20, description: "Configure 802.1Q trunk ports and document uplinks with interface descriptions.",          objectives: ["2.2"] },
  { id: "lab-008", title: "Loopback Interfaces & Serial WAN", type: "CLI", domain: "IP Connectivity",   difficulty: "EASY", est: 15, description: "Create loopback interfaces for stable router-ids and configure a serial WAN link.",       objectives: ["3.1", "3.4"] },
  { id: "lab-009", title: "Banner MOTD and Console Security", type: "CLI", domain: "Security Fundamentals", difficulty: "EASY", est: 15, description: "Configure a legal warning banner and secure the console port with a password.",       objectives: ["5.3"] },
  { id: "lab-010", title: "Complete Router Setup Challenge", type: "CLI", domain: "IP Connectivity",     difficulty: "HARD", est: 40, description: "Capstone: hostname, interfaces, static routing, OSPF, and full device security from scratch.", objectives: ["3.1", "3.3", "3.4", "5.3", "5.6"] },
];

type FilterType = "All" | "CLI" | "TOPOLOGY";
type FilterDiff = "All" | "EASY" | "MED" | "HARD";

const ALL_LABS = [...CLI_LABS, ...TOPOLOGY_LABS];

export default function LabsPage() {
  const [typeFilter, setTypeFilter] = useState<FilterType>("All");
  const [diffFilter, setDiffFilter] = useState<FilterDiff>("All");
  const [domainFilter, setDomainFilter] = useState("All");

  const domains = ["All", ...Array.from(new Set(ALL_LABS.map((l) => l.domain)))];

  const filtered = ALL_LABS.filter((lab) => {
    if (typeFilter !== "All" && lab.type !== typeFilter) return false;
    if (diffFilter !== "All" && lab.difficulty !== diffFilter) return false;
    if (domainFilter !== "All" && lab.domain !== domainFilter) return false;
    return true;
  });

  function FilterBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors",
          active
            ? "border-black bg-black text-white"
            : "border-zinc-300 text-zinc-500 hover:border-black hover:text-black",
        )}
      >
        {label}
      </button>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafafa]">

      <SiteNav />

      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8">

        {/* Page header */}
        <div className="border-b-2 border-black pb-8 mb-8">
          <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Hands-On Practice</p>
          <h1 className="font-playfair mt-2 text-4xl font-extrabold text-black sm:text-5xl">
            Practice like the CLI matters.
          </h1>
          <p className="mt-4 max-w-2xl font-sans text-sm leading-7 text-zinc-600">
            Labs are graded against real device state — a task passes only when the
            configuration is correct, not when a command string matches. Type real
            IOS commands in a browser-based terminal.
          </p>
          <div className="mt-4 flex items-center gap-6 font-mono text-xs text-zinc-400">
            <span><span className="font-bold text-black">{CLI_LABS.length}</span> CLI labs</span>
            <span><span className="font-bold text-red-600">{TOPOLOGY_LABS.length}</span> topology labs</span>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {(["All", "CLI", "TOPOLOGY"] as FilterType[]).map((f) => (
            <FilterBtn key={f} active={typeFilter === f} onClick={() => setTypeFilter(f)} label={f === "TOPOLOGY" ? "Topology" : f} />
          ))}
          <div className="w-px bg-zinc-200 mx-1" />
          {(["All", "EASY", "MED", "HARD"] as FilterDiff[]).map((f) => (
            <FilterBtn key={f} active={diffFilter === f} onClick={() => setDiffFilter(f)} label={f === "All" ? "All Levels" : f} />
          ))}
          <div className="w-px bg-zinc-200 mx-1" />
          {domains.map((d) => (
            <FilterBtn key={d} active={domainFilter === d} onClick={() => setDomainFilter(d)} label={d === "All" ? "All Domains" : d.split(" ").map(w => w[0]).join("")} />
          ))}
        </div>

        <p className="mb-6 font-mono text-[10px] uppercase tracking-widest text-zinc-400">
          Showing {filtered.length} of {ALL_LABS.length} labs
        </p>

        {/* Table header */}
        <div className="grid grid-cols-[5rem_1fr_auto] sm:grid-cols-[5rem_1fr_auto_auto_5rem] gap-4 border-b border-zinc-300 bg-zinc-100 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
          <span>Type</span>
          <span>Lab</span>
          <span className="hidden sm:block">Domain</span>
          <span>Diff</span>
          <span className="hidden sm:block">Est</span>
        </div>

        <div>
          {filtered.map((lab, i) => {
            const href = lab.type === "TOPOLOGY" ? `/labs/topology/${lab.id}` : `/labs/cli/${lab.id}`;
            const diffColor = lab.difficulty === "HARD" ? "border-red-600 text-red-600" : "border-black text-black";
            return (
              <Link
                key={lab.id}
                href={href}
                className={cn(
                  "grid grid-cols-[5rem_1fr_auto] sm:grid-cols-[5rem_1fr_auto_auto_5rem] items-center gap-4 px-4 py-4 transition-colors hover:bg-zinc-100",
                  i < filtered.length - 1 ? "border-b border-zinc-200" : "",
                )}
              >
                <span className={cn(
                  "border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest w-fit",
                  lab.type === "TOPOLOGY" ? "border-red-600 text-red-600" : "border-black text-black",
                )}>
                  {lab.type}
                </span>
                <div>
                  <p className="font-sans text-sm font-medium text-black">{lab.title}</p>
                  <p className="mt-0.5 font-sans text-xs text-zinc-500 line-clamp-1">{lab.description}</p>
                </div>
                <span className="hidden font-mono text-[10px] uppercase tracking-wider text-zinc-400 sm:block whitespace-nowrap">
                  {lab.domain}
                </span>
                <span className={cn("border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest", diffColor)}>
                  {lab.difficulty}
                </span>
                <span className="hidden sm:block font-mono text-[10px] text-zinc-400">{lab.est}m</span>
              </Link>
            );
          })}

          {filtered.length === 0 && (
            <div className="py-16 text-center font-mono text-xs uppercase tracking-widest text-zinc-400">
              No labs match the selected filters.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
