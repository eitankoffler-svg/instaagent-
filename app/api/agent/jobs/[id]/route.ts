export const dynamic = "force-dynamic";

import { db } from "@/db";
import { agentJobs, agentLogs } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const jobId = parseInt(id);

  const [job] = await db
    .select()
    .from(agentJobs)
    .where(eq(agentJobs.id, jobId));

  if (!job) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const logs = await db
    .select()
    .from(agentLogs)
    .where(eq(agentLogs.jobId, jobId))
    .orderBy(asc(agentLogs.createdAt));

  return NextResponse.json({ job, logs });
}
