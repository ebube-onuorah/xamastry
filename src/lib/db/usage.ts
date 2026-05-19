import { desc, sql } from "drizzle-orm";
import { db, usageEvents } from "./index";
import { truncate } from "@/lib/security";

type UsageEventInput = {
  id: string;
  userId: string | null;
  event: string;
  path: string;
  referrer: string | null;
  userAgent: string | null;
  metadata?: unknown;
};

function clampMetadata(metadata: unknown) {
  if (!metadata) return undefined;
  try {
    const serialized = JSON.stringify(metadata);
    if (serialized.length > 2_000) return { truncated: true };
    return JSON.parse(serialized) as unknown;
  } catch {
    return undefined;
  }
}

export async function ensureUsageEventsTable() {
  await db.execute(sql`
    create table if not exists usage_events (
      id text primary key,
      user_id text,
      event text not null,
      path text not null,
      referrer text,
      user_agent text,
      metadata jsonb,
      created_at timestamp not null default now()
    )
  `);

  await db.execute(sql`
    create index if not exists usage_events_created_at_idx
    on usage_events (created_at desc)
  `);

  await db.execute(sql`
    create index if not exists usage_events_event_idx
    on usage_events (event)
  `);
}

export async function recordUsageEvent(input: UsageEventInput) {
  await ensureUsageEventsTable();

  await db.insert(usageEvents).values({
    id: input.id,
    userId: input.userId,
    event: input.event.slice(0, 80),
    path: input.path.slice(0, 300),
    referrer: truncate(input.referrer, 500),
    userAgent: truncate(input.userAgent, 500),
    metadata: clampMetadata(input.metadata),
  });
}

export async function getUsageSummary(days = 30) {
  await ensureUsageEventsTable();

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const totals = await db
    .select({
      pageViews: sql<number>`count(*) filter (where ${usageEvents.event} = 'page_view')`,
      uniqueVisitors: sql<number>`count(distinct ${usageEvents.userId}) filter (where ${usageEvents.userId} is not null)`,
      totalEvents: sql<number>`count(*)`,
    })
    .from(usageEvents)
    .where(sql`${usageEvents.createdAt} >= ${since}`);

  const daily = await db
    .select({
      date: sql<string>`to_char(date_trunc('day', ${usageEvents.createdAt}), 'YYYY-MM-DD')`,
      pageViews: sql<number>`count(*) filter (where ${usageEvents.event} = 'page_view')`,
      uniqueVisitors: sql<number>`count(distinct ${usageEvents.userId}) filter (where ${usageEvents.userId} is not null)`,
    })
    .from(usageEvents)
    .where(sql`${usageEvents.createdAt} >= ${since}`)
    .groupBy(sql`date_trunc('day', ${usageEvents.createdAt})`)
    .orderBy(sql`date_trunc('day', ${usageEvents.createdAt})`);

  const topPages = await db
    .select({
      path: usageEvents.path,
      views: sql<number>`count(*)`,
      uniqueVisitors: sql<number>`count(distinct ${usageEvents.userId}) filter (where ${usageEvents.userId} is not null)`,
    })
    .from(usageEvents)
    .where(sql`${usageEvents.createdAt} >= ${since} and ${usageEvents.event} = 'page_view'`)
    .groupBy(usageEvents.path)
    .orderBy(sql`count(*) desc`)
    .limit(10);

  const referrers = await db
    .select({
      referrer: sql<string>`coalesce(nullif(${usageEvents.referrer}, ''), 'direct / unknown')`,
      visits: sql<number>`count(*)`,
    })
    .from(usageEvents)
    .where(sql`${usageEvents.createdAt} >= ${since} and ${usageEvents.event} = 'page_view'`)
    .groupBy(sql`coalesce(nullif(${usageEvents.referrer}, ''), 'direct / unknown')`)
    .orderBy(sql`count(*) desc`)
    .limit(10);

  const events = await db
    .select({
      event: usageEvents.event,
      count: sql<number>`count(*)`,
    })
    .from(usageEvents)
    .where(sql`${usageEvents.createdAt} >= ${since}`)
    .groupBy(usageEvents.event)
    .orderBy(sql`count(*) desc`);

  const recent = await db.query.usageEvents.findMany({
    orderBy: desc(usageEvents.createdAt),
    limit: 20,
  });

  return {
    days,
    totals: {
      pageViews: Number(totals[0]?.pageViews ?? 0),
      uniqueVisitors: Number(totals[0]?.uniqueVisitors ?? 0),
      totalEvents: Number(totals[0]?.totalEvents ?? 0),
    },
    daily: daily.map((row) => ({
      date: row.date,
      pageViews: Number(row.pageViews ?? 0),
      uniqueVisitors: Number(row.uniqueVisitors ?? 0),
    })),
    topPages: topPages.map((row) => ({
      path: row.path,
      views: Number(row.views ?? 0),
      uniqueVisitors: Number(row.uniqueVisitors ?? 0),
    })),
    referrers: referrers.map((row) => ({
      referrer: row.referrer,
      visits: Number(row.visits ?? 0),
    })),
    events: events.map((row) => ({
      event: row.event,
      count: Number(row.count ?? 0),
    })),
    recent,
  };
}
