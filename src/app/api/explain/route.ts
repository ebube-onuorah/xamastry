import { NextRequest, NextResponse } from "next/server";
import { explainWrongAnswer, generateStudyPlan } from "@/lib/groq";
import { getQuestionById } from "@/lib/questions";

const AI_DAILY_LIMIT = 5;

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

async function checkAndIncrementUsage(userId: string): Promise<{ allowed: boolean; used: number }> {
  try {
    const { db } = await import("@/lib/db");
    const { sql } = await import("drizzle-orm");

    // Create table lazily — runs once, cheap thereafter
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ai_usage (
        user_id TEXT NOT NULL,
        date    TEXT NOT NULL,
        count   INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (user_id, date)
      )
    `);

    const date = todayUTC();

    // Atomically insert-or-increment, but only if under the limit
    const rows = await db.execute(sql`
      INSERT INTO ai_usage (user_id, date, count)
      VALUES (${userId}, ${date}, 1)
      ON CONFLICT (user_id, date) DO UPDATE
        SET count = ai_usage.count + 1
      RETURNING count
    `);

    const used = Number((rows.rows[0] as { count: number }).count);
    return { allowed: used <= AI_DAILY_LIMIT, used };
  } catch {
    // If DB is unavailable, allow the request rather than blocking users
    return { allowed: true, used: 0 };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Study plan request from results page — no rate limit applied
    if (body.type === "study_plan") {
      const { domainScores, weakObjectives } = body;
      const plan = await generateStudyPlan(domainScores, weakObjectives);
      return NextResponse.json({ plan });
    }

    // Per-question explanation
    const { questionId, studentAnswer } = body;
    if (!questionId || !studentAnswer) {
      return NextResponse.json({ error: "Missing questionId or studentAnswer" }, { status: 400 });
    }

    // Rate limit by browser UID
    const userId = req.cookies.get("xamastry-uid")?.value ?? req.headers.get("x-uid");
    if (userId) {
      const { allowed, used } = await checkAndIncrementUsage(userId);
      if (!allowed) {
        return NextResponse.json(
          { error: "limit_reached", used, limit: AI_DAILY_LIMIT },
          { status: 429 },
        );
      }
    }

    const question = getQuestionById(questionId);
    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const explanation = await explainWrongAnswer(question, studentAnswer);
    return NextResponse.json({ explanation });
  } catch (error) {
    console.error("Explain API error:", error);
    return NextResponse.json({ error: "Failed to generate explanation" }, { status: 500 });
  }
}
