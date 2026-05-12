"use client";

import { cn } from "@/lib/utils";

interface StreakCalendarProps {
  activeDates: Set<string>;
}

function toDateString(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function StreakCalendar({ activeDates }: StreakCalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDay = new Date(today);
  startDay.setDate(today.getDate() - today.getDay() - 16 * 7);

  const weeks: Date[][] = [];
  const cursor = new Date(startDay);
  while (cursor <= today) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="overflow-x-auto">
      <div className="mb-1 flex gap-1">
        {DAY_LABELS.map((l, i) => (
          <span key={i} className="w-3 text-center font-mono text-[9px] text-zinc-400">
            {l}
          </span>
        ))}
      </div>

      <div className="flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day) => {
              const ds = toDateString(day);
              const future = day > today;
              const active = activeDates.has(ds);
              return (
                <div
                  key={ds}
                  title={ds}
                  className={cn(
                    "size-3 transition-colors",
                    future
                      ? "bg-transparent"
                      : active
                      ? "bg-black"
                      : "bg-zinc-200",
                  )}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
