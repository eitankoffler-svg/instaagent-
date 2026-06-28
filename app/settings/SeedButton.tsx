"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Check } from "lucide-react";

export default function SeedButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSeed = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      if (res.ok) {
        setDone(true);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSeed}
      disabled={loading || done}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 ${
        done
          ? "bg-green-500/20 text-green-400 border border-green-500/30"
          : "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:opacity-90"
      }`}
    >
      {done ? (
        <>
          <Check className="w-4 h-4" />
          Demo Data Loaded!
        </>
      ) : loading ? (
        "Loading demo data..."
      ) : (
        <>
          <Sparkles className="w-4 h-4" />
          Load Demo Data
        </>
      )}
    </button>
  );
}
