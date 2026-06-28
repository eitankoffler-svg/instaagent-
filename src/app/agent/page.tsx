import AppShell from "@/components/AppShell";
import { db } from "@/db";
import { agentJobs, instagramAccounts } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import AgentRunner from "./AgentRunner";

export const dynamic = "force-dynamic";

export default async function AgentPage() {
  const jobs = await db
    .select()
    .from(agentJobs)
    .orderBy(desc(agentJobs.createdAt))
    .limit(20);

  const accounts = await db
    .select()
    .from(instagramAccounts)
    .where(eq(instagramAccounts.isActive, true))
    .orderBy(desc(instagramAccounts.createdAt));

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto animate-fade-in">
        <AgentRunner initialJobs={jobs} accounts={accounts} />
      </div>
    </AppShell>
  );
}
