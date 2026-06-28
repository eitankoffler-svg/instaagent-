"use client";

import { useRouter } from "next/navigation";
import { Trash2, Play, Pause, Edit } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function PostActions({
  postId,
  currentStatus,
}: {
  postId: number;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this post?")) return;
    setLoading(true);
    await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    router.refresh();
  };

  const handlePublish = async () => {
    setLoading(true);
    await fetch(`/api/posts/${postId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "published" }),
    });
    router.refresh();
  };

  return (
    <div className="flex items-center gap-1">
      {currentStatus === "draft" && (
        <button
          onClick={handlePublish}
          disabled={loading}
          className="p-1.5 rounded-lg hover:bg-green-500/20 text-green-400 transition-colors disabled:opacity-50"
          title="Publish"
        >
          <Play className="w-4 h-4" />
        </button>
      )}
      <Link
        href={`/posts/new?edit=${postId}`}
        className="p-1.5 rounded-lg hover:bg-accent/20 text-accent transition-colors"
        title="Edit"
      >
        <Edit className="w-4 h-4" />
      </Link>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors disabled:opacity-50"
        title="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
