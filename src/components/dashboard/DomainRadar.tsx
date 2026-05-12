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
  score: number;
}

interface DomainRadarProps {
  scores: DomainScore[];
}

const DOMAIN_LABELS: Record<string, string> = {
  "network-fundamentals": "Net Fund.",
  "network-access":       "Net Access",
  "ip-connectivity":      "IP Connect.",
  "ip-services":          "IP Services",
  "security-fundamentals":"Security",
  automation:             "Automation",
};

export default function DomainRadar({ scores }: DomainRadarProps) {
  const data = scores.map((s) => ({
    subject: DOMAIN_LABELS[s.domain] ?? s.label,
    score: Math.round(s.score),
    fullMark: 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
        <PolarGrid stroke="rgba(0,0,0,0.1)" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: "#71717a", fontSize: 10, fontFamily: "monospace" }}
        />
        <Radar
          name="Score"
          dataKey="score"
          stroke="#000000"
          fill="#000000"
          fillOpacity={0.08}
          strokeWidth={2}
        />
        <Tooltip
          contentStyle={{
            background: "#fafafa",
            border: "1px solid #000",
            borderRadius: 0,
            color: "#000",
            fontSize: 12,
            fontFamily: "monospace",
          }}
          formatter={(v) => [`${v as number}%`, "Score"]}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
