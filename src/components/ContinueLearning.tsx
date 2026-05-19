"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type LastActivity = {
  path: string;
  label: string;
  savedAt: string;
};

function fallbackLabel(path: string) {
  if (path.startsWith("/labs/cli/")) return "Continue CLI lab";
  if (path.startsWith("/labs/topology/")) return "Continue topology lab";
  if (path.startsWith("/exam/practice")) return "Continue practice";
  if (path.startsWith("/exam/full")) return "Continue full exam";
  if (path.startsWith("/dashboard")) return "Open dashboard";
  return "Continue where you left off";
}

export default function ContinueLearning() {
  const [activity, setActivity] = useState<LastActivity | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("xamastry-last-activity");
      if (!raw) return;
      const parsed = JSON.parse(raw) as LastActivity;
      if (!parsed.path || parsed.path === "/" || parsed.path.startsWith("/usage")) return;
      setActivity({
        path: parsed.path,
        label: parsed.label || fallbackLabel(parsed.path),
        savedAt: parsed.savedAt,
      });
    } catch {
      setActivity(null);
    }
  }, []);

  if (!activity) return null;

  return (
    <Link
      href={activity.path}
      className="block border border-black bg-white px-4 py-3 transition-colors hover:bg-zinc-100"
    >
      <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Continue</p>
      <p className="mt-1 font-mono text-xs font-bold uppercase tracking-widest text-black">
        {activity.label}
      </p>
    </Link>
  );
}
