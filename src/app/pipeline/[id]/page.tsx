import AppShell from "@/components/AppShell";
import { db } from "@/db";
import { agentJobs, agentLogs, posts } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const PIPELINE_STEPS = [
  { key: "analyzing", label: "Analyzing", icon: "🔍" },
  { key: "idea", label: "Ideation", icon: "🧠" },
  { key: "scripting", label: "Scripting", icon: "📝" },
  { key: "generating_video", label: "Video Generation", icon: "🎬" },
  { key: "captioning", label: "Caption & Hashtags", icon: "✍️" },
  { key: "posting", label: "Publishing", icon: "📤" },
];

const STATUS_ORDER = [
  "pending", "analyzing", "idea", "scripting", "generating_video",
  "captioning", "scheduling", "posting", "completed",
];

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const jobId = parseInt(id);

  const [job] = await db
    .select()
    .from(agentJobs)
    .where(eq(agentJobs.id, jobId));

  if (!job) notFound();

  const logs = await db
    .select()
    .from(agentLogs)
    .where(eq(agentLogs.jobId, jobId))
    .orderBy(asc(agentLogs.createdAt));

  let post = null;
  if (job.postId) {
    const [p] = await db.select().from(posts).where(eq(posts.id, job.postId));
    post = p || null;
  }

  const isComplete = job.status === "completed";
  const isFailed = job.status === "failed";

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/agent"
            className="p-2 rounded-xl bg-surface-2 border border-border hover:bg-surface-3 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
              <Bot className="w-7 h-7 text-accent" />
              {job.title || `Job #${job.id}`}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  job.niche === "travel"
                    ? "bg-cyan-500/20 text-cyan-400"
                    : "bg-orange-500/20 text-orange-400"
                }`}
              >
                {job.niche === "travel" ? "✈️" : "🍽️"} {job.niche}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-surface-3 text-text-secondary">
                {job.contentType}
              </span>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  isComplete
                    ? "bg-green-500/20 text-green-400"
                    : isFailed
                    ? "bg-red-500/20 text-red-400"
                    : "bg-accent/20 text-accent"
                }`}
              >
                {isComplete ? "✅" : isFailed ? "❌" : "⏳"} {job.status}
              </span>
            </div>
          </div>
        </div>

        {/* Pipeline Steps */}
        <div className="bg-surface-2 border border-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-5">Pipeline Steps</h2>
          <div className="flex items-center justify-between gap-2">
            {PIPELINE_STEPS.map((step, i) => {
              const jobIdx = STATUS_ORDER.indexOf(job.status);
              const stepIdx = STATUS_ORDER.indexOf(step.key);
              const done = isComplete || jobIdx > stepIdx;
              const active = !isComplete && !isFailed && jobIdx === stepIdx;

              return (
                <div key={step.key} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all ${
                        done
                          ? "bg-green-500/20 ring-2 ring-green-500/50"
                          : active
                          ? "bg-accent/20 ring-2 ring-accent/50"
                          : isFailed
                          ? "bg-red-500/10"
                          : "bg-surface-3"
                      }`}
                    >
                      {done ? (
                        <CheckCircle2 className="w-7 h-7 text-green-400" />
                      ) : (
                        <span className={active ? "" : "opacity-40"}>{step.icon}</span>
                      )}
                    </div>
                    <p
                      className={`text-xs font-medium mt-2 ${
                        done ? "text-green-400" : active ? "text-accent" : "text-text-secondary"
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                  {i < PIPELINE_STEPS.length - 1 && (
                    <div
                      className={`w-8 h-0.5 mx-1 shrink-0 rounded ${
                        done ? "bg-green-400" : "bg-surface-4"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Generated Content */}
          <div className="space-y-4">
            {job.idea && (
              <div className="bg-surface-2 border border-border rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-yellow-400 mb-2">🧠 Content Idea</h3>
                <div className="bg-surface-3 rounded-xl p-3">
                  <pre className="text-sm text-text-primary whitespace-pre-wrap">
                    {(() => {
                      try {
                        const parsed = JSON.parse(job.idea);
                        return `Title: ${parsed.title}\nTopic: ${parsed.topic}\nStyle: ${parsed.style}`;
                      } catch {
                        return job.idea;
                      }
                    })()}
                  </pre>
                </div>
              </div>
            )}

            {job.script && (
              <div className="bg-surface-2 border border-border rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-blue-400 mb-2">📝 Video Script</h3>
                <div className="bg-surface-3 rounded-xl p-3">
                  <pre className="text-sm text-text-primary whitespace-pre-wrap">{job.script}</pre>
                </div>
              </div>
            )}

            {job.caption && (
              <div className="bg-surface-2 border border-border rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-cyan-400 mb-2">✍️ Caption</h3>
                <div className="bg-surface-3 rounded-xl p-3">
                  <p className="text-sm text-text-primary whitespace-pre-line">{job.caption}</p>
                </div>
              </div>
            )}

            {job.hashtags && (
              <div className="bg-surface-2 border border-border rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-purple-400 mb-2"># Hashtags</h3>
                <div className="flex flex-wrap gap-1.5">
                  {job.hashtags.split(" ").filter(Boolean).map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent/80"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right side — thumbnail + result */}
          <div className="space-y-4">
            {job.thumbnailUrl && (
              <div className="bg-surface-2 border border-border rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-pink-400 mb-2">🎬 Generated Video Thumbnail</h3>
                <div className="rounded-xl overflow-hidden">
                  <img
                    src={job.thumbnailUrl}
                    alt="Generated thumbnail"
                    className="w-full aspect-video object-cover"
                  />
                </div>
                {job.videoUrl && (
                  <p className="text-xs text-text-secondary mt-2 font-mono truncate">
                    📹 {job.videoUrl}
                  </p>
                )}
              </div>
            )}

            {post && (
              <div className="bg-surface-2 border border-border rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-green-400 mb-2">📤 Created Post</h3>
                <div className="bg-surface-3 rounded-xl p-4">
                  <p className="font-medium">{post.title}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        post.status === "published"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-blue-500/20 text-blue-400"
                      }`}
                    >
                      {post.status}
                    </span>
                    {post.scheduledAt && (
                      <span className="text-xs text-blue-400">
                        📅 {new Date(post.scheduledAt).toLocaleDateString()}
                      </span>
                    )}
                    {post.publishedAt && (
                      <span className="text-xs text-green-400">
                        ✅ Published {new Date(post.publishedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {job.videoPrompt && (
              <div className="bg-surface-2 border border-border rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-orange-400 mb-2">🤖 Video Generation Prompt</h3>
                <div className="bg-surface-3 rounded-xl p-3">
                  <p className="text-xs text-text-secondary italic">{job.videoPrompt}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Execution Logs */}
        <div className="bg-surface-2 border border-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Execution Log</h2>
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
                <span className="text-[10px] text-text-secondary shrink-0 mt-0.5 w-14">
                  [{log.step}]
                </span>
                <span
                  className={`flex-1 ${
                    log.level === "error" ? "text-red-300" : log.level === "success" ? "text-green-300" : "text-text-primary"
                  }`}
                >
                  {log.message}
                </span>
                <span className="text-[10px] text-text-secondary shrink-0">
                  {new Date(log.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
