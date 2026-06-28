import AppShell from "@/components/AppShell";
import { db } from "@/db";
import { analytics, posts } from "@/db/schema";
import { sql, desc, eq } from "drizzle-orm";
import {
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  TrendingUp,
  BarChart3,
} from "lucide-react";

export const dynamic = "force-dynamic";

function formatNumber(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

export default async function AnalyticsPage() {
  const [totals] = await db
    .select({
      totalViews: sql<number>`coalesce(sum(${analytics.views}), 0)`,
      totalLikes: sql<number>`coalesce(sum(${analytics.likes}), 0)`,
      totalComments: sql<number>`coalesce(sum(${analytics.comments}), 0)`,
      totalShares: sql<number>`coalesce(sum(${analytics.shares}), 0)`,
      totalSaves: sql<number>`coalesce(sum(${analytics.saves}), 0)`,
      avgEngagement: sql<number>`coalesce(avg(${analytics.engagementRate}), 0)`,
    })
    .from(analytics);

  const postAnalytics = await db
    .select({
      postId: analytics.postId,
      postTitle: posts.title,
      postNiche: posts.niche,
      postThumbnail: posts.thumbnailUrl,
      views: analytics.views,
      likes: analytics.likes,
      comments: analytics.comments,
      shares: analytics.shares,
      saves: analytics.saves,
      engagementRate: analytics.engagementRate,
      recordedAt: analytics.recordedAt,
    })
    .from(analytics)
    .leftJoin(posts, eq(analytics.postId, posts.id))
    .orderBy(desc(analytics.views));

  const statCards = [
    {
      label: "Total Views",
      value: formatNumber(Number(totals.totalViews)),
      icon: Eye,
      color: "text-blue-400",
      bg: "bg-blue-500/20",
    },
    {
      label: "Total Likes",
      value: formatNumber(Number(totals.totalLikes)),
      icon: Heart,
      color: "text-pink-400",
      bg: "bg-pink-500/20",
    },
    {
      label: "Comments",
      value: formatNumber(Number(totals.totalComments)),
      icon: MessageCircle,
      color: "text-green-400",
      bg: "bg-green-500/20",
    },
    {
      label: "Shares",
      value: formatNumber(Number(totals.totalShares)),
      icon: Share2,
      color: "text-purple-400",
      bg: "bg-purple-500/20",
    },
    {
      label: "Saves",
      value: formatNumber(Number(totals.totalSaves)),
      icon: Bookmark,
      color: "text-yellow-400",
      bg: "bg-yellow-500/20",
    },
    {
      label: "Avg. Engagement",
      value: `${Number(totals.avgEngagement).toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-500/20",
    },
  ];

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Analytics</h1>
          <p className="mt-1 text-text-secondary">
            Track engagement across your faceless content
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="bg-surface-2 border border-border rounded-2xl p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}
                  >
                    <Icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <p className="text-sm text-text-secondary">{card.label}</p>
                </div>
                <p className="text-3xl font-bold">{card.value}</p>
              </div>
            );
          })}
        </div>

        {/* Per-Post Analytics */}
        <div className="bg-surface-2 border border-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-accent" />
            Post Performance
          </h2>
          {postAnalytics.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 mx-auto text-text-secondary mb-3 opacity-30" />
              <p className="text-text-secondary">
                No analytics data yet. Publish posts to see performance metrics.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {postAnalytics.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 bg-surface-3 rounded-xl p-4"
                >
                  <div className="font-bold text-lg text-text-secondary w-8 text-center">
                    #{idx + 1}
                  </div>
                  {item.postThumbnail ? (
                    <img
                      src={item.postThumbnail}
                      alt=""
                      className="w-16 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-12 rounded-lg bg-surface-4 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-text-secondary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {item.postTitle || "Unknown Post"}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        item.postNiche === "travel"
                          ? "bg-cyan-500/20 text-cyan-400"
                          : "bg-orange-500/20 text-orange-400"
                      }`}
                    >
                      {item.postNiche || "—"}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-6 text-center">
                    <div>
                      <p className="font-bold">{formatNumber(item.views)}</p>
                      <p className="text-[10px] text-text-secondary">Views</p>
                    </div>
                    <div>
                      <p className="font-bold">{formatNumber(item.likes)}</p>
                      <p className="text-[10px] text-text-secondary">Likes</p>
                    </div>
                    <div>
                      <p className="font-bold">
                        {formatNumber(item.comments)}
                      </p>
                      <p className="text-[10px] text-text-secondary">
                        Comments
                      </p>
                    </div>
                    <div>
                      <p className="font-bold">{formatNumber(item.shares)}</p>
                      <p className="text-[10px] text-text-secondary">Shares</p>
                    </div>
                    <div>
                      <p className="font-bold">{formatNumber(item.saves)}</p>
                      <p className="text-[10px] text-text-secondary">Saves</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-400">
                      {item.engagementRate}%
                    </p>
                    <p className="text-[10px] text-text-secondary">
                      Engagement
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Visual Bar Chart */}
        {postAnalytics.length > 0 && (
          <div className="bg-surface-2 border border-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Views by Post</h2>
            <div className="space-y-3">
              {postAnalytics.map((item, idx) => {
                const maxViews = Math.max(
                  ...postAnalytics.map((p) => p.views)
                );
                const pct = maxViews > 0 ? (item.views / maxViews) * 100 : 0;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <p className="text-sm text-text-secondary w-48 truncate">
                      {item.postTitle || "Unknown"}
                    </p>
                    <div className="flex-1 bg-surface-4 rounded-full h-6 relative overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-ig-purple to-ig-pink flex items-center justify-end pr-2 transition-all duration-500"
                        style={{ width: `${Math.max(pct, 5)}%` }}
                      >
                        <span className="text-[10px] font-bold text-white">
                          {formatNumber(item.views)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
