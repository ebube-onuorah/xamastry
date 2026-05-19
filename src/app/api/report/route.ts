import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { getRequestUid, hasOversizedBody, isSafeId, isSafePath, truncate } from "@/lib/security";

async function ensureReportsTable() {
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

  await db.execute(sql`
    create index if not exists content_reports_created_at_idx
    on content_reports (created_at desc)
  `);
}

export async function POST(req: NextRequest) {
  if (hasOversizedBody(req, 5_000)) {
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  }

  try {
    const body = await req.json();
    const contentType = body.contentType;
    const contentId = body.contentId;
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const path = isSafePath(body.path) ? body.path : null;

    if (
      (contentType !== "question" && contentType !== "lab") ||
      !isSafeId(contentId) ||
      message.length < 5
    ) {
      return NextResponse.json({ error: "Invalid report" }, { status: 400 });
    }

    await ensureReportsTable();
    await db.execute(sql`
      insert into content_reports (id, user_id, content_type, content_id, message, path)
      values (
        ${nanoid()},
        ${getRequestUid(req)},
        ${contentType},
        ${contentId},
        ${message.slice(0, 800)},
        ${truncate(path, 300)}
      )
    `);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Content report error:", error);
    return NextResponse.json({ error: "Failed to send report" }, { status: 500 });
  }
}
