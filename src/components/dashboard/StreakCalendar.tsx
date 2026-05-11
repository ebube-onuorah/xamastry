"use client";

import { cn } from "@/lib/utils";

interface StreakCalendarProps {
  /** Set of date strings "YYYY-MM-DD" that have activity */
  activeDates: Set<string>;
}

function toDateString(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function StreakCalendar({ activeDates }: StreakCalendarProps) {
  // Build last 16 weeks of dates (Sun→Sat columns)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find most recent Sunday
  const startDay = new Date(today);
  startDay.setDate(today.getDate() - today.getDay() - 16 * 7);

  const weeks: Date[][] = [];
  let cursor = new Date(startDay);
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
      {/* Day labels */}
      <div className="mb-1 flex gap-1 pl-0">
        {DAY_LABELS.map((l, i) => (
          <span key={i} className="w-3 text-center text-[9px] text-slate-600">
            {l}
          </span>
        ))}
      </div>

      {/* Grid — each column is one week */}
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
                    "size-3 rounded-sm transition-colors",
                    future
                      ? "bg-transparent"
                      : active
                      ? "bg-teal-400"
                      : "bg-white/[0.06]",
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
