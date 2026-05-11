import { NextRequest, NextResponse } from "next/server";
import { gradeLab } from "@/lib/grader";
import type { DeviceState } from "@/lib/ios/state";
import type { TaskCheck } from "@/lib/grader";
import { readFileSync } from "fs";
import { join } from "path";

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
  try {
    const body = await req.json();
    const { labId, deviceState, tasks: inlineTasks } = body as {
      labId: string;
      deviceState: DeviceState;
      tasks?: Array<{ id: string; check: TaskCheck }>;
    };

    if (!labId || !deviceState) {
      return NextResponse.json({ error: "labId and deviceState are required" }, { status: 400 });
    }

    // Topology labs pass tasks inline; CLI labs load from file
    let gradingTasks: Array<{ id: string; check: TaskCheck }>;

    if (inlineTasks && inlineTasks.length > 0) {
      gradingTasks = inlineTasks;
    } else {
      const lab = loadLab(labId);
      if (!lab) {
        return NextResponse.json({ error: `Lab ${labId} not found` }, { status: 404 });
      }
      gradingTasks = lab.tasks.map((t) => ({ id: t.id, check: t.check }));
    }

    const { taskResults, allPassed } = gradeLab(deviceState, gradingTasks);
    return NextResponse.json({ taskResults, allPassed });
  } catch (err) {
    console.error("[grade-lab]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
