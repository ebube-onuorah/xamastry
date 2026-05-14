"use client";

import { cn } from "@/lib/utils";

interface StreakCalendarProps {
  activeDates: Set<string>;
}

function toDateString(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatShortDate(d: Date) {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
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
  const activeCount = weeks.flat().filter((day) => day <= today && activeDates.has(toDateString(day))).length;
  const totalDays = weeks.flat().filter((day) => day <= today).length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-lg font-bold leading-none text-black">{activeCount}</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-zinc-400">
            active days in last {totalDays} days
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
          <span>No study</span>
          <span className="size-3 border border-zinc-300 bg-white" aria-hidden="true" />
          <span className="size-3 bg-black" aria-hidden="true" />
          <span>Studied</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="inline-grid grid-cols-[1.25rem_max-content] gap-x-1.5 sm:gap-x-2">
          <div />
          <div className="mb-1 grid grid-flow-col auto-cols-[0.75rem] gap-0.5 sm:auto-cols-[0.875rem] sm:gap-1">
            {weeks.map((week, wi) => {
              const firstDay = week[0];
              const showMonth = firstDay.getDate() <= 7 || wi === 0;
              return (
                <span key={wi} className="h-4 font-mono text-[9px] text-zinc-400">
                  {showMonth ? firstDay.toLocaleDateString(undefined, { month: "short" }) : ""}
                </span>
              );
            })}
          </div>

          <div className="grid grid-rows-7 gap-0.5 sm:gap-1">
            {DAY_LABELS.map((label, i) => (
              <span key={`${label}-${i}`} className="flex h-3 items-center font-mono text-[9px] text-zinc-500 sm:h-3.5">
                {label}
              </span>
            ))}
          </div>

          <div
            className="grid grid-flow-col grid-rows-7 auto-cols-[0.75rem] gap-0.5 sm:auto-cols-[0.875rem] sm:gap-1"
            aria-label={`${activeCount} active study days in the last ${totalDays} days`}
          >
            {weeks.map((week) =>
              week.map((day) => {
                const ds = toDateString(day);
                const future = day > today;
                const active = activeDates.has(ds);
                const label = future
                  ? `${formatShortDate(day)}: future date`
                  : active
                    ? `${formatShortDate(day)}: studied`
                    : `${formatShortDate(day)}: no study recorded`;

                return (
                  <div
                    key={ds}
                    title={label}
                    aria-label={label}
                    className={cn(
                      "size-3 border transition-colors sm:size-3.5",
                      future
                        ? "border-transparent bg-transparent"
                        : active
                          ? "border-black bg-black"
                          : "border-zinc-300 bg-white",
                    )}
                  />
                );
              }),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
