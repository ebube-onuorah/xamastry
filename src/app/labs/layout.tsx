import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Labs | Xamastry",
  description:
    "Browser-based Cisco IOS CLI labs and visual topology labs for CCNA 200-301. Grade against real device state, not just command strings.",
};

export default function LabsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
