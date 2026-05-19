import { desc, sql } from "drizzle-orm";
import { db, answers, examSessions, labAttempts, usageEvents } from "./index";
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

function numberValue(value: unknown) {
  return Number(value ?? 0);
}

async function executeRows<T = Record<string, unknown>>(query: ReturnType<typeof sql>) {
  const result = await db.execute(query);
  if (Array.isArray(result)) return result as T[];
  return (result.rows ?? []) as T[];
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

async function ensureContentReportsTable() {
  await db.execute(sql`
    create table if not exists content_reports (
      id text primary key,
      user_id text,
      content_type text not null,
      content_id text not null,
      message text not null,
      path text,
      created_at timestamp not null default now()
    )
  `);
}

export async function recordUsageEvent(input: UsageEventInput) {
  await ensureUsageEventsTable();
  await ensureContentReportsTable();

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

  const returningVisitors = await executeRows<{ count: number }>(sql`
    select count(*) as count
    from (
      select ${usageEvents.userId} as user_id
      from ${usageEvents}
      where ${usageEvents.createdAt} >= ${since}
        and ${usageEvents.userId} is not null
      group by ${usageEvents.userId}
      having count(distinct date_trunc('day', ${usageEvents.createdAt})) > 1
    ) returning_users
  `);

  const engagedUsers = await executeRows<{
    engaged_users: number;
    completed_session_users: number;
    lab_users: number;
    known_anonymous_users: number;
  }>(sql`
    with engaged as (
      select user_id from exam_sessions where created_at >= ${since}
      union all
      select user_id from lab_attempts where completed_at >= ${since}
      union all
      select user_id from card_states where updated_at >= ${since}
      union all
      select user_id from streaks where last_active >= ${since}
      union all
      select user_id from ai_usage
      union all
      select user_id from usage_events
        where created_at >= ${since}
          and user_id is not null
          and event <> 'page_view'
    ),
    known as (
      select user_id from exam_sessions
      union all select user_id from lab_attempts
      union all select user_id from card_states
      union all select user_id from streaks
      union all select user_id from ai_usage
      union all select user_id from usage_events where user_id is not null
    )
    select
      (select count(distinct user_id) from engaged) as engaged_users,
      (select count(distinct user_id) from exam_sessions where completed_at >= ${since}) as completed_session_users,
      (select count(distinct user_id) from lab_attempts where completed_at >= ${since}) as lab_users,
      (select count(distinct user_id) from known) as known_anonymous_users
  `);

  const funnel = await executeRows<{
    visitors: number;
    homepage_visitors: number;
    practice_starters: number;
    completed_sessions: number;
    lab_openers: number;
    lab_checkers: number;
    dashboard_viewers: number;
  }>(sql`
    select
      count(distinct user_id) filter (
        where event = 'page_view' and user_id is not null
      ) as visitors,
      count(distinct user_id) filter (
        where event = 'page_view' and path = '/' and user_id is not null
      ) as homepage_visitors,
      count(distinct user_id) filter (
        where event in ('practice_started', 'full_exam_started') and user_id is not null
      ) as practice_starters,
      (select count(distinct user_id) from exam_sessions where completed_at >= ${since}) as completed_sessions,
      count(distinct user_id) filter (
        where event = 'page_view' and path like '/labs%' and user_id is not null
      ) as lab_openers,
      count(distinct user_id) filter (
        where event = 'lab_checked' and user_id is not null
      ) as lab_checkers,
      count(distinct user_id) filter (
        where event = 'page_view' and path = '/dashboard' and user_id is not null
      ) as dashboard_viewers
    from usage_events
    where created_at >= ${since}
  `);

  const topLabs = await db
    .select({
      labId: labAttempts.labId,
      labType: labAttempts.labType,
      checks: sql<number>`count(*)`,
      users: sql<number>`count(distinct ${labAttempts.userId})`,
      passes: sql<number>`sum(case when ${labAttempts.passedAll} then 1 else 0 end)`,
    })
    .from(labAttempts)
    .where(sql`${labAttempts.completedAt} >= ${since}`)
    .groupBy(labAttempts.labId, labAttempts.labType)
    .orderBy(sql`count(*) desc`)
    .limit(10);

  const missedDomains = await db
    .select({
      domain: answers.domain,
      attempts: sql<number>`count(*)`,
      missed: sql<number>`sum(case when ${answers.correct} then 0 else 1 end)`,
      accuracy: sql<number>`avg(case when ${answers.correct} then 1.0 else 0.0 end)`,
    })
    .from(answers)
    .innerJoin(examSessions, sql`${answers.sessionId} = ${examSessions.id}`)
    .where(sql`${answers.createdAt} >= ${since}`)
    .groupBy(answers.domain)
    .orderBy(sql`sum(case when ${answers.correct} then 0 else 1 end) desc`)
    .limit(10);

  let contentReports: Array<{
    id: string;
    content_type: string;
    content_id: string;
    message: string;
    path: string | null;
    created_at: Date;
  }> = [];

  try {
    contentReports = await executeRows(sql`
      select id, content_type, content_id, message, path, created_at
      from content_reports
      order by created_at desc
      limit 10
    `);
  } catch {
    contentReports = [];
  }

  const recent = await db.query.usageEvents.findMany({
    orderBy: desc(usageEvents.createdAt),
    limit: 20,
  });

  const audience = engagedUsers[0] ?? {
    engaged_users: 0,
    completed_session_users: 0,
    lab_users: 0,
    known_anonymous_users: 0,
  };
  const funnelRow = funnel[0] ?? {
    visitors: 0,
    homepage_visitors: 0,
    practice_starters: 0,
    completed_sessions: 0,
    lab_openers: 0,
    lab_checkers: 0,
    dashboard_viewers: 0,
  };

  return {
    days,
    totals: {
      pageViews: Number(totals[0]?.pageViews ?? 0),
      uniqueVisitors: Number(totals[0]?.uniqueVisitors ?? 0),
      totalEvents: Number(totals[0]?.totalEvents ?? 0),
    },
    audience: {
      visitors: numberValue(funnelRow.visitors),
      engagedUsers: numberValue(audience.engaged_users),
      returningVisitors: numberValue(returningVisitors[0]?.count),
      completedSessionUsers: numberValue(audience.completed_session_users),
      labUsers: numberValue(audience.lab_users),
      knownAnonymousUsers: numberValue(audience.known_anonymous_users),
    },
    funnel: {
      homepageVisitors: numberValue(funnelRow.homepage_visitors),
      practiceStarters: numberValue(funnelRow.practice_starters),
      completedSessions: numberValue(funnelRow.completed_sessions),
      labOpeners: numberValue(funnelRow.lab_openers),
      labCheckers: numberValue(funnelRow.lab_checkers),
      dashboardViewers: numberValue(funnelRow.dashboard_viewers),
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
    topLabs: topLabs.map((row) => ({
      labId: row.labId,
      labType: row.labType,
      checks: Number(row.checks ?? 0),
      users: Number(row.users ?? 0),
      passes: Number(row.passes ?? 0),
    })),
    missedDomains: missedDomains.map((row) => ({
      domain: row.domain,
      attempts: Number(row.attempts ?? 0),
      missed: Number(row.missed ?? 0),
      accuracy: Number(row.accuracy ?? 0),
    })),
    contentReports: contentReports.map((row) => ({
      id: row.id,
      contentType: row.content_type,
      contentId: row.content_id,
      message: row.message,
      path: row.path,
      createdAt: row.created_at,
    })),
    recent,
  };
}
