export const dynamic = "force-dynamic";

import { db } from "@/db";
import { agentJobs } from "@/db/schema";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const jobs = await db
    .select()
    .from(agentJobs)
    .orderBy(desc(agentJobs.createdAt))
    .limit(50);

  return NextResponse.json(jobs);
}
