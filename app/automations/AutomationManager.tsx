"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Zap,
  Plus,
  Play,
  Pause,
  Trash2,
  Plane,
  UtensilsCrossed,
  X,
  Loader2,
  Clock,
  CalendarDays,
  Repeat,
  Bot,
} from "lucide-react";

type Rule = {
  id: number;
  name: string;
  niche: string;
  contentType: string;
  status: string;
  frequency: string;
  postsPerRun: number;
  autoPost: boolean;
  totalRuns: number;
  totalPostsCreated: number;
  lastRunAt: string | Date | null;
  nextRunAt: string | Date | null;
  createdAt: string | Date;
};

function timeAgo(d: Date | string | null) {
  if (!d) return "Never";
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 0) return `in ${Math.abs(Math.floor(s / 3600))}h`;
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function AutomationManager({ initialRules }: { initialRules: Rule[] }) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [triggering, setTriggering] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    niche: "travel" as "travel" | "food",
    contentType: "reel" as "reel" | "story" | "carousel" | "ad",
    frequency: "daily",
    postsPerRun: 1,
    autoPost: false,
  });
  const [saving, setSaving] = useState(false);

  const createRule = async () => {
    setSaving(true);
    try {
      await fetch("/api/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setShowCreate(false);
      setForm({ name: "", niche: "travel", contentType: "reel", frequency: "daily", postsPerRun: 1, autoPost: false });
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const toggleRule = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "paused" : "active";
    await fetch(`/api/automations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
  };

  const deleteRule = async (id: number) => {
    if (!confirm("Delete this automation rule?")) return;
    await fetch(`/api/automations/${id}`, { method: "DELETE" });
    router.refresh();
  };

  const triggerRule = async (id: number) => {
    setTriggering(id);
    try {
      await fetch(`/api/automations/${id}/trigger`, { method: "POST" });
      router.refresh();
    } finally {
      setTriggering(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
            <Zap className="w-8 h-8 text-orange-400" />
            Automations
          </h1>
          <p className="mt-1 text-text-secondary">
            Set up recurring agent runs to auto-create and post content
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-ig-purple via-ig-pink to-ig-orange text-white font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          New Rule
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-surface-2 border border-border rounded-2xl w-full max-w-lg p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-400" />
                New Automation Rule
              </h2>
              <button onClick={() => setShowCreate(false)} className="p-1 rounded-lg hover:bg-surface-3">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Rule Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g., Daily Travel Reels"
                className="w-full bg-surface-3 border border-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Niche</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setForm((f) => ({ ...f, niche: "travel" }))}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-sm font-medium ${
                      form.niche === "travel" ? "border-cyan-400 bg-cyan-500/20 text-cyan-400" : "border-border bg-surface-3 text-text-secondary"
                    }`}
                  >
                    <Plane className="w-3.5 h-3.5" /> Travel
                  </button>
                  <button
                    onClick={() => setForm((f) => ({ ...f, niche: "food" }))}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-sm font-medium ${
                      form.niche === "food" ? "border-orange-400 bg-orange-500/20 text-orange-400" : "border-border bg-surface-3 text-text-secondary"
                    }`}
                  >
                    <UtensilsCrossed className="w-3.5 h-3.5" /> Food
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Content Type</label>
                <select
                  value={form.contentType}
                  onChange={(e) => setForm((f) => ({ ...f, contentType: e.target.value as typeof form.contentType }))}
                  className="w-full bg-surface-3 border border-border rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent"
                >
                  <option value="reel">🎬 Reel</option>
                  <option value="story">📱 Story</option>
                  <option value="carousel">🖼️ Carousel</option>
                  <option value="ad">📢 Ad</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Frequency</label>
                <select
                  value={form.frequency}
                  onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value }))}
                  className="w-full bg-surface-3 border border-border rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent"
                >
                  <option value="hourly">Every Hour</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Posts Per Run</label>
                <select
                  value={form.postsPerRun}
                  onChange={(e) => setForm((f) => ({ ...f, postsPerRun: parseInt(e.target.value) }))}
                  className="w-full bg-surface-3 border border-border rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent"
                >
                  <option value={1}>1 post</option>
                  <option value={2}>2 posts</option>
                  <option value={3}>3 posts</option>
                  <option value={5}>5 posts</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Post Mode</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setForm((f) => ({ ...f, autoPost: false }))}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-medium ${
                    !form.autoPost ? "border-blue-400 bg-blue-500/20 text-blue-400" : "border-border bg-surface-3 text-text-secondary"
                  }`}
                >
                  📅 Schedule Only
                </button>
                <button
                  onClick={() => setForm((f) => ({ ...f, autoPost: true }))}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-medium ${
                    form.autoPost ? "border-green-400 bg-green-500/20 text-green-400" : "border-border bg-surface-3 text-text-secondary"
                  }`}
                >
                  ⚡ Auto-Publish
                </button>
              </div>
            </div>

            <button
              disabled={saving || !form.name}
              onClick={createRule}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-ig-purple via-ig-pink to-ig-orange text-white font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Automation"}
            </button>
          </div>
        </div>
      )}

      {/* Rules list */}
      {initialRules.length === 0 ? (
        <div className="bg-surface-2 border border-border rounded-2xl p-16 text-center">
          <Zap className="w-16 h-16 mx-auto text-text-secondary opacity-30 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No automations yet</h2>
          <p className="text-text-secondary mb-6">Create a rule to automate content creation on a schedule</p>
        </div>
      ) : (
        <div className="space-y-4">
          {initialRules.map((rule) => {
            const isActive = rule.status === "active";
            const isTriggering = triggering === rule.id;

            return (
              <div
                key={rule.id}
                className="bg-surface-2 border border-border rounded-2xl p-6 hover:border-accent/40 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isActive ? "bg-green-500/20" : "bg-gray-500/20"
                      }`}>
                        <Zap className={`w-5 h-5 ${isActive ? "text-green-400" : "text-gray-400"}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{rule.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            rule.niche === "travel" ? "bg-cyan-500/20 text-cyan-400" : "bg-orange-500/20 text-orange-400"
                          }`}>
                            {rule.niche}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-surface-3 text-text-secondary">
                            {rule.contentType}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            isActive ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
                          }`}>
                            {rule.status}
                          </span>
                          {rule.autoPost && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                              ⚡ Auto-Post
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
                      <div className="bg-surface-3 rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Repeat className="w-3.5 h-3.5 text-text-secondary" />
                        </div>
                        <p className="text-sm font-bold capitalize">{rule.frequency}</p>
                        <p className="text-[10px] text-text-secondary">Frequency</p>
                      </div>
                      <div className="bg-surface-3 rounded-xl p-3 text-center">
                        <p className="text-sm font-bold">{rule.postsPerRun}</p>
                        <p className="text-[10px] text-text-secondary">Posts/Run</p>
                      </div>
                      <div className="bg-surface-3 rounded-xl p-3 text-center">
                        <p className="text-sm font-bold">{rule.totalRuns}</p>
                        <p className="text-[10px] text-text-secondary">Total Runs</p>
                      </div>
                      <div className="bg-surface-3 rounded-xl p-3 text-center">
                        <p className="text-sm font-bold">{rule.totalPostsCreated}</p>
                        <p className="text-[10px] text-text-secondary">Posts Created</p>
                      </div>
                      <div className="bg-surface-3 rounded-xl p-3 text-center">
                        <p className="text-sm font-bold text-xs">{timeAgo(rule.lastRunAt)}</p>
                        <p className="text-[10px] text-text-secondary">Last Run</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => triggerRule(rule.id)}
                      disabled={isTriggering}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-ig-purple to-ig-pink text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50"
                    >
                      {isTriggering ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
                      {isTriggering ? "Running..." : "Run Now"}
                    </button>
                    <button
                      onClick={() => toggleRule(rule.id, rule.status)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border ${
                        isActive
                          ? "border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                          : "border-green-500/30 text-green-400 hover:bg-green-500/10"
                      }`}
                    >
                      {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      {isActive ? "Pause" : "Activate"}
                    </button>
                    <button
                      onClick={() => deleteRule(rule.id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
