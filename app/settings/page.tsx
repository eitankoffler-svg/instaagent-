import AppShell from "@/components/AppShell";
import SeedButton from "./SeedButton";
import { Settings, Camera, Bell, Bot, Zap, Database } from "lucide-react";

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
            <Settings className="w-8 h-8 text-text-secondary" />
            Settings
          </h1>
          <p className="mt-1 text-text-secondary">
            Configure InstaAgent
          </p>
        </div>

        {/* Instagram Connection */}
        <div className="bg-surface-2 border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ig-purple via-ig-pink to-ig-orange flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Instagram Account</h2>
              <p className="text-sm text-text-secondary">Connect your Instagram Business account for auto-posting</p>
            </div>
          </div>
          <div className="bg-surface-3 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm">Demo Mode — Simulated posting</span>
            </div>
            <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-ig-purple to-ig-pink text-white text-sm font-medium hover:opacity-90 transition-opacity">
              Connect Real Account
            </button>
          </div>
        </div>

        {/* Agent Configuration */}
        <div className="bg-surface-2 border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Agent Configuration</h2>
              <p className="text-sm text-text-secondary">Default settings for automated content generation</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Default Niche</label>
              <select className="w-full bg-surface-3 border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent">
                <option>Travel</option>
                <option>Food</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Default Content Type</label>
              <select className="w-full bg-surface-3 border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent">
                <option>Reel (Best for faceless)</option>
                <option>Story</option>
                <option>Carousel</option>
                <option>Ad</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-surface-2 border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Notifications</h2>
              <p className="text-sm text-text-secondary">Alert preferences for agent activity</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              "Agent pipeline completed",
              "Agent pipeline failed",
              "Automation rule triggered",
              "Post published successfully",
              "Weekly performance report",
            ].map((label) => (
              <div key={label} className="flex items-center justify-between bg-surface-3 rounded-xl p-3">
                <span className="text-sm">{label}</span>
                <div className="w-11 h-6 bg-accent rounded-full relative cursor-pointer">
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demo Data */}
        <div className="bg-surface-2 border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Demo Data</h2>
              <p className="text-sm text-text-secondary">
                Populate the app with sample agent runs, posts, and automations
              </p>
            </div>
          </div>
          <SeedButton />
        </div>
      </div>
    </AppShell>
  );
}
