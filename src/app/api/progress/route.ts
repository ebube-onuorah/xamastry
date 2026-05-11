import { NextRequest, NextResponse } from "next/server";
import { getDueCards, upsertCardState } from "@/lib/db/queries";
import { updateSM2, answerToQuality } from "@/lib/sm2";

function getUid(req: NextRequest): string | null {
  return (
    req.headers.get("x-uid") ??
    req.cookies.get("xamastry-uid")?.value ??
    null
  );
}

export async function GET(req: NextRequest) {
  const uid = getUid(req);
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
  const uid = getUid(req);
  if (!uid) return NextResponse.json({ ok: false });

  try {
    const { questionId, correct, timeMs, currentState } = await req.json();

    if (!questionId || correct === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const quality = answerToQuality(correct, timeMs);

    const state = {
      userId: uid,
      questionId,
      easeFactor: currentState?.easeFactor ?? 2.5,
      interval: currentState?.interval ?? 1,
      repetitions: currentState?.repetitions ?? 0,
      nextReview: currentState?.nextReview ? new Date(currentState.nextReview) : new Date(),
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
