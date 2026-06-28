import { db } from "@/db";
import { automationRules } from "@/db/schema";
import { desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const rules = await db
    .select()
    .from(automationRules)
    .orderBy(desc(automationRules.createdAt));
  return NextResponse.json(rules);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const [rule] = await db
    .insert(automationRules)
    .values({
      name: body.name || "Untitled Rule",
      niche: body.niche || "travel",
      contentType: body.contentType || "reel",
      frequency: body.frequency || "daily",
      postsPerRun: body.postsPerRun || 1,
      autoPost: body.autoPost === true,
      nextRunAt: new Date(Date.now() + 86400000),
    })
    .returning();
  return NextResponse.json(rule, { status: 201 });
}
