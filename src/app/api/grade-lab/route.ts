import { NextRequest, NextResponse } from "next/server";
import { gradeLab } from "@/lib/grader";
import type { DeviceState } from "@/lib/ios/state";
import type { TaskCheck } from "@/lib/grader";
import { saveLabAttempt, touchStreak } from "@/lib/db/queries";
import { recordUsageEvent } from "@/lib/db/usage";
import { getRequestUid, hasOversizedBody, isSafeId } from "@/lib/security";
import { readFileSync } from "fs";
import { join } from "path";
import { nanoid } from "nanoid";

interface LabDefinition {
  id: string;
  tasks: Array<{ id: string; description: string; hint?: string; check: TaskCheck }>;
}

function loadLab(labId: string): LabDefinition | null {
  try {
    const files = [
      `lab-001-basic-router-config`,
      `lab-002-static-routing`,
      `lab-003-vlan-config`,
      `lab-004-router-on-a-stick`,
      `lab-005-ospf-single-area`,
      `lab-006-device-security`,
      `lab-007-trunk-links`,
      `lab-008-loopback-and-serial`,
      `lab-009-banner-and-motd`,
      `lab-010-full-router-setup`,
    ];
    const fileName = files.find((f) => f.startsWith(labId));
    if (!fileName) return null;
    const raw = readFileSync(
      join(process.cwd(), "src", "content", "labs", "cli", `${fileName}.json`),
      "utf-8",
    );
    return JSON.parse(raw) as LabDefinition;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  if (hasOversizedBody(req, 120_000)) {
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  }

  try {
    const body = await req.json();
    const { labId, deviceState, labType, tasks: inlineTasks } = body as {
      labId: string;
      deviceState: DeviceState;
      labType?: "cli" | "topology";
      tasks?: Array<{ id: string; check: TaskCheck }>;
    };

    if (!isSafeId(labId) || !deviceState || (labType && labType !== "cli" && labType !== "topology")) {
      return NextResponse.json({ error: "labId and deviceState are required" }, { status: 400 });
    }

    // Topology labs pass tasks inline; CLI labs load from file
    let gradingTasks: Array<{ id: string; check: TaskCheck }>;

    if (inlineTasks && inlineTasks.length > 0) {
      if (inlineTasks.length > 40 || inlineTasks.some((task) => !isSafeId(task.id) || !task.check)) {
        return NextResponse.json({ error: "Invalid task payload" }, { status: 400 });
      }
      gradingTasks = inlineTasks;
    } else {
      const lab = loadLab(labId);
      if (!lab) {
        return NextResponse.json({ error: `Lab ${labId} not found` }, { status: 404 });
      }
      gradingTasks = lab.tasks.map((t) => ({ id: t.id, check: t.check }));
    }

    const { taskResults, allPassed } = gradeLab(deviceState, gradingTasks);
    const userId = getRequestUid(req);

    if (userId) {
      try {
        const resolvedLabType = labType ?? (inlineTasks?.length ? "topology" : "cli");
        await saveLabAttempt(
          nanoid(),
          userId,
          labId,
          resolvedLabType,
          Object.entries(taskResults).map(([id, result]) => ({ id, ...result })),
          allPassed,
        );
        await recordUsageEvent({
          id: nanoid(),
          userId,
          event: "lab_checked",
          path: `/labs/${resolvedLabType}/${labId}`,
          referrer: req.headers.get("referer"),
          userAgent: req.headers.get("user-agent"),
          metadata: {
            labId,
            labType: resolvedLabType,
            allPassed,
            passedTasks: Object.values(taskResults).filter((result) => result.passed).length,
            totalTasks: Object.keys(taskResults).length,
          },
        });
        await recordUsageEvent({
          id: nanoid(),
          userId,
          event: allPassed ? "lab_passed" : "lab_failed",
          path: `/labs/${resolvedLabType}/${labId}`,
          referrer: req.headers.get("referer"),
          userAgent: req.headers.get("user-agent"),
          metadata: {
            labId,
            labType: resolvedLabType,
            passedTasks: Object.values(taskResults).filter((result) => result.passed).length,
            totalTasks: Object.keys(taskResults).length,
          },
        });
        if (allPassed) await touchStreak(userId);
      } catch (saveError) {
        console.error("[grade-lab:save-attempt]", saveError);
      }
    }

    return NextResponse.json({ taskResults, allPassed, saved: Boolean(userId) });
  } catch (err) {
    console.error("[grade-lab]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
