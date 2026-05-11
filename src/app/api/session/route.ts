import { NextRequest, NextResponse } from "next/server";
import {
  createSession,
  saveAnswer,
  completeSession,
  getSession,
  getSessionAnswers,
  touchStreak,
} from "@/lib/db/queries";
import { nanoid } from "nanoid";

function getUid(req: NextRequest): string | null {
  return (
    req.headers.get("x-uid") ??
    req.cookies.get("xamastry-uid")?.value ??
    null
  );
}

export async function POST(req: NextRequest) {
  const uid = getUid(req);
  if (!uid) return NextResponse.json({ error: "Missing uid" }, { status: 400 });

  try {
    const { type, totalQuestions } = await req.json();
    const id = nanoid();
    await createSession(id, uid, type, totalQuestions);
    return NextResponse.json({ sessionId: id });
  } catch (error) {
    console.error("Session POST error:", error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const uid = getUid(req);
  if (!uid) return NextResponse.json({ error: "Missing uid" }, { status: 400 });

  try {
    const body = await req.json();

    if (body.action === "answer") {
      const { sessionId, questionId, domain, objective, selected, correct, timeMs } = body;
      await saveAnswer(nanoid(), sessionId, questionId, domain, objective, selected, correct, timeMs);
      return NextResponse.json({ ok: true });
    }

    if (body.action === "complete") {
      const { sessionId, correctAnswers, domainScores } = body;
      await completeSession(sessionId, correctAnswers, domainScores);
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
  const uid = getUid(req);
  if (!uid) return NextResponse.json({ error: "Missing uid" }, { status: 400 });

  try {
    const sessionId = req.nextUrl.searchParams.get("id");
    if (!sessionId) return NextResponse.json({ error: "Missing session id" }, { status: 400 });

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
