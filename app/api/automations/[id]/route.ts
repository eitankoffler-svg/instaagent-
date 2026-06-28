import { db } from "@/db";
import { automationRules } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (body.name !== undefined) updateData.name = body.name;
  if (body.status !== undefined) updateData.status = body.status;
  if (body.niche !== undefined) updateData.niche = body.niche;
  if (body.contentType !== undefined) updateData.contentType = body.contentType;
  if (body.frequency !== undefined) updateData.frequency = body.frequency;
  if (body.postsPerRun !== undefined) updateData.postsPerRun = body.postsPerRun;
  if (body.autoPost !== undefined) updateData.autoPost = body.autoPost;

  const [result] = await db
    .update(automationRules)
    .set(updateData)
    .where(eq(automationRules.id, parseInt(id)))
    .returning();

  if (!result) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(result);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(automationRules).where(eq(automationRules.id, parseInt(id)));
  return NextResponse.json({ success: true });
}
