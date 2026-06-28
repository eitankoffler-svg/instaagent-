"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bot,
  Play,
  Plane,
  UtensilsCrossed,
  Zap,
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronRight,
  RefreshCw,
  Link2,
  AlertCircle,
  User,
} from "lucide-react";

type AgentJob = {
  id: number;
  accountId: number | null;
  niche: string;
  contentType: string;
  status: string;
  title: string | null;
  thumbnailUrl: string | null;
  createdAt: string | Date;
  completedAt: string | Date | null;
};

type Account = {
  id: number;
  username: string;
  displayName: string;
  profilePicUrl: string;
  niche: string;
  followerCount: number;
  isActive: boolean;
};

const PIPELINE_STEPS = [
  { key: "analyzing", label: "Analyzing", icon: "🔍", desc: "Scanning your profile" },
  { key: "idea", label: "Ideation", icon: "🧠", desc: "Brainstorming content" },
  { key: "scripting", label: "Scripting", icon: "📝", desc: "Writing video script" },
  { key: "generating_video", label: "Video Gen", icon: "🎬", desc: "Creating faceless video" },
  { key: "captioning", label: "Captioning", icon: "✍️", desc: "Writing viral caption" },
  { key: "posting", label: "Publishing", icon: "📤", desc: "Posting to your IG" },
];

const STATUS_ORDER = ["pending", "analyzing", "idea", "scripting", "generating_video", "captioning", "scheduling", "posting", "completed"];

function getStepStatus(jobStatus: string, stepKey: string) {
  const jobIdx = STATUS_ORDER.indexOf(jobStatus);
  const stepIdx = PIPELINE_STEPS.findIndex((s) => s.key === stepKey);
  const stepStatusKey = PIPELINE_STEPS[stepIdx]?.key || "";
  const stepOrderIdx = STATUS_ORDER.indexOf(stepStatusKey);

  if (jobStatus === "completed") return "done";
  if (jobStatus === "failed") return "failed";
  if (jobIdx > stepOrderIdx) return "done";
  if (jobIdx === stepOrderIdx) return "active";
  return "pending";
}

