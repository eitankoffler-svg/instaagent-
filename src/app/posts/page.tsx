import AppShell from "@/components/AppShell";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Send, Bot, Plus } from "lucide-react";
import Link from "next/link";
import PostActions from "./PostActions";

export const dynamic = "force-dynamic";

const statusColors: Record<string, string> = {
  draft: "bg-gray-500/20 text-gray-400",
  generating: "bg-purple-500/20 text-purple-400",
  ready: "bg-cyan-500/20 text-cyan-400",
  scheduled: "bg-blue-500/20 text-blue-400",
  posting: "bg-yellow-500/20 text-yellow-400",
  published: "bg-green-500/20 text-green-400",
  failed: "bg-red-500/20 text-red-400",
};

const nicheColors: Record<string, string> = {
  travel: "bg-cyan-500/20 text-cyan-400",
  food: "bg-orange-500/20 text-orange-400",
};

export default async function PostsPage() {
  const allPosts = await db
    .select()
    .from(posts)
    .orderBy(desc(posts.createdAt));

  const published = allPosts.filter((p) => p.status === "published").length;
  const scheduled = allPosts.filter((p) => p.status === "scheduled").length;
  const agentCreated = allPosts.filter((p) => p.agentJobId).length;

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
              <Send className="w-8 h-8 text-blue-400" />
              Posts
            </h1>
            <p className="mt-1 text-text-secondary">
              All content created by the agent
            </p>
          </div>
          <Link
            href="/agent"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-ig-purple via-ig-pink to-ig-orange text-white font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <Bot className="w-4 h-4" />
            Generate New
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-surface-2 border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold">{allPosts.length}</p>
            <p className="text-sm text-text-secondary">Total</p>
          </div>
          <div className="bg-surface-2 border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{published}</p>
            <p className="text-sm text-text-secondary">Published</p>
          </div>
          <div className="bg-surface-2 border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{scheduled}</p>
            <p className="text-sm text-text-secondary">Scheduled</p>
          </div>
          <div className="bg-surface-2 border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-accent">{agentCreated}</p>
            <p className="text-sm text-text-secondary">Agent-Created</p>
          </div>
        </div>

        {allPosts.length === 0 ? (
          <div className="bg-surface-2 border border-border rounded-2xl p-16 text-center">
            <Bot className="w-16 h-16 mx-auto text-text-secondary mb-4 opacity-30" />
            <h2 className="text-xl font-semibold mb-2">No posts yet</h2>
            <p className="text-text-secondary mb-6">
              Run the agent to auto-generate faceless content
            </p>
            <Link
              href="/agent"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-ig-purple via-ig-pink to-ig-orange text-white font-semibold hover:opacity-90"
            >
              <Bot className="w-5 h-5" />
              Launch Agent
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allPosts.map((post) => (
              <div
                key={post.id}
                className="bg-surface-2 border border-border rounded-2xl overflow-hidden hover:border-accent/40 transition-all group"
              >
                <div className="relative aspect-video bg-surface-3">
                  {post.thumbnailUrl ? (
                    <img src={post.thumbnailUrl} alt={post.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Send className="w-10 h-10 text-text-secondary opacity-30" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${nicheColors[post.niche] || ""}`}>
                      {post.niche === "travel" ? "✈️" : "🍽️"} {post.niche}
                    </span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[post.status] || ""}`}>
                      {post.status}
                    </span>
                  </div>
                  {post.agentJobId && (
                    <div className="absolute top-3 right-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-accent/30 text-accent font-medium flex items-center gap-1">
                        <Bot className="w-3 h-3" /> Agent
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-text-primary truncate">{post.title}</h3>
                  <p className="text-sm text-text-secondary mt-1 line-clamp-2">{post.caption}</p>
                  {post.scheduledAt && (
                    <p className="text-xs text-blue-400 mt-2">
                      📅 {new Date(post.scheduledAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  )}
                  {post.publishedAt && (
                    <p className="text-xs text-green-400 mt-2">
                      ✅ Published {new Date(post.publishedAt).toLocaleDateString()}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-xs text-text-secondary">{new Date(post.createdAt).toLocaleDateString()}</p>
                    <PostActions postId={post.id} currentStatus={post.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
