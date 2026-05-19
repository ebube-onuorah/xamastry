import { NextRequest, NextResponse } from "next/server";
import { explainWrongAnswer, generateStudyPlan } from "@/lib/groq";
import { getQuestionById } from "@/lib/questions";
import { getRequestUid, hasOversizedBody, isSafeId } from "@/lib/security";

const AI_DAILY_LIMIT = 5;

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

async function checkAndIncrementUsage(userId: string): Promise<{ allowed: boolean; used: number }> {
  try {
    const { db } = await import("@/lib/db");
    const { sql } = await import("drizzle-orm");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ai_usage (
        user_id TEXT NOT NULL,
        date    TEXT NOT NULL,
        count   INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (user_id, date)
      )
    `);

    const date = todayUTC();

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
    return { allowed: true, used: 0 };
  }
}

export async function POST(req: NextRequest) {
  if (hasOversizedBody(req, 20_000)) {
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  }

  try {
    const userId = getRequestUid(req);
    if (!userId) {
      return NextResponse.json({ error: "Missing identity token" }, { status: 401 });
    }

    const body = await req.json();
    const { allowed, used } = await checkAndIncrementUsage(userId);
    if (!allowed) {
      return NextResponse.json(
        { error: "limit_reached", used, limit: AI_DAILY_LIMIT },
        { status: 429 },
      );
    }

    if (body.type === "study_plan") {
      const domainScores =
        body.domainScores && typeof body.domainScores === "object" && !Array.isArray(body.domainScores)
          ? body.domainScores
          : {};
      const weakObjectives = Array.isArray(body.weakObjectives)
        ? body.weakObjectives.filter((item: unknown) => typeof item === "string").slice(0, 10)
        : [];
      const plan = await generateStudyPlan(domainScores, weakObjectives);
      return NextResponse.json({ plan });
    }

    const { questionId, studentAnswer } = body;
    if (!isSafeId(questionId) || typeof studentAnswer !== "string" || studentAnswer.length > 40) {
      return NextResponse.json({ error: "Missing questionId or studentAnswer" }, { status: 400 });
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
