import { db } from "@/db";
import { instagramAccounts } from "@/db/schema";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const accounts = await db
    .select()
    .from(instagramAccounts)
    .orderBy(desc(instagramAccounts.createdAt));
  return NextResponse.json(accounts);
}
