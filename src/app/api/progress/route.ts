import { NextRequest, NextResponse } from "next/server";
import { getDueCards, upsertCardState } from "@/lib/db/queries";
import { updateSM2, answerToQuality } from "@/lib/sm2";
import { getRequestUid, hasOversizedBody, isSafeId, safeNumber } from "@/lib/security";
import { getQuestionById } from "@/lib/questions";

export async function GET(req: NextRequest) {
  const uid = getRequestUid(req);
  if (!uid) return NextResponse.json({ dueIds: [] });

  try {
    const dueCards = await getDueCards(uid, 30);
    return NextResponse.json({ dueIds: dueCards.map((c) => c.questionId) });
  } catch (error) {
    console.error("Progress GET error:", error);
    return NextResponse.json({ dueIds: [] });
  }
}

export async function POST(req: NextRequest) {
  if (hasOversizedBody(req, 10_000)) {
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  }

  const uid = getRequestUid(req);
  if (!uid) return NextResponse.json({ ok: false });

  try {
    const { questionId, correct, timeMs, currentState } = await req.json();

    if (!isSafeId(questionId) || typeof correct !== "boolean" || !getQuestionById(questionId)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const safeTimeMs = safeNumber(timeMs, 0, 0, 7_200_000);
    const quality = answerToQuality(correct, safeTimeMs);
    const safeNextReview = currentState?.nextReview ? new Date(currentState.nextReview) : new Date();
    const nextReview = Number.isFinite(safeNextReview.getTime()) ? safeNextReview : new Date();

    const state = {
      userId: uid,
      questionId,
      easeFactor: safeNumber(currentState?.easeFactor, 2.5, 1.3, 3.5),
      interval: safeNumber(currentState?.interval, 1, 1, 365),
      repetitions: safeNumber(currentState?.repetitions, 0, 0, 100),
      nextReview,
      updatedAt: new Date(),
    };

    const newState = updateSM2(state, quality);

    await upsertCardState(
      uid,
      questionId,
      newState.easeFactor,
      newState.interval,
      newState.repetitions,
      newState.nextReview,
    );

    return NextResponse.json({ newState });
  } catch (error) {
    console.error("Progress POST error:", error);
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
  }
}
