import type { Metadata } from "next";

const LAB_TITLES: Record<string, string> = {
  "lab-001": "Basic Router Configuration",
  "lab-002": "Static Routing",
  "lab-003": "VLAN Configuration on a Switch",
  "lab-004": "Router-on-a-Stick",
  "lab-005": "OSPF Single-Area",
  "lab-006": "Device Security Hardening",
  "lab-007": "Trunk Links and Native VLAN",
  "lab-008": "Loopback Interfaces and Serial WAN",
  "lab-009": "Banner MOTD and Console Security",
  "lab-010": "Complete Router Setup Challenge",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ labId: string }>;
}): Promise<Metadata> {
  const { labId } = await params;
  const title = LAB_TITLES[labId] ?? "CLI Lab";
  return {
    title: `${title} | Xamastry Labs`,
    description: `Practice CCNA CLI lab: ${title}. Type real Cisco IOS commands in a browser terminal with automated grading.`,
  };
}

export default function CliLabLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
