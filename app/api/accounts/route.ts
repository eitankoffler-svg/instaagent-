export const dynamic = "force-dynamic";

import { db } from "@/db";
import { instagramAccounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const accounts = await db
    .select()
    .from(instagramAccounts)
    .orderBy(instagramAccounts.createdAt);

  return NextResponse.json(accounts);
}
