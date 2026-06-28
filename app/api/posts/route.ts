import { db } from "@/db";
import { posts } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const niche = searchParams.get("niche");
  const status = searchParams.get("status");

  let query = db.select().from(posts).orderBy(desc(posts.createdAt)).$dynamic();

  if (niche && (niche === "travel" || niche === "food")) {
    query = query.where(eq(posts.niche, niche));
  }
  if (
    status &&
    (status === "draft" ||
      status === "scheduled" ||
      status === "published" ||
      status === "failed")
  ) {
    query = query.where(eq(posts.status, status));
  }

  const results = await query;
  return NextResponse.json(results);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    title,
    caption,
    hashtags,
    mediaUrl,
    thumbnailUrl,
    niche,
    contentType,
    status,
    scheduledAt,
  } = body;

  const result = await db
    .insert(posts)
    .values({
      title: title || "Untitled Post",
      caption: caption || "",
      hashtags: hashtags || "",
      mediaUrl: mediaUrl || "",
      thumbnailUrl: thumbnailUrl || "",
      niche: niche || "travel",
      contentType: contentType || "reel",
      status: status || "draft",
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    })
    .returning();

  return NextResponse.json(result[0], { status: 201 });
}
