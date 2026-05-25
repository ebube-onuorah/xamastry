export type LabProgressionItem = {
  id: string;
  type: "cli" | "topology";
  title: string;
  href: string;
  focus: string;
};

export const CLI_LAB_PATH: LabProgressionItem[] = [
  {
    id: "lab-001",
    type: "cli",
    title: "Basic Router Configuration",
    href: "/labs/cli/lab-001",
    focus: "Hostname, interface IPs, and no shutdown",
  },
  {
    id: "lab-002",
    type: "cli",
    title: "Static Routing",
    href: "/labs/cli/lab-002",
    focus: "Static routes and default routes",
  },
  {
    id: "lab-003",
    type: "cli",
    title: "VLAN Configuration",
    href: "/labs/cli/lab-003",
    focus: "VLANs, names, and access ports",
  },
  {
    id: "lab-004",
    type: "cli",
    title: "Router-on-a-Stick",
    href: "/labs/cli/lab-004",
    focus: "802.1Q subinterfaces and inter-VLAN routing",
  },
  {
    id: "lab-005",
    type: "cli",
    title: "OSPF Single-Area",
    href: "/labs/cli/lab-005",
    focus: "OSPF process, router ID, and area 0 networks",
  },
  {
    id: "lab-006",
    type: "cli",
    title: "Device Security Hardening",
    href: "/labs/cli/lab-006",
    focus: "Enable secret, users, SSH, and VTY access",
  },
  {
    id: "lab-007",
    type: "cli",
    title: "Trunk Links and Native VLAN",
    href: "/labs/cli/lab-007",
    focus: "802.1Q trunking and native VLAN checks",
  },
  {
    id: "lab-008",
    type: "cli",
    title: "Loopback Interfaces & Serial WAN",
    href: "/labs/cli/lab-008",
    focus: "Loopbacks, serial links, and stable router IDs",
  },
  {
    id: "lab-009",
    type: "cli",
    title: "Banner MOTD and Console Security",
    href: "/labs/cli/lab-009",
    focus: "Banners and console access protection",
  },
  {
    id: "lab-010",
    type: "cli",
    title: "Complete Router Setup Challenge",
    href: "/labs/cli/lab-010",
    focus: "Full router setup capstone",
  },
];

export const TOPOLOGY_LAB_PATH: LabProgressionItem[] = [
  {
    id: "topo-001",
    type: "topology",
    title: "Two-Router OSPF Adjacency",
    href: "/labs/topology/topo-001",
    focus: "Build an OSPF area 0 adjacency",
  },
  {
    id: "topo-002",
    type: "topology",
    title: "VLAN Inter-op",
    href: "/labs/topology/topo-002",
    focus: "Switching plus router-on-a-stick",
  },
  {
    id: "topo-003",
    type: "topology",
    title: "Three-Router Static Routing",
    href: "/labs/topology/topo-003",
    focus: "Multi-router static route reachability",
  },
  {
    id: "topo-004",
    type: "topology",
    title: "Multi-Device Security Hardening",
    href: "/labs/topology/topo-004",
    focus: "Router and switch hardening",
  },
  {
    id: "topo-005",
    type: "topology",
    title: "Campus Network Capstone",
    href: "/labs/topology/topo-005",
    focus: "VLANs, routing, OSPF, and hardening",
  },
];

export function getNextLab(labId: string, type: "cli" | "topology") {
  const path = type === "cli" ? CLI_LAB_PATH : TOPOLOGY_LAB_PATH;
  const index = path.findIndex((lab) => lab.id === labId);
  if (index === -1) return null;
  return path[index + 1] ?? null;
}
