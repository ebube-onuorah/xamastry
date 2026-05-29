import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getUsageSummary, recordUsageEvent } from "@/lib/db/usage";
import { getRequestUid, hasOversizedBody, isSafePath } from "@/lib/security";

const ALLOWED_EVENTS = new Set([
  "page_view",
  "practice_started",
  "full_exam_started",
  "lab_opened",
  "lab_checked",
  "lab_passed",
  "lab_failed",
  "lab_retry_clicked",
  "lab_hints_opened",
  "next_lab_clicked",
  "progress_backup_created",
  "progress_restored",
]);

export async function POST(req: NextRequest) {
  if (hasOversizedBody(req, 8_000)) {
    return NextResponse.json({ ok: false }, { status: 413 });
  }

  try {
    const body = await req.json();
    const event = typeof body.event === "string" ? body.event : "page_view";
    const path = body.path;

    if (!ALLOWED_EVENTS.has(event) || !isSafePath(path) || path.startsWith("/usage")) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    await recordUsageEvent({
      id: nanoid(),
      userId: getRequestUid(req),
      event,
      path,
      referrer: req.headers.get("referer"),
      userAgent: req.headers.get("user-agent"),
      metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : undefined,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Usage analytics POST error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const configuredToken = process.env.USAGE_STATS_TOKEN;
  const token = req.nextUrl.searchParams.get("token") ?? req.headers.get("x-usage-token");

  if (
    !configuredToken ||
    !token ||
    token.length !== configuredToken.length ||
    token !== configuredToken
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const daysParam = Number(req.nextUrl.searchParams.get("days") ?? "30");
  const days = Number.isFinite(daysParam) ? Math.min(Math.max(Math.round(daysParam), 1), 90) : 30;

  try {
    const summary = await getUsageSummary(days);
    return NextResponse.json(summary);
  } catch (error) {
    console.error("Usage analytics GET error:", error);
    return NextResponse.json({ error: "Failed to load usage stats" }, { status: 500 });
  }
}
