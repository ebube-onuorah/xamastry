"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ExamTimerProps {
  totalSeconds: number;
  onExpire?: () => void;
  className?: string;
}

export default function ExamTimer({ totalSeconds, onExpire, className }: ExamTimerProps) {
  const [remaining, setRemaining] = useState(totalSeconds);

  useEffect(() => {
    if (remaining <= 0) {
      onExpire?.();
      return;
    }
    const id = setInterval(() => setRemaining((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [remaining, onExpire]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const pct = remaining / totalSeconds;
  const isWarning = pct < 0.25;
  const isDanger = pct < 0.1;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-mono font-semibold tabular-nums",
        isDanger
          ? "bg-red-500/20 text-red-300"
          : isWarning
          ? "bg-amber-400/15 text-amber-200"
          : "bg-white/8 text-slate-200",
        className,
      )}
    >
      <span className={cn("size-2 rounded-full", isDanger ? "animate-pulse bg-red-400" : isWarning ? "bg-amber-400" : "bg-teal-400")} />
      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </div>
  );
}
