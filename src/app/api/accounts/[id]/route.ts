import { db } from "@/db";
import { instagramAccounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const updateData: Record<string, unknown> = { updatedAt: new Date() };

  if (body.niche !== undefined) updateData.niche = body.niche;
  if (body.isActive !== undefined) updateData.isActive = body.isActive;
  if (body.displayName !== undefined) updateData.displayName = body.displayName;

  const [result] = await db
    .update(instagramAccounts)
    .set(updateData)
    .where(eq(instagramAccounts.id, parseInt(id)))
    .returning();

  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(result);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(instagramAccounts).where(eq(instagramAccounts.id, parseInt(id)));
  return NextResponse.json({ success: true });
}
