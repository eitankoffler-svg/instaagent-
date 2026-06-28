import AppShell from "@/components/AppShell";
import { db } from "@/db";
import { automationRules } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Zap } from "lucide-react";
import AutomationManager from "./AutomationManager";

export const dynamic = "force-dynamic";

export default async function AutomationsPage() {
  const rules = await db
    .select()
    .from(automationRules)
    .orderBy(desc(automationRules.createdAt));

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto animate-fade-in">
        <AutomationManager initialRules={rules} />
      </div>
    </AppShell>
  );
}
