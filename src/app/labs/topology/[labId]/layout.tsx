import type { Metadata } from "next";

const TOPO_TITLES: Record<string, string> = {
  "topo-001": "Two-Router OSPF Adjacency",
  "topo-002": "VLAN Inter-op: Switch + Router-on-a-Stick",
  "topo-003": "Three-Router Static Routing",
  "topo-004": "Multi-Device Security Hardening",
  "topo-005": "Campus Network: VLANs + OSPF Capstone",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ labId: string }>;
}): Promise<Metadata> {
  const { labId } = await params;
  const title = TOPO_TITLES[labId] ?? "Topology Lab";
  return {
    title: `${title} | Xamastry Labs`,
    description: `Multi-device CCNA topology lab: ${title}. Configure routers and switches on an interactive network diagram.`,
  };
}

export default function TopologyLabLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
