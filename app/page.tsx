import AppShell from "@/components/AppShell";
import { db } from "@/db";
import { posts, agentJobs, agentLogs, automationRules, analytics, instagramAccounts } from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import {
  Bot,
  Zap,
  Send,
  TrendingUp,
  Activity,
  ScrollText,
  BarChart3,
  Link2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

function formatNumber(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

function timeAgo(d: Date) {
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const jobStatusIcon: Record<string, { icon: string; color: string }> = {
  pending: { icon: "⏳", color: "text-gray-400" },
  analyzing: { icon: "🔍", color: "text-blue-400" },
  idea: { icon: "🧠", color: "text-yellow-400" },
  scripting: { icon: "📝", color: "text-blue-400" },
  generating_video: { icon: "🎬", color: "text-purple-400" },
  captioning: { icon: "✍️", color: "text-cyan-400" },
  scheduling: { icon: "📅", color: "text-orange-400" },
  posting: { icon: "📤", color: "text-pink-400" },
  completed: { icon: "✅", color: "text-green-400" },
  failed: { icon: "❌", color: "text-red-400" },
};

export default async function DashboardPage() {
  const [
    accounts,
    totalJobsRes,
    completedJobsRes,
    totalPostsRes,
    publishedPostsRes,
    scheduledPostsRes,
    activeRulesRes,
    totalViewsRes,
    recentJobs,
    recentLogs,
  ] = await Promise.all([
    db.select().from(instagramAccounts).where(eq(instagramAccounts.isActive, true)).orderBy(desc(instagramAccounts.createdAt)),
    db.select({ count: sql<number>`count(*)` }).from(agentJobs),
    db.select({ count: sql<number>`count(*)` }).from(agentJobs).where(eq(agentJobs.status, "completed")),
    db.select({ count: sql<number>`count(*)` }).from(posts),
    db.select({ count: sql<number>`count(*)` }).from(posts).where(eq(posts.status, "published")),
    db.select({ count: sql<number>`count(*)` }).from(posts).where(eq(posts.status, "scheduled")),
    db.select({ count: sql<number>`count(*)` }).from(automationRules).where(eq(automationRules.status, "active")),
    db.select({ total: sql<number>`coalesce(sum(views), 0)` }).from(analytics),
    db.select().from(agentJobs).orderBy(desc(agentJobs.createdAt)).limit(6),
    db.select().from(agentLogs).orderBy(desc(agentLogs.createdAt)).limit(12),
  ]);

  const totalJobs = Number(totalJobsRes[0]?.count ?? 0);
  const completedJobs = Number(completedJobsRes[0]?.count ?? 0);
  const totalPosts = Number(totalPostsRes[0]?.count ?? 0);
  const publishedPosts = Number(publishedPostsRes[0]?.count ?? 0);
  const scheduledPosts = Number(scheduledPostsRes[0]?.count ?? 0);
  const activeRules = Number(activeRulesRes[0]?.count ?? 0);
  const totalViews = Number(totalViewsRes[0]?.total ?? 0);

  const hasAccounts = accounts.length > 0;

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
              <Bot className="w-8 h-8 text-accent" />
              Dashboard
            </h1>
            <p className="mt-1 text-text-secondary">
              Automated faceless video agent for Instagram
            </p>
          </div>
          {hasAccounts ? (
            <Link
              href="/agent"
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-ig-purple via-ig-pink to-ig-orange text-white font-semibold hover:opacity-90"
            >
              <Zap className="w-5 h-5" />
              Run Agent
            </Link>
          ) : (
            <Link
              href="/connect"
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-ig-purple via-ig-pink to-ig-orange text-white font-semibold hover:opacity-90"
            >
              <Link2 className="w-5 h-5" />
              Connect Instagram
            </Link>
          )}
        </div>

        {/* Connected Accounts Banner */}
        {!hasAccounts ? (
          <div className="bg-surface-2 border-2 border-dashed border-ig-pink/40 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-ig-purple via-ig-pink to-ig-orange flex items-center justify-center mx-auto mb-4">
              <Link2 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2">Connect Your Instagram Account</h2>
            <p className="text-text-secondary mb-5 max-w-lg mx-auto">
              Paste your Instagram profile link and the agent will automatically analyze your niche, create faceless videos, and post content to your account.
            </p>
            <Link
              href="/connect"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-ig-purple via-ig-pink to-ig-orange text-white font-bold text-lg hover:opacity-90"
            >
              <Link2 className="w-6 h-6" />
              Get Started — Connect Account
            </Link>
          </div>
        ) : (
          <div className="bg-surface-2 border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-text-secondary">Connected Accounts</h2>
              <Link href="/connect" className="text-xs text-accent hover:underline">Manage →</Link>
            </div>
            <div className="flex gap-3 flex-wrap">
              {accounts.map((acc) => (
                <div key={acc.id} className="flex items-center gap-3 bg-surface-3 rounded-xl px-4 py-3">
                  <img src={acc.profilePicUrl} alt={acc.username} className="w-10 h-10 rounded-full ring-2 ring-ig-pink/50" />
                  <div>
                    <p className="font-semibold text-sm">@{acc.username}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        acc.niche === "food" ? "bg-orange-500/20 text-orange-400" : "bg-cyan-500/20 text-cyan-400"
                      }`}>
                        {acc.niche}
                      </span>
                      <span className="text-[10px] text-text-secondary">{acc.followerCount.toLocaleString()} followers</span>
                    </div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse ml-1" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface-2 border border-border rounded-2xl p-5 hover:border-accent/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Agent Runs</p>
                <p className="text-3xl font-bold mt-1">{totalJobs}</p>
                <p className="text-xs text-green-400 mt-1">{completedJobs} completed</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-surface-2 border border-border rounded-2xl p-5 hover:border-accent/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Posts Created</p>
                <p className="text-3xl font-bold mt-1">{totalPosts}</p>
                <p className="text-xs text-blue-400 mt-1">{scheduledPosts} scheduled</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Send className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-surface-2 border border-border rounded-2xl p-5 hover:border-accent/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Automations</p>
                <p className="text-3xl font-bold mt-1">{activeRules}</p>
                <p className="text-xs text-orange-400 mt-1">active rules</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-surface-2 border border-border rounded-2xl p-5 hover:border-accent/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Published</p>
                <p className="text-3xl font-bold mt-1">{publishedPosts}</p>
                <p className="text-xs text-pink-400 mt-1">{formatNumber(totalViews)} views</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Recent Agent Jobs */}
          <div className="lg:col-span-3 bg-surface-2 border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-accent" />
                Recent Agent Jobs
              </h2>
              <Link href="/agent" className="text-sm text-accent hover:underline">View all →</Link>
            </div>
            {recentJobs.length === 0 ? (
              <div className="text-center py-10">
                <Bot className="w-14 h-14 mx-auto text-text-secondary opacity-30 mb-3" />
                <p className="text-text-secondary mb-1">No agent runs yet</p>
                <Link href={hasAccounts ? "/agent" : "/connect"} className="text-sm text-accent hover:underline">
                  {hasAccounts ? "Run Agent →" : "Connect account →"}
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentJobs.map((job) => {
                  const st = jobStatusIcon[job.status] || { icon: "⏳", color: "text-gray-400" };
                  return (
                    <Link key={job.id} href={`/pipeline/${job.id}`} className="flex items-center gap-3 bg-surface-3 rounded-xl p-3 hover:bg-surface-4 transition-colors">
                      <span className="text-lg">{st.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{job.title || `Job #${job.id}`}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${job.niche === "travel" ? "bg-cyan-500/20 text-cyan-400" : "bg-orange-500/20 text-orange-400"}`}>
                            {job.niche}
                          </span>
                          <span className={`text-xs ${st.color}`}>{job.status}</span>
                        </div>
                      </div>
                      {job.thumbnailUrl && <img src={job.thumbnailUrl} alt="" className="w-12 h-9 rounded-lg object-cover" />}
                      <span className="text-xs text-text-secondary">{timeAgo(new Date(job.createdAt))}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-2 bg-surface-2 border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ScrollText className="w-5 h-5 text-green-400" />
                Agent Activity
              </h2>
              <Link href="/pipeline" className="text-sm text-accent hover:underline">Full log →</Link>
            </div>
            {recentLogs.length === 0 ? (
              <div className="text-center py-10">
                <ScrollText className="w-10 h-10 mx-auto text-text-secondary opacity-30 mb-2" />
                <p className="text-sm text-text-secondary">No activity yet</p>
              </div>
            ) : (
              <div className="space-y-1 max-h-[400px] overflow-y-auto">
                {recentLogs.map((log) => (
                  <div key={log.id} className={`text-xs p-2 rounded-lg ${
                    log.level === "error" ? "bg-red-500/10 text-red-300" : log.level === "success" ? "bg-green-500/10 text-green-300" : "bg-surface-3 text-text-secondary"
                  }`}>
                    <span className="font-mono">{log.message}</span>
                    <br />
                    <span className="text-[10px] opacity-60">Job #{log.jobId} · {timeAgo(new Date(log.createdAt))}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/connect" className="flex flex-col items-center gap-3 bg-surface-2 border border-border rounded-2xl p-6 hover:border-ig-pink/40 transition-all text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-ig-purple via-ig-pink to-ig-orange flex items-center justify-center">
              <Link2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="font-semibold">Connect Account</p>
              <p className="text-xs text-text-secondary mt-1">Add your Instagram</p>
            </div>
          </Link>
          <Link href="/agent" className="flex flex-col items-center gap-3 bg-surface-2 border border-border rounded-2xl p-6 hover:border-accent/40 transition-all text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="font-semibold">Run Agent</p>
              <p className="text-xs text-text-secondary mt-1">Create & post content</p>
            </div>
          </Link>
          <Link href="/automations" className="flex flex-col items-center gap-3 bg-surface-2 border border-border rounded-2xl p-6 hover:border-accent/40 transition-all text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="font-semibold">Automations</p>
              <p className="text-xs text-text-secondary mt-1">Recurring schedules</p>
            </div>
          </Link>
          <Link href="/analytics" className="flex flex-col items-center gap-3 bg-surface-2 border border-border rounded-2xl p-6 hover:border-accent/40 transition-all text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="font-semibold">Analytics</p>
              <p className="text-xs text-text-secondary mt-1">Performance tracking</p>
            </div>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
