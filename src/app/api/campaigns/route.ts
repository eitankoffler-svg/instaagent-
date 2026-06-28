import { db } from "@/db";
import { campaigns } from "@/db/schema";
import { desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const results = await db
    .select()
    .from(campaigns)
    .orderBy(desc(campaigns.createdAt));
  return NextResponse.json(results);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = await db
    .insert(campaigns)
    .values({
      name: body.name || "Untitled Campaign",
      description: body.description || "",
      niche: body.niche || "travel",
      budget: body.budget || 0,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
    })
    .returning();
  return NextResponse.json(result[0], { status: 201 });
}
