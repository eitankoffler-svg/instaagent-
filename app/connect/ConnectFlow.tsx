"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Link2,
  Loader2,
  CheckCircle2,
  XCircle,
  Bot,
  Plane,
  UtensilsCrossed,
  Trash2,
  ExternalLink,
  Zap,
  ArrowRight,
  Globe,
  Users,
  ImageIcon,
  Sparkles,
  AlertCircle,
  Shield,
} from "lucide-react";

type Account = {
  id: number;
  username: string;
  profileUrl: string;
  displayName: string;
  bio: string;
  profilePicUrl: string;
  niche: string;
  detectedNiche: string;
  followerCount: number;
  followingCount: number;
  postCount: number;
  isConnected: boolean;
  isActive: boolean;
  lastAnalyzedAt: string | Date | null;
  createdAt: string | Date;
};

type AnalysisResult = {
  detectedNiche: string;
  confidence: number;
  keywords: string[];
};

export default function ConnectFlow({ initialAccounts }: { initialAccounts: Account[] }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [step, setStep] = useState<"idle" | "connecting" | "analyzing" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [connectedAccount, setConnectedAccount] = useState<Account | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const handleConnect = async () => {
    if (!url.trim()) return;
    setConnecting(true);
    setStep("connecting");
    setError("");

    try {
      // Step 1: Parse & validate
      await new Promise((r) => setTimeout(r, 800));
      setStep("analyzing");

      // Step 2: Send to API
      await new Promise((r) => setTimeout(r, 600));
      const res = await fetch("/api/accounts/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStep("error");
        setError(data.error || "Failed to connect account");
        return;
      }

      setConnectedAccount(data.account);
      setAnalysis(data.analysis);
      setStep("done");
      router.refresh();
    } catch {
      setStep("error");
      setError("Something went wrong. Please try again.");
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async (id: number) => {
    if (!confirm("Disconnect this account?")) return;
    await fetch(`/api/accounts/${id}`, { method: "DELETE" });
    router.refresh();
  };

  const handleReset = () => {
    setUrl("");
    setStep("idle");
    setError("");
    setConnectedAccount(null);
    setAnalysis(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
          <Link2 className="w-8 h-8 text-ig-pink" />
          Connect Instagram
        </h1>
        <p className="mt-1 text-text-secondary">
          Paste your Instagram link and the agent will auto-create and post content for you
        </p>
      </div>

      {/* Connection Card */}
      <div className="bg-surface-2 border border-border rounded-2xl overflow-hidden">
        {/* Top gradient bar */}
        <div className="h-2 bg-gradient-to-r from-ig-purple via-ig-pink to-ig-orange" />

        <div className="p-8">
          {step === "done" && connectedAccount ? (
            /* Success State */
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mx-auto">
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-green-400">Account Connected!</h2>
                <p className="text-text-secondary mt-1">
                  @{connectedAccount.username} is ready for automated content
                </p>
              </div>

              {/* Profile Card */}
              <div className="max-w-md mx-auto bg-surface-3 rounded-2xl p-6 text-left">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={connectedAccount.profilePicUrl}
                    alt={connectedAccount.username}
                    className="w-16 h-16 rounded-full ring-2 ring-ig-pink"
                  />
                  <div>
                    <p className="font-bold text-lg">{connectedAccount.displayName}</p>
                    <p className="text-sm text-accent">@{connectedAccount.username}</p>
                  </div>
                </div>
                <p className="text-sm text-text-secondary whitespace-pre-line mb-4">{connectedAccount.bio}</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-surface-4 rounded-xl p-2">
                    <p className="font-bold">{connectedAccount.postCount}</p>
                    <p className="text-[10px] text-text-secondary">Posts</p>
                  </div>
                  <div className="bg-surface-4 rounded-xl p-2">
                    <p className="font-bold">{connectedAccount.followerCount.toLocaleString()}</p>
                    <p className="text-[10px] text-text-secondary">Followers</p>
                  </div>
                  <div className="bg-surface-4 rounded-xl p-2">
                    <p className="font-bold">{connectedAccount.followingCount.toLocaleString()}</p>
                    <p className="text-[10px] text-text-secondary">Following</p>
                  </div>
                </div>
              </div>

              {/* Niche Detection */}
              {analysis && (
                <div className="max-w-md mx-auto bg-surface-3 rounded-2xl p-5 text-left">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-accent" />
                    <h3 className="font-semibold">AI Niche Detection</h3>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-sm px-3 py-1.5 rounded-full font-semibold ${
                      analysis.detectedNiche === "food" ? "bg-orange-500/20 text-orange-400" : "bg-cyan-500/20 text-cyan-400"
                    }`}>
                      {analysis.detectedNiche === "food" ? "🍽️ Food" : "✈️ Travel"}
                    </span>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs text-text-secondary mb-1">
                        <span>Confidence</span>
                        <span>{analysis.confidence}%</span>
                      </div>
                      <div className="w-full bg-surface-4 rounded-full h-2">
                        <div className="bg-gradient-to-r from-ig-purple to-ig-pink rounded-full h-2" style={{ width: `${analysis.confidence}%` }} />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary">
                    The agent will create {analysis.detectedNiche} content tailored to your account
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3">
                <Link
                  href="/agent"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-ig-purple via-ig-pink to-ig-orange text-white font-semibold hover:opacity-90"
                >
                  <Bot className="w-5 h-5" />
                  Run Agent Now
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 rounded-xl border border-border text-text-secondary hover:bg-surface-3 font-medium"
                >
                  Add Another
                </button>
              </div>
            </div>
          ) : (
            /* Input State */
            <div className="max-w-xl mx-auto space-y-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-ig-purple via-ig-pink to-ig-orange mx-auto mb-4">
                  <Link2 className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold">Add Your Instagram Account</h2>
                <p className="text-text-secondary mt-2">
                  Paste your Instagram profile link or username below
                </p>
              </div>

              {/* URL Input */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Globe className="w-5 h-5 text-text-secondary" />
                </div>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setError(""); setStep("idle"); }}
                  placeholder="https://instagram.com/yourusername  or  @yourusername"
                  disabled={connecting}
                  className="w-full bg-surface-3 border border-border rounded-2xl pl-12 pr-4 py-4 text-lg text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-ig-pink focus:ring-1 focus:ring-ig-pink/30 transition-all disabled:opacity-50"
                  onKeyDown={(e) => e.key === "Enter" && handleConnect()}
                />
              </div>

              {/* Error */}
              {step === "error" && (
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              {/* Progress */}
              {(step === "connecting" || step === "analyzing") && (
                <div className="space-y-3">
                  <div className={`flex items-center gap-3 p-3 rounded-xl ${step === "connecting" ? "bg-accent/10" : "bg-green-500/10"}`}>
                    {step === "connecting" ? (
                      <Loader2 className="w-5 h-5 text-accent animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    )}
                    <span className="text-sm">{step === "connecting" ? "Connecting to Instagram..." : "Connected"}</span>
                  </div>
                  {step === "analyzing" && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/10">
                      <Loader2 className="w-5 h-5 text-accent animate-spin" />
                      <span className="text-sm">Analyzing profile & detecting niche...</span>
                    </div>
                  )}
                </div>
              )}

              {/* Connect Button */}
              <button
                onClick={handleConnect}
                disabled={!url.trim() || connecting}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-ig-purple via-ig-pink to-ig-orange text-white font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                {connecting ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Link2 className="w-6 h-6" />
                    Connect Account
                  </>
                )}
              </button>

              {/* Examples */}
              <div className="text-center">
                <p className="text-xs text-text-secondary mb-2">Try these examples:</p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {["@travel.vibes", "@foodie.asmr", "https://instagram.com/chef.mike", "@wanderlust.daily"].map((ex) => (
                    <button
                      key={ex}
                      onClick={() => setUrl(ex)}
                      className="text-xs px-3 py-1.5 rounded-full bg-surface-3 border border-border text-text-secondary hover:text-accent hover:border-accent/40 transition-all"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>

              {/* How it works */}
              <div className="border border-border rounded-2xl p-5 mt-4">
                <h3 className="font-semibold text-sm mb-4 text-center">How it works</h3>
                <div className="grid grid-cols-4 gap-3 text-center">
                  {[
                    { icon: Link2, label: "Paste Link", desc: "Enter your IG URL" },
                    { icon: Sparkles, label: "AI Analyzes", desc: "Detects your niche" },
                    { icon: Bot, label: "Agent Creates", desc: "Videos & captions" },
                    { icon: Zap, label: "Auto Posts", desc: "Published for you" },
                  ].map((s) => {
                    const Icon = s.icon;
                    return (
                      <div key={s.label}>
                        <div className="w-10 h-10 rounded-xl bg-surface-3 flex items-center justify-center mx-auto mb-2">
                          <Icon className="w-5 h-5 text-accent" />
                        </div>
                        <p className="text-xs font-medium">{s.label}</p>
                        <p className="text-[10px] text-text-secondary mt-0.5">{s.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Connected Accounts */}
      {initialAccounts.length > 0 && (
        <div className="bg-surface-2 border border-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-accent" />
            Connected Accounts ({initialAccounts.length})
          </h2>
          <div className="space-y-3">
            {initialAccounts.map((acc) => (
              <div
                key={acc.id}
                className="flex items-center gap-4 bg-surface-3 rounded-xl p-4 hover:bg-surface-4 transition-colors"
              >
                <img
                  src={acc.profilePicUrl}
                  alt={acc.username}
                  className="w-12 h-12 rounded-full ring-2 ring-ig-pink/50"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">@{acc.username}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      acc.niche === "food" ? "bg-orange-500/20 text-orange-400" : "bg-cyan-500/20 text-cyan-400"
                    }`}>
                      {acc.niche === "food" ? "🍽️" : "✈️"} {acc.niche}
                    </span>
                    {acc.isActive && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">● Active</span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {acc.followerCount.toLocaleString()} followers · {acc.postCount} posts
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href="/agent"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-ig-purple to-ig-pink text-white text-xs font-semibold hover:opacity-90"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    Run Agent
                  </Link>
                  <a
                    href={acc.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-surface-4 text-text-secondary transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleDisconnect(acc.id)}
                    className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
