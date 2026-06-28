import { db } from "@/db";
import { agentLogs } from "@/db/schema";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const logs = await db
    .select()
    .from(agentLogs)
    .orderBy(desc(agentLogs.createdAt))
    .limit(100);
  return NextResponse.json(logs);
}
