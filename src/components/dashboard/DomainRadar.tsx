"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface DomainScore {
  domain: string;
  label: string;
  score: number; // 0-100
}

interface DomainRadarProps {
  scores: DomainScore[];
}

const DOMAIN_LABELS: Record<string, string> = {
  "network-fundamentals": "Net Fund.",
  "network-access": "Net Access",
  "ip-connectivity": "IP Connect.",
  "ip-services": "IP Services",
  "security-fundamentals": "Security",
  automation: "Automation",
};

export default function DomainRadar({ scores }: DomainRadarProps) {
  const data = scores.map((s) => ({
    subject: DOMAIN_LABELS[s.domain] ?? s.label,
    score: Math.round(s.score),
    fullMark: 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
        <PolarGrid stroke="rgba(255,255,255,0.08)" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: "#94a3b8", fontSize: 11 }}
        />
        <Radar
          name="Score"
          dataKey="score"
          stroke="#5eead4"
          fill="#5eead4"
          fillOpacity={0.18}
          strokeWidth={2}
        />
        <Tooltip
          contentStyle={{
            background: "#0f172a",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            color: "#e2e8f0",
            fontSize: 13,
          }}
          formatter={(v) => [`${v as number}%`, "Score"]}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
