import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getUsageSummary } from "@/lib/db/usage";

export const metadata: Metadata = {
  title: "Usage | Xamastry",
  robots: {
    index: false,
    follow: false,
  },
};

type UsagePageProps = {
  searchParams: Promise<{
    token?: string;
    days?: string;
  }>;
};

function formatDate(value: Date | string | null) {
  if (!value) return "Unknown";
  return new Date(value).toLocaleString();
}

export default async function UsagePage({ searchParams }: UsagePageProps) {
  const params = await searchParams;
  const token = params.token;

  if (!process.env.USAGE_STATS_TOKEN || token !== process.env.USAGE_STATS_TOKEN) {
    notFound();
  }

  const parsedDays = Number(params.days ?? "30");
  const days = Number.isFinite(parsedDays) ? Math.min(Math.max(Math.round(parsedDays), 1), 90) : 30;
  const summary = await getUsageSummary(days);

  return (
    <main className="min-h-screen bg-[#fafafa] px-6 py-8 text-black sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 border-b-2 border-black pb-6">
          <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Private</p>
          <h1 className="mt-2 font-playfair text-4xl font-extrabold">Xamastry usage</h1>
          <p className="mt-2 text-sm text-zinc-600">
            First-party usage events from the last {summary.days} days.
          </p>
        </div>

        <section className="mb-8 grid border-2 border-black sm:grid-cols-3">
          {[
            { label: "Page views", value: summary.totals.pageViews },
            { label: "Unique browsers", value: summary.totals.uniqueVisitors },
            { label: "Total events", value: summary.totals.totalEvents },
          ].map((item, index) => (
            <div
              key={item.label}
              className={`p-5 ${index < 2 ? "border-b-2 border-black sm:border-b-0 sm:border-r-2" : ""}`}
            >
              <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{item.label}</p>
              <p className="mt-2 font-mono text-4xl font-bold">{item.value}</p>
            </div>
          ))}
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="border-2 border-black p-5">
            <h2 className="border-b border-zinc-200 pb-3 font-mono text-sm font-bold uppercase tracking-widest">
              Daily visits
            </h2>
            <div className="mt-3 divide-y divide-zinc-200">
              {summary.daily.length === 0 ? (
                <p className="py-3 text-sm text-zinc-500">No events yet.</p>
              ) : (
                summary.daily.map((day) => (
                  <div key={day.date} className="grid grid-cols-[1fr_auto_auto] gap-4 py-3 font-mono text-xs">
                    <span>{day.date}</span>
                    <span>{day.pageViews} views</span>
                    <span className="text-zinc-500">{day.uniqueVisitors} browsers</span>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="border-2 border-black p-5">
            <h2 className="border-b border-zinc-200 pb-3 font-mono text-sm font-bold uppercase tracking-widest">
              Top pages
            </h2>
            <div className="mt-3 divide-y divide-zinc-200">
              {summary.topPages.length === 0 ? (
                <p className="py-3 text-sm text-zinc-500">No page views yet.</p>
              ) : (
                summary.topPages.map((page) => (
                  <div key={page.path} className="grid grid-cols-[1fr_auto] gap-4 py-3 text-sm">
                    <span className="truncate font-mono text-xs">{page.path}</span>
                    <span className="font-mono text-xs">{page.views} views</span>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="border-2 border-black p-5">
            <h2 className="border-b border-zinc-200 pb-3 font-mono text-sm font-bold uppercase tracking-widest">
              Referrers
            </h2>
            <div className="mt-3 divide-y divide-zinc-200">
              {summary.referrers.length === 0 ? (
                <p className="py-3 text-sm text-zinc-500">No referrers yet.</p>
              ) : (
                summary.referrers.map((referrer) => (
                  <div key={referrer.referrer} className="grid grid-cols-[1fr_auto] gap-4 py-3 text-sm">
                    <span className="truncate text-zinc-700">{referrer.referrer}</span>
                    <span className="font-mono text-xs">{referrer.visits}</span>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="border-2 border-black p-5">
            <h2 className="border-b border-zinc-200 pb-3 font-mono text-sm font-bold uppercase tracking-widest">
              Product actions
            </h2>
            <div className="mt-3 divide-y divide-zinc-200">
              {summary.events.length === 0 ? (
                <p className="py-3 text-sm text-zinc-500">No events yet.</p>
              ) : (
                summary.events.map((event) => (
                  <div key={event.event} className="grid grid-cols-[1fr_auto] gap-4 py-3 font-mono text-xs">
                    <span>{event.event.replace(/_/g, " ")}</span>
                    <span>{event.count}</span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <section className="mt-6 border-2 border-black p-5">
          <h2 className="border-b border-zinc-200 pb-3 font-mono text-sm font-bold uppercase tracking-widest">
            Recent events
          </h2>
          <div className="mt-3 divide-y divide-zinc-200">
            {summary.recent.map((event) => (
              <div key={event.id} className="grid gap-1 py-3 font-mono text-xs sm:grid-cols-[10rem_1fr_12rem]">
                <span>{event.event}</span>
                <span className="truncate text-zinc-600">{event.path}</span>
                <span className="text-zinc-500 sm:text-right">{formatDate(event.createdAt)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
