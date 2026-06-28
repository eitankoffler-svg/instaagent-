import { db } from "@/db";
import { templates } from "@/db/schema";
import { desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const results = await db
    .select()
    .from(templates)
    .orderBy(desc(templates.createdAt));
  return NextResponse.json(results);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = await db
    .insert(templates)
    .values({
      name: body.name || "Untitled Template",
      caption: body.caption || "",
      hashtags: body.hashtags || "",
      niche: body.niche || "travel",
      contentType: body.contentType || "reel",
    })
    .returning();
  return NextResponse.json(result[0], { status: 201 });
}
