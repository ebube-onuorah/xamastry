import { eq, and, lte, sql, desc } from "drizzle-orm";
import { db, examSessions, answers, labAttempts, cardStates, streaks } from "./index";

// ─── Streak ──────────────────────────────────────────────────────────────────

export async function touchStreak(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await db.query.streaks.findFirst({
    where: eq(streaks.userId, userId),
  });

  if (!existing) {
    await db.insert(streaks).values({ userId, current: 1, longest: 1, lastActive: new Date() });
    return;
  }

  const last = new Date(existing.lastActive);
  last.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((today.getTime() - last.getTime()) / 86400000);

  if (diffDays === 0) return; // already active today
  const newCurrent = diffDays === 1 ? existing.current + 1 : 1;
  const newLongest = Math.max(newCurrent, existing.longest);

  await db
    .update(streaks)
    .set({ current: newCurrent, longest: newLongest, lastActive: new Date() })
    .where(eq(streaks.userId, userId));
}

// ─── SM-2 card states ────────────────────────────────────────────────────────

export async function getDueCards(userId: string, limit = 20) {
  return db.query.cardStates.findMany({
    where: and(
      eq(cardStates.userId, userId),
      lte(cardStates.nextReview, new Date()),
    ),
    orderBy: cardStates.nextReview,
    limit,
  });
}

export async function upsertCardState(
  userId: string,
  questionId: string,
  easeFactor: number,
  interval: number,
  repetitions: number,
  nextReview: Date,
) {
  await db
    .insert(cardStates)
    .values({ userId, questionId, easeFactor, interval, repetitions, nextReview, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: [cardStates.userId, cardStates.questionId],
      set: { easeFactor, interval, repetitions, nextReview, updatedAt: new Date() },
    });
}

// ─── Sessions ────────────────────────────────────────────────────────────────

export async function createSession(
  id: string,
  userId: string,
  type: "practice" | "full" | "lab",
  totalQuestions: number,
) {
  await db.insert(examSessions).values({ id, userId, type, totalQuestions });
}

export async function saveAnswer(
  id: string,
  sessionId: string,
  questionId: string,
  domain: string,
  objective: string,
  selected: string,
  correct: boolean,
  timeMs?: number,
) {
  await db.insert(answers).values({ id, sessionId, questionId, domain, objective, selected, correct, timeMs });
}

export async function completeSession(
  sessionId: string,
  correctAnswers: number,
  domainScores: Record<string, number>,
) {
  // Scaled score: 0-1000, where 825+ is pass (approximation of Cisco's scaling)
  const total = await db.query.examSessions.findFirst({
    where: eq(examSessions.id, sessionId),
  });
  const pct = total ? correctAnswers / total.totalQuestions : 0;
  const score = Math.round(pct * 1000);

  await db
    .update(examSessions)
    .set({ correctAnswers, score, domainScores, completedAt: new Date() })
    .where(eq(examSessions.id, sessionId));
}

export async function getSession(sessionId: string) {
  return db.query.examSessions.findFirst({
    where: eq(examSessions.id, sessionId),
  });
}

export async function getSessionAnswers(sessionId: string) {
  return db.query.answers.findMany({
    where: eq(answers.sessionId, sessionId),
    orderBy: answers.createdAt,
  });
}

// ─── Dashboard stats ─────────────────────────────────────────────────────────

export async function getDashboardStats(userId: string) {
  // Recent sessions
  const recentSessions = await db.query.examSessions.findMany({
    where: eq(examSessions.userId, userId),
    orderBy: desc(examSessions.createdAt),
    limit: 5,
  });

  // Per-objective accuracy (weak areas = objectives < 60% correct)
  const objectiveStats = await db
    .select({
      objective: answers.objective,
      domain: answers.domain,
      total: sql<number>`count(*)`,
      correct: sql<number>`sum(case when ${answers.correct} then 1 else 0 end)`,
    })
    .from(answers)
    .innerJoin(examSessions, eq(answers.sessionId, examSessions.id))
    .where(eq(examSessions.userId, userId))
    .groupBy(answers.objective, answers.domain);

  // Per-domain accuracy
  const domainStats = await db
    .select({
      domain: answers.domain,
      total: sql<number>`count(*)`,
      correct: sql<number>`sum(case when ${answers.correct} then 1 else 0 end)`,
    })
    .from(answers)
    .innerJoin(examSessions, eq(answers.sessionId, examSessions.id))
    .where(eq(examSessions.userId, userId))
    .groupBy(answers.domain);

  // Streak
  const streak = await db.query.streaks.findFirst({
    where: eq(streaks.userId, userId),
  });

  // Due cards count
  const dueCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(cardStates)
    .where(and(eq(cardStates.userId, userId), lte(cardStates.nextReview, new Date())));

  return {
    recentSessions,
    objectiveStats,
    domainStats,
    streak: streak ?? { current: 0, longest: 0 },
    dueCount: Number(dueCount[0]?.count ?? 0),
  };
}

// ─── Lab attempts ────────────────────────────────────────────────────────────

export async function saveLabAttempt(
  id: string,
  userId: string,
  labId: string,
  labType: "cli" | "topology",
  tasksJson: unknown[],
  passedAll: boolean,
) {
  await db.insert(labAttempts).values({ id, userId, labId, labType, tasksJson, passedAll });
}
