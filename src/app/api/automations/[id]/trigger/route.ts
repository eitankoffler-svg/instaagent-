import { db } from "@/db";
import { automationRules, instagramAccounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { runAgentPipeline } from "@/lib/agent-engine";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ruleId = parseInt(id);

  const [rule] = await db
    .select()
    .from(automationRules)
    .where(eq(automationRules.id, ruleId));

  if (!rule) {
    return NextResponse.json({ error: "Rule not found" }, { status: 404 });
  }

  // Find the account to use
  let accountId = rule.accountId;
  if (!accountId) {
    const [first] = await db.select().from(instagramAccounts).where(eq(instagramAccounts.isActive, true)).limit(1);
    if (!first) {
      return NextResponse.json({ error: "No Instagram account connected" }, { status: 400 });
    }
    accountId = first.id;
  }

  const contentType = rule.contentType as "reel" | "story" | "carousel" | "ad";

  const jobIds: number[] = [];
  for (let i = 0; i < rule.postsPerRun; i++) {
    const jobId = await runAgentPipeline(accountId, contentType, rule.autoPost, ruleId);
    jobIds.push(jobId);
  }

  await db
    .update(automationRules)
    .set({
      lastRunAt: new Date(),
      totalRuns: rule.totalRuns + 1,
      totalPostsCreated: rule.totalPostsCreated + rule.postsPerRun,
      nextRunAt: new Date(
        Date.now() +
          (rule.frequency === "hourly" ? 3600000 : rule.frequency === "daily" ? 86400000 : rule.frequency === "weekly" ? 604800000 : 86400000)
      ),
    })
    .where(eq(automationRules.id, ruleId));

  return NextResponse.json({ success: true, jobIds });
}
