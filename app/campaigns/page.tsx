import AppShell from "@/components/AppShell";
import { db } from "@/db";
import { campaigns } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Megaphone, TrendingUp, Eye, MousePointerClick } from "lucide-react";
import CampaignActions from "./CampaignActions";

export const dynamic = "force-dynamic";

function formatNumber(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

export default async function CampaignsPage() {
  const allCampaigns = await db.select().from(campaigns).orderBy(desc(campaigns.createdAt));
  const totalBudget = allCampaigns.reduce((s, c) => s + c.budget, 0);
  const totalSpent = allCampaigns.reduce((s, c) => s + c.spent, 0);
  const totalReach = allCampaigns.reduce((s, c) => s + c.reach, 0);

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
            <Megaphone className="w-8 h-8 text-orange-400" />
            Campaigns
          </h1>
          <p className="mt-1 text-text-secondary">Ad campaigns for agent-generated content</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-surface-2 border border-border rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">${formatNumber(totalBudget)}</p>
              <p className="text-xs text-text-secondary">Total Budget</p>
            </div>
          </div>
          <div className="bg-surface-2 border border-border rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
              <Eye className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatNumber(totalReach)}</p>
              <p className="text-xs text-text-secondary">Total Reach</p>
            </div>
          </div>
          <div className="bg-surface-2 border border-border rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <MousePointerClick className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">${formatNumber(totalSpent)}</p>
              <p className="text-xs text-text-secondary">Total Spent</p>
            </div>
          </div>
        </div>

        {allCampaigns.length === 0 ? (
          <div className="bg-surface-2 border border-border rounded-2xl p-16 text-center">
            <Megaphone className="w-16 h-16 mx-auto text-text-secondary mb-4 opacity-30" />
            <h2 className="text-xl font-semibold mb-2">No campaigns yet</h2>
            <p className="text-text-secondary">Seed demo data from Settings to populate campaigns.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {allCampaigns.map((campaign) => (
              <div key={campaign.id} className="bg-surface-2 border border-border rounded-2xl p-6 hover:border-accent/40 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{campaign.name}</h3>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        campaign.niche === "travel" ? "bg-cyan-500/20 text-cyan-400" : "bg-orange-500/20 text-orange-400"
                      }`}>{campaign.niche}</span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        campaign.isActive ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
                      }`}>{campaign.isActive ? "Active" : "Paused"}</span>
                    </div>
                    <p className="text-sm text-text-secondary mb-4">{campaign.description}</p>
                    <div className="grid grid-cols-5 gap-4">
                      {[
                        { label: "Budget", value: `$${campaign.budget.toLocaleString()}` },
                        { label: "Spent", value: `$${campaign.spent.toLocaleString()}` },
                        { label: "Reach", value: formatNumber(campaign.reach) },
                        { label: "Impressions", value: formatNumber(campaign.impressions) },
                        { label: "Clicks", value: formatNumber(campaign.clicks) },
                      ].map((s) => (
                        <div key={s.label} className="bg-surface-3 rounded-xl p-3 text-center">
                          <p className="text-lg font-bold">{s.value}</p>
                          <p className="text-xs text-text-secondary">{s.label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-text-secondary mb-1">
                        <span>Budget utilization</span>
                        <span>{campaign.budget > 0 ? Math.round((campaign.spent / campaign.budget) * 100) : 0}%</span>
                      </div>
                      <div className="w-full bg-surface-4 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-ig-purple to-ig-pink rounded-full h-2"
                          style={{ width: `${campaign.budget > 0 ? Math.min((campaign.spent / campaign.budget) * 100, 100) : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <CampaignActions campaignId={campaign.id} isActive={campaign.isActive} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
