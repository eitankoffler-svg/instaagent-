import AppShell from "@/components/AppShell";
import { db } from "@/db";
import { agentLogs, agentJobs } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { ScrollText } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

function timeAgo(d: Date) {
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default async function PipelinePage() {
  const logs = await db
    .select()
    .from(agentLogs)
    .orderBy(desc(agentLogs.createdAt))
    .limit(200);

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
            <ScrollText className="w-8 h-8 text-green-400" />
            Pipeline Log
          </h1>
          <p className="mt-1 text-text-secondary">
            Complete activity log from the agent
          </p>
        </div>

        <div className="bg-surface-2 border border-border rounded-2xl p-6">
          {logs.length === 0 ? (
            <div className="text-center py-12">
              <ScrollText className="w-14 h-14 mx-auto text-text-secondary opacity-30 mb-3" />
              <p className="text-text-secondary">No pipeline activity yet. Run the agent to see logs here.</p>
            </div>
          ) : (
            <div className="space-y-1 font-mono text-sm">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`flex items-start gap-3 p-2.5 rounded-lg ${
                    log.level === "error"
                      ? "bg-red-500/10"
                      : log.level === "success"
                      ? "bg-green-500/10"
                      : "bg-surface-3"
                  }`}
                >
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 mt-0.5 ${
                      log.level === "error"
                        ? "bg-red-500/30 text-red-400"
                        : log.level === "success"
                        ? "bg-green-500/30 text-green-400"
                        : "bg-blue-500/30 text-blue-400"
                    }`}
                  >
                    {log.level.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-text-secondary shrink-0 mt-0.5 w-16">
                    [{log.step}]
                  </span>
                  <span
                    className={`flex-1 ${
                      log.level === "error"
                        ? "text-red-300"
                        : log.level === "success"
                        ? "text-green-300"
                        : "text-text-primary"
                    }`}
                  >
                    {log.message}
                  </span>
                  <Link
                    href={`/pipeline/${log.jobId}`}
                    className="text-[10px] text-accent hover:underline shrink-0"
                  >
                    Job #{log.jobId}
                  </Link>
                  <span className="text-[10px] text-text-secondary shrink-0">
                    {timeAgo(new Date(log.createdAt))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
