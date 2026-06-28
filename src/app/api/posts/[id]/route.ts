import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await db
    .select()
    .from(posts)
    .where(eq(posts.id, parseInt(id)));
  if (result.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(result[0]);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (body.title !== undefined) updateData.title = body.title;
  if (body.caption !== undefined) updateData.caption = body.caption;
  if (body.hashtags !== undefined) updateData.hashtags = body.hashtags;
  if (body.mediaUrl !== undefined) updateData.mediaUrl = body.mediaUrl;
  if (body.thumbnailUrl !== undefined) updateData.thumbnailUrl = body.thumbnailUrl;
  if (body.niche !== undefined) updateData.niche = body.niche;
  if (body.contentType !== undefined) updateData.contentType = body.contentType;
  if (body.status !== undefined) updateData.status = body.status;
  if (body.scheduledAt !== undefined)
    updateData.scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null;
  if (body.status === "published") updateData.publishedAt = new Date();

  const result = await db
    .update(posts)
    .set(updateData)
    .where(eq(posts.id, parseInt(id)))
    .returning();

  if (result.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(result[0]);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(posts).where(eq(posts.id, parseInt(id)));
  return NextResponse.json({ success: true });
}
