"use client";

import { useRouter } from "next/navigation";
import { Trash2, Pause, Play } from "lucide-react";
import { useState } from "react";

export default function CampaignActions({
  campaignId,
  isActive,
}: {
  campaignId: number;
  isActive: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    await fetch(`/api/campaigns/${campaignId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    router.refresh();
  };

  const handleDelete = async () => {
    if (!confirm("Delete this campaign?")) return;
    setLoading(true);
    await fetch(`/api/campaigns/${campaignId}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-2 ml-4">
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border ${
          isActive
            ? "border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
            : "border-green-500/30 text-green-400 hover:bg-green-500/10"
        } disabled:opacity-50`}
      >
        {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        {isActive ? "Pause" : "Activate"}
      </button>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 disabled:opacity-50"
      >
        <Trash2 className="w-3.5 h-3.5" />
        Delete
      </button>
    </div>
  );
}
