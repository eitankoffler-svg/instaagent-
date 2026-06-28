import AppShell from "@/components/AppShell";
import { db } from "@/db";
import { instagramAccounts } from "@/db/schema";
import { desc } from "drizzle-orm";
import ConnectFlow from "./ConnectFlow";

export const dynamic = "force-dynamic";

export default async function ConnectPage() {
  const accounts = await db
    .select()
    .from(instagramAccounts)
    .orderBy(desc(instagramAccounts.createdAt));

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto animate-fade-in">
        <ConnectFlow initialAccounts={accounts} />
      </div>
    </AppShell>
  );
}
