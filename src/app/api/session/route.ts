import { NextRequest, NextResponse } from "next/server";
import {
  createSession,
  saveAnswer,
  completeSession,
  getSession,
  getSessionAnswers,
  touchStreak,
} from "@/lib/db/queries";
import { recordUsageEvent } from "@/lib/db/usage";
import { getRequestUid, hasOversizedBody, isSafeId, safeNumber } from "@/lib/security";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  if (hasOversizedBody(req, 10_000)) {
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  }

  const uid = getRequestUid(req);
  if (!uid) return NextResponse.json({ error: "Missing uid" }, { status: 400 });

  try {
    const { type, totalQuestions } = await req.json();
    if (type !== "practice" && type !== "full" && type !== "lab") {
      return NextResponse.json({ error: "Invalid session type" }, { status: 400 });
    }
    const safeTotal = safeNumber(totalQuestions, 0, 0, 150);
    const id = nanoid();
    await createSession(id, uid, type, safeTotal);
    if (type === "practice" || type === "full") {
      await recordUsageEvent({
        id: nanoid(),
        userId: uid,
        event: type === "full" ? "full_exam_started" : "practice_started",
        path: type === "full" ? "/exam/full" : "/exam/practice",
        referrer: req.headers.get("referer"),
        userAgent: req.headers.get("user-agent"),
        metadata: { totalQuestions: safeTotal },
      }).catch((error) => console.error("Usage analytics session event error:", error));
    }
    return NextResponse.json({ sessionId: id });
  } catch (error) {
    console.error("Session POST error:", error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (hasOversizedBody(req, 25_000)) {
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  }

  const uid = getRequestUid(req);
  if (!uid) return NextResponse.json({ error: "Missing uid" }, { status: 400 });

  try {
    const body = await req.json();

    if (body.action === "answer") {
      const { sessionId, questionId, domain, objective, selected, correct, timeMs } = body;
      if (
        !isSafeId(sessionId) ||
        !isSafeId(questionId) ||
        typeof domain !== "string" ||
        typeof objective !== "string" ||
        typeof selected !== "string" ||
        typeof correct !== "boolean"
      ) {
        return NextResponse.json({ error: "Invalid answer payload" }, { status: 400 });
      }
      const session = await getSession(sessionId);
      if (!session || session.userId !== uid) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      await saveAnswer(
        nanoid(),
        sessionId,
        questionId,
        domain.slice(0, 120),
        objective.slice(0, 120),
        selected.slice(0, 40),
        correct,
        timeMs == null ? undefined : safeNumber(timeMs, 0, 0, 7_200_000),
      );
      return NextResponse.json({ ok: true });
    }

    if (body.action === "complete") {
      const { sessionId, correctAnswers, domainScores } = body;
      if (!isSafeId(sessionId)) {
        return NextResponse.json({ error: "Invalid session id" }, { status: 400 });
      }
      const session = await getSession(sessionId);
      if (!session || session.userId !== uid) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      const safeScores =
        domainScores && typeof domainScores === "object" && !Array.isArray(domainScores)
          ? domainScores
          : {};
      await completeSession(sessionId, safeNumber(correctAnswers, 0, 0, session.totalQuestions), safeScores);
      await touchStreak(uid);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Session PATCH error:", error);
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const uid = getRequestUid(req);
  if (!uid) return NextResponse.json({ error: "Missing uid" }, { status: 400 });

  try {
    const sessionId = req.nextUrl.searchParams.get("id");
    if (!isSafeId(sessionId)) return NextResponse.json({ error: "Missing session id" }, { status: 400 });

    const session = await getSession(sessionId);
    if (!session || session.userId !== uid) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const sessionAnswers = await getSessionAnswers(sessionId);
    return NextResponse.json({ session, answers: sessionAnswers });
  } catch (error) {
    console.error("Session GET error:", error);
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 });
  }
}
