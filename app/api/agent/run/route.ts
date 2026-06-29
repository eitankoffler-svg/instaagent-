export const dynamic = "force-dynamic";

import { runAgentPipeline } from "@/lib/agent-engine";
import { db } from "@/db";
import { instagramAccounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Must have an account ID
  const accountId = body.accountId;
  if (!accountId) {
    // Try to find the first active account
    const [first] = await db
      .select()
      .from(instagramAccounts)
      .where(eq(instagramAccounts.isActive, true))
      .limit(1);

    if (!first) {
      return NextResponse.json(
        { error: "No Instagram account connected. Add one first." },
        { status: 400 }
      );
    }

    const contentType = (["reel", "story", "carousel", "ad"] as const).includes(
      body.contentType
    )
      ? body.contentType
      : "reel";

    const autoPost = body.autoPost === true;

    const jobId = await runAgentPipeline(first.id, contentType, autoPost);

    return NextResponse.json({ success: true, jobId });
  }

  const contentType = (["reel", "story", "carousel", "ad"] as const).includes(
    body.contentType
  )
    ? body.contentType
    : "reel";

  const autoPost = body.autoPost === true;

  const jobId = await runAgentPipeline(accountId, contentType, autoPost);

  return NextResponse.json({ success: true, jobId });
}
