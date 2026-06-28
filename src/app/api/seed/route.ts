import { db } from "@/db";
import { posts, campaigns, analytics, agentJobs, agentLogs, automationRules, instagramAccounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const travelThumbnails = [
  "https://images.pexels.com/photos/4784345/pexels-photo-4784345.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/2064750/pexels-photo-2064750.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/8332575/pexels-photo-8332575.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/19074743/pexels-photo-19074743.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
];
const foodThumbnails = [
  "https://images.pexels.com/photos/1327393/pexels-photo-1327393.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/24289165/pexels-photo-24289165.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/5156929/pexels-photo-5156929.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/6327536/pexels-photo-6327536.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
];

export async function POST() {
  // 1. Seed demo accounts
  const [travelAccount] = await db.insert(instagramAccounts).values({
    username: "wanderlust.reels",
    profileUrl: "https://instagram.com/wanderlust.reels",
    displayName: "Wanderlust Reels",
    bio: "✈️ Exploring the world one destination at a time\n🌍 Faceless travel content\n📍 Currently: Somewhere beautiful\n⬇️ Latest travel guides",
    profilePicUrl: "https://ui-avatars.com/api/?name=WR&background=833AB4&color=fff&size=200&bold=true&format=png",
    niche: "travel",
    detectedNiche: "travel (92% confidence)",
    followerCount: 24500,
    followingCount: 890,
    postCount: 167,
    isConnected: true,
    isActive: true,
    lastAnalyzedAt: new Date(),
  }).returning();

  const [foodAccount] = await db.insert(instagramAccounts).values({
    username: "foodie.asmr",
    profileUrl: "https://instagram.com/foodie.asmr",
    displayName: "Foodie ASMR",
    bio: "🍽️ Satisfying cooking videos\n🎧 ASMR food content\n📖 Easy recipes for everyone\n⬇️ Full recipes on my page",
    profilePicUrl: "https://ui-avatars.com/api/?name=FA&background=E1306C&color=fff&size=200&bold=true&format=png",
    niche: "food",
    detectedNiche: "food (88% confidence)",
    followerCount: 18200,
    followingCount: 650,
    postCount: 93,
    isConnected: true,
    isActive: true,
    lastAnalyzedAt: new Date(),
  }).returning();

  // 2. Seed agent jobs & posts for travel account
  const agentData = [
    { niche: "travel" as const, accountId: travelAccount.id, title: "Hidden Waterfalls of Bali", caption: "POV: You just discovered paradise 🌴✨\n\nSecret waterfalls in Bali Indonesia.\nSave this for your next trip 📌\n📸 @wanderlust.reels", hashtags: "#travel #bali #facelesscreator", thumbnail: travelThumbnails[0] },
    { niche: "food" as const, accountId: foodAccount.id, title: "Japanese Ramen ASMR", caption: "Wait for the final reveal 🤤\n\nAuthentic tonkotsu ramen from scratch.\nRecipe link in bio 📖\n@foodie.asmr", hashtags: "#food #ramen #foodasmr", thumbnail: foodThumbnails[0] },
    { niche: "travel" as const, accountId: travelAccount.id, title: "Santorini Sunset Magic", caption: "Add this to your bucket list 🗺️\n\nSantorini sunset — where dreams meet reality.\nFollow @wanderlust.reels 💎", hashtags: "#santorini #travel #sunset", thumbnail: travelThumbnails[1] },
    { niche: "food" as const, accountId: foodAccount.id, title: "Italian Pasta Masterclass", caption: "The sounds alone are worth the watch 🔊\n\nHandmade fresh pasta in Rome.\nSave this 📌\n@foodie.asmr", hashtags: "#pasta #cooking #foodasmr", thumbnail: foodThumbnails[1] },
    { niche: "travel" as const, accountId: travelAccount.id, title: "Maldives Overwater Dream", caption: "This place is straight out of a movie 🎬\n\nMaldives overwater bungalow hits different.\nFollow @wanderlust.reels 💎", hashtags: "#maldives #luxury #travel", thumbnail: travelThumbnails[2] },
  ];

  for (let i = 0; i < agentData.length; i++) {
    const d = agentData[i];
    const ago = (agentData.length - i) * 3600000 * 6;
    const videoUrl = `https://content-agent.demo/videos/${d.niche}/${Date.now() - ago}.mp4`;
    const isPublished = i < 3;

    const [post] = await db.insert(posts).values({
      accountId: d.accountId,
      title: d.title,
      caption: d.caption + "\n\n" + d.hashtags,
      hashtags: d.hashtags,
      mediaUrl: videoUrl,
      thumbnailUrl: d.thumbnail,
      niche: d.niche,
      contentType: "reel",
      status: isPublished ? "published" : "scheduled",
      publishedAt: isPublished ? new Date(Date.now() - ago) : null,
      scheduledAt: !isPublished ? new Date(Date.now() + ago) : null,
    }).returning();

    const [job] = await db.insert(agentJobs).values({
      accountId: d.accountId,
      niche: d.niche,
      contentType: "reel",
      status: "completed",
      idea: JSON.stringify({ title: d.title, topic: d.title, style: "cinematic" }),
      script: `[SCENE 1] Cinematic opening.\n[SCENE 2] Details.\n[SCENE 3] Reveal.\n[CTA] Follow @${d.accountId === travelAccount.id ? "wanderlust.reels" : "foodie.asmr"}`,
      videoPrompt: `Create faceless video for ${d.title}`,
      videoUrl,
      thumbnailUrl: d.thumbnail,
      caption: d.caption,
      hashtags: d.hashtags,
      title: d.title,
      startedAt: new Date(Date.now() - ago - 10000),
      completedAt: new Date(Date.now() - ago),
      postId: post.id,
    }).returning();

    await db.update(posts).set({ agentJobId: job.id }).where(eq(posts.id, post.id));

    const username = d.accountId === travelAccount.id ? "wanderlust.reels" : "foodie.asmr";
    const steps = [
      { step: "init", message: `🚀 Pipeline started for @${username}`, level: "info" },
      { step: "analyze", message: `🔍 Analyzing @${username}'s profile...`, level: "info" },
      { step: "analyze", message: `🎯 Detected niche: ${d.niche}`, level: "success" },
      { step: "idea", message: `💡 Idea: "${d.title}"`, level: "success" },
      { step: "script", message: "✅ Script written", level: "success" },
      { step: "video", message: "🎥 Video generated", level: "success" },
      { step: "caption", message: "✅ Caption generated", level: "success" },
      { step: "post", message: `🎉 ${isPublished ? "Published" : "Scheduled"} to @${username}!`, level: "success" },
      { step: "done", message: `✅ Pipeline completed for @${username}!`, level: "success" },
    ];
    for (let j = 0; j < steps.length; j++) {
      await db.insert(agentLogs).values({
        jobId: job.id,
        step: steps[j].step,
        message: steps[j].message,
        level: steps[j].level,
        createdAt: new Date(Date.now() - ago - 10000 + j * 1000),
      });
    }

    if (isPublished) {
      await db.insert(analytics).values({
        postId: post.id,
        views: Math.floor(Math.random() * 50000) + 10000,
        likes: Math.floor(Math.random() * 5000) + 1000,
        comments: Math.floor(Math.random() * 500) + 100,
        shares: Math.floor(Math.random() * 1000) + 200,
        saves: Math.floor(Math.random() * 2000) + 300,
        engagementRate: Math.floor(Math.random() * 10) + 3,
      });
    }
  }

  // 3. Seed automation rules
  await db.insert(automationRules).values([
    { accountId: travelAccount.id, name: "Daily Travel Reels for @wanderlust.reels", niche: "travel", contentType: "reel", status: "active", frequency: "daily", postsPerRun: 1, autoPost: true, totalRuns: 5, totalPostsCreated: 5, lastRunAt: new Date(Date.now() - 86400000), nextRunAt: new Date(Date.now() + 86400000) },
    { accountId: foodAccount.id, name: "Food ASMR Weekly for @foodie.asmr", niche: "food", contentType: "reel", status: "active", frequency: "weekly", postsPerRun: 3, autoPost: false, totalRuns: 2, totalPostsCreated: 6, lastRunAt: new Date(Date.now() - 604800000), nextRunAt: new Date(Date.now() + 604800000) },
  ]);

  // 4. Seed campaigns
  await db.insert(campaigns).values([
    { name: "Travel Reels Boost for @wanderlust.reels", description: "Promote auto-generated travel reels.", niche: "travel", budget: 5000, spent: 2340, reach: 125000, impressions: 340000, clicks: 8500, isActive: true },
    { name: "Food ASMR Push for @foodie.asmr", description: "Boost food ASMR content.", niche: "food", budget: 3000, spent: 1200, reach: 78000, impressions: 210000, clicks: 5200, isActive: true },
  ]);

  return NextResponse.json({ success: true, message: "Demo data seeded with 2 Instagram accounts!" });
}