function timeAgo(d: Date | string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function AgentRunner({
  initialJobs,
  accounts,
}: {
  initialJobs: AgentJob[];
  accounts: Account[];
}) {
  const router = useRouter();
  const [selectedAccountId, setSelectedAccountId] = useState<number>(accounts[0]?.id || 0);
  const [contentType, setContentType] = useState<"reel" | "story" | "carousel" | "ad">("reel");
  const [autoPost, setAutoPost] = useState(true);
  const [running, setRunning] = useState(false);
  const [lastJobId, setLastJobId] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState<string>("");
  const [completed, setCompleted] = useState(false);

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

  const runAgent = useCallback(async () => {
    if (!selectedAccountId) return;
    setRunning(true);
    setCompleted(false);
    setCurrentStep("pending");

    try {
      for (const step of PIPELINE_STEPS) {
        setCurrentStep(step.key);
        await new Promise((r) => setTimeout(r, 500));
      }

      const res = await fetch("/api/agent/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId: selectedAccountId, contentType, autoPost }),
      });

      if (res.ok) {
        const data = await res.json();
        setLastJobId(data.jobId);
        setCompleted(true);
        setCurrentStep("completed");
        router.refresh();
      }
    } catch {
      setCurrentStep("failed");
    } finally {
      setRunning(false);
    }
  }, [selectedAccountId, contentType, autoPost, router]);

  // No accounts connected
  if (accounts.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
            <Bot className="w-8 h-8 text-accent" />
            Content Agent
          </h1>
          <p className="mt-1 text-text-secondary">Connect your Instagram account first</p>
        </div>
        <div className="bg-surface-2 border border-border rounded-2xl p-16 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-ig-purple via-ig-pink to-ig-orange flex items-center justify-center mx-auto mb-6">
            <Link2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Connect Your Instagram</h2>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            Paste your Instagram profile link and the agent will automatically create faceless videos and post them to your account.
          </p>
          <Link
            href="/connect"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-ig-purple via-ig-pink to-ig-orange text-white font-bold text-lg hover:opacity-90"
          >
            <Link2 className="w-6 h-6" />
            Connect Instagram Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
          <Bot className="w-8 h-8 text-accent" />
          Content Agent
        </h1>
        <p className="mt-1 text-text-secondary">
          Auto-create & post faceless content to your Instagram
        </p>
      </div>

      {/* Account Selection + Config */}
      <div className="bg-surface-2 border border-border rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-5">Configure & Launch</h2>

        {/* Account Selector */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-text-secondary mb-2">Posting to</label>
          <div className="flex gap-3 flex-wrap">
            {accounts.map((acc) => (
              <button
                key={acc.id}
                onClick={() => setSelectedAccountId(acc.id)}
                disabled={running}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                  selectedAccountId === acc.id
                    ? "border-ig-pink bg-ig-pink/10 ring-1 ring-ig-pink/30"
                    : "border-border bg-surface-3 hover:bg-surface-4"
                }`}
              >
                <img src={acc.profilePicUrl} alt={acc.username} className="w-8 h-8 rounded-full" />
                <div className="text-left">
                  <p className="text-sm font-semibold">@{acc.username}</p>
                  <p className="text-[10px] text-text-secondary">{acc.followerCount.toLocaleString()} followers</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  acc.niche === "food" ? "bg-orange-500/20 text-orange-400" : "bg-cyan-500/20 text-cyan-400"
                }`}>
                  {acc.niche === "food" ? "🍽️" : "✈️"}
                </span>
              </button>
            ))}
            <Link
              href="/connect"
              className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-border text-text-secondary hover:border-accent/40 hover:text-accent transition-all"
            >
              <Link2 className="w-4 h-4" />
              <span className="text-sm">Add Account</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          {/* Content Type */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Content Type</label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value as typeof contentType)}
              disabled={running}
              className="w-full bg-surface-3 border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent"
            >
              <option value="reel">🎬 Reel (Best for faceless)</option>
              <option value="story">📱 Story</option>
              <option value="carousel">🖼️ Carousel</option>
              <option value="ad">📢 Ad</option>
            </select>
          </div>

          {/* Post Mode */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Post Mode</label>
            <div className="flex gap-2">
              <button
                onClick={() => setAutoPost(false)}
                disabled={running}
                className={`flex-1 py-3 rounded-xl border font-medium transition-all text-sm ${
                  !autoPost ? "border-blue-400 bg-blue-500/20 text-blue-400" : "border-border bg-surface-3 text-text-secondary"
                }`}
              >
                📅 Schedule
              </button>
              <button
                onClick={() => setAutoPost(true)}
                disabled={running}
                className={`flex-1 py-3 rounded-xl border font-medium transition-all text-sm ${
                  autoPost ? "border-green-400 bg-green-500/20 text-green-400" : "border-border bg-surface-3 text-text-secondary"
                }`}
              >
                ⚡ Auto-Post Now
              </button>
            </div>
          </div>
        </div>

        {/* Selected Account Preview */}
        {selectedAccount && (
          <div className="bg-surface-3 rounded-xl p-4 mb-5 flex items-center gap-4">
            <img src={selectedAccount.profilePicUrl} alt="" className="w-12 h-12 rounded-full ring-2 ring-ig-pink/50" />
            <div className="flex-1">
              <p className="font-semibold">Posting to @{selectedAccount.username}</p>
              <p className="text-xs text-text-secondary">
                Agent will create a {selectedAccount.niche} {contentType} and {autoPost ? "publish it immediately" : "schedule it"} to this account
              </p>
            </div>
            <span className={`text-sm px-3 py-1.5 rounded-full font-semibold ${
              selectedAccount.niche === "food" ? "bg-orange-500/20 text-orange-400" : "bg-cyan-500/20 text-cyan-400"
            }`}>
              {selectedAccount.niche === "food" ? "🍽️ Food" : "✈️ Travel"}
            </span>
          </div>
        )}

        {/* Launch Button */}
        <button
          onClick={runAgent}
          disabled={running || !selectedAccountId}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-ig-purple via-ig-pink to-ig-orange text-white font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {running ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Agent Running for @{selectedAccount?.username}...
            </>
          ) : (
            <>
              <Play className="w-6 h-6" />
              Launch Agent for @{selectedAccount?.username || "..."}
            </>
          )}
        </button>
      </div>

      {/* Pipeline Visualization */}
      <div className="bg-surface-2 border border-border rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-5">Pipeline Progress</h2>
        <div className="flex items-center justify-between gap-1">
          {PIPELINE_STEPS.map((step, i) => {
            const status = running || completed ? getStepStatus(currentStep, step.key) : "pending";
            return (
              <div key={step.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all duration-300 ${
                      status === "done"
                        ? "bg-green-500/20 ring-2 ring-green-500/50"
                        : status === "active"
                        ? "bg-accent/20 ring-2 ring-accent/50 animate-pulse"
                        : status === "failed"
                        ? "bg-red-500/20 ring-2 ring-red-500/50"
                        : "bg-surface-3"
                    }`}
                  >
                    {status === "done" ? (
                      <CheckCircle2 className="w-6 h-6 text-green-400" />
                    ) : status === "active" ? (
                      <Loader2 className="w-6 h-6 text-accent animate-spin" />
                    ) : status === "failed" ? (
                      <XCircle className="w-6 h-6 text-red-400" />
                    ) : (
                      <span className="opacity-40">{step.icon}</span>
                    )}
                  </div>
                  <p className={`text-[10px] font-medium mt-1.5 ${
                    status === "done" ? "text-green-400" : status === "active" ? "text-accent" : "text-text-secondary"
                  }`}>
                    {step.label}
                  </p>
                </div>
                {i < PIPELINE_STEPS.length - 1 && (
                  <ChevronRight className={`w-4 h-4 mx-0.5 shrink-0 ${status === "done" ? "text-green-400" : "text-surface-4"}`} />
                )}
              </div>
            );
          })}
        </div>

        {completed && lastJobId && (
          <div className="mt-5 bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
            <p className="text-green-400 font-semibold">🎉 Pipeline Complete for @{selectedAccount?.username}!</p>
            <p className="text-sm text-text-secondary mt-1">
              Job #{lastJobId} finished.{" "}
              <Link href={`/pipeline/${lastJobId}`} className="text-accent hover:underline">
                View pipeline details →
              </Link>
            </p>
          </div>
        )}
      </div>

      {/* Recent Jobs */}
      <div className="bg-surface-2 border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Agent Runs</h2>
          <button onClick={() => router.refresh()} className="p-2 rounded-lg hover:bg-surface-3 text-text-secondary transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        {initialJobs.length === 0 ? (
          <div className="text-center py-10">
            <Bot className="w-14 h-14 mx-auto text-text-secondary opacity-30 mb-3" />
            <p className="text-text-secondary">No agent runs yet. Hit Launch to create your first content!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {initialJobs.map((job) => {
              const isComplete = job.status === "completed";
              const isFailed = job.status === "failed";
              return (
                <Link
                  key={job.id}
                  href={`/pipeline/${job.id}`}
                  className="flex items-center gap-4 bg-surface-3 rounded-xl p-4 hover:bg-surface-4 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isComplete ? "bg-green-500/20" : isFailed ? "bg-red-500/20" : "bg-accent/20"
                  }`}>
                    {isComplete ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : isFailed ? <XCircle className="w-5 h-5 text-red-400" /> : <Loader2 className="w-5 h-5 text-accent animate-spin" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{job.title || `Job #${job.id}`}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${job.niche === "travel" ? "bg-cyan-500/20 text-cyan-400" : "bg-orange-500/20 text-orange-400"}`}>
                        {job.niche}
                      </span>
                      <span className={`text-xs ${isComplete ? "text-green-400" : isFailed ? "text-red-400" : "text-accent"}`}>{job.status}</span>
                    </div>
                  </div>
                  {job.thumbnailUrl && <img src={job.thumbnailUrl} alt="" className="w-14 h-10 rounded-lg object-cover" />}
                  <span className="text-xs text-text-secondary">{timeAgo(job.createdAt)}</span>
                  <ChevronRight className="w-4 h-4 text-text-secondary" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
