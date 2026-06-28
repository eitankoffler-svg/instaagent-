import { db } from "@/db";
import { instagramAccounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// Parse an Instagram URL/username to extract the handle
function parseUsername(input: string): string | null {
  const trimmed = input.trim().replace(/\/+$/, "");
  // Plain username
  if (/^@?[a-zA-Z0-9._]{1,30}$/.test(trimmed)) {
    return trimmed.replace(/^@/, "");
  }
  // URL patterns
  const urlPatterns = [
    /instagram\.com\/([a-zA-Z0-9._]{1,30})/i,
    /instagr\.am\/([a-zA-Z0-9._]{1,30})/i,
  ];
  for (const pat of urlPatterns) {
    const m = trimmed.match(pat);
    if (m) return m[1];
  }
  return null;
}

// Detect niche from bio text
function detectNiche(bio: string, username: string): { niche: "travel" | "food"; confidence: number; keywords: string[] } {
  const text = (bio + " " + username).toLowerCase();
  const travelKw = ["travel", "wanderlust", "explore", "adventure", "destination", "trip", "vacation", "tourist", "globe", "journey", "flight", "airport", "beach", "mountain", "hotel", "resort", "backpack", "nomad", "passport"];
  const foodKw = ["food", "cook", "recipe", "chef", "eat", "restaurant", "kitchen", "bake", "cuisine", "foodie", "meal", "delicious", "yummy", "taste", "flavor", "gourmet", "cafe", "brunch", "dinner"];

  const travelHits = travelKw.filter((k) => text.includes(k));
  const foodHits = foodKw.filter((k) => text.includes(k));

  if (foodHits.length > travelHits.length) {
    return { niche: "food", confidence: Math.min(95, 60 + foodHits.length * 8), keywords: foodHits };
  }
  if (travelHits.length > 0) {
    return { niche: "travel", confidence: Math.min(95, 60 + travelHits.length * 8), keywords: travelHits };
  }
  // Default — analyze more
  return { niche: "travel", confidence: 50, keywords: [] };
}

// Generate a realistic profile from the username (since we can't actually scrape IG)
function generateProfile(username: string) {
  const nicheResult = detectNiche("", username);
  const isFood = username.toLowerCase().includes("food") ||
    username.toLowerCase().includes("cook") ||
    username.toLowerCase().includes("eat") ||
    username.toLowerCase().includes("chef") ||
    username.toLowerCase().includes("recipe");

  const travelBios = [
    `✈️ Exploring the world one destination at a time\n🌍 Travel content creator\n📍 Currently: Somewhere beautiful\n⬇️ Latest travel guides`,
    `🗺️ Full-time traveler & content creator\n📸 Sharing hidden gems & bucket-list spots\n🏖️ Beach lover | Mountain seeker\n📩 Collabs: DM`,
    `🌴 Travel reels & destination guides\n✨ Making the world your playground\n🎬 Faceless travel content\n🔗 Travel deals below`,
  ];

  const foodBios = [
    `🍽️ Food content creator\n🎬 Satisfying cooking videos\n📖 Easy recipes for everyone\n⬇️ Full recipes on my page`,
    `👨‍🍳 Food ASMR & cooking reels\n🔥 Street food • Home cooking • Restaurant reviews\n📍 Eating my way around the world\n📩 Brand collabs: DM`,
    `🍜 Faceless food content\n✨ Cooking therapy for your feed\n🎧 ASMR cooking videos\n📌 Save for later`,
  ];

  const niche: "travel" | "food" = isFood ? "food" : "travel";
  const bios = niche === "food" ? foodBios : travelBios;
  const bio = bios[Math.floor(Math.random() * bios.length)];

  const displayNames = niche === "food"
    ? [`${username}'s Kitchen`, `Chef ${username}`, username, `${username} Eats`]
    : [`${username} Travels`, `Wanderlust ${username}`, username, `${username} Explores`];

  return {
    displayName: displayNames[Math.floor(Math.random() * displayNames.length)],
    bio,
    niche,
    followerCount: Math.floor(Math.random() * 50000) + 1000,
    followingCount: Math.floor(Math.random() * 2000) + 100,
    postCount: Math.floor(Math.random() * 500) + 20,
  };
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const input = body.url || body.username || "";

  const username = parseUsername(input);
  if (!username) {
    return NextResponse.json(
      { error: "Invalid Instagram URL or username. Try: https://instagram.com/username or @username" },
      { status: 400 }
    );
  }

  // Check if already connected
  const existing = await db
    .select()
    .from(instagramAccounts)
    .where(eq(instagramAccounts.username, username));

  if (existing.length > 0) {
    return NextResponse.json(
      { error: "This account is already connected", account: existing[0] },
      { status: 409 }
    );
  }

  // Generate profile data (simulated — in production this would use Instagram Graph API)
  const profile = generateProfile(username);
  const nicheDetection = detectNiche(profile.bio, username);

  const [account] = await db
    .insert(instagramAccounts)
    .values({
      username,
      profileUrl: `https://instagram.com/${username}`,
      displayName: profile.displayName,
      bio: profile.bio,
      profilePicUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=833AB4&color=fff&size=200&bold=true&format=png`,
      niche: nicheDetection.niche,
      detectedNiche: `${nicheDetection.niche} (${nicheDetection.confidence}% confidence)`,
      followerCount: profile.followerCount,
      followingCount: profile.followingCount,
      postCount: profile.postCount,
      isConnected: true,
      isActive: true,
      lastAnalyzedAt: new Date(),
    })
    .returning();

  return NextResponse.json({
    success: true,
    account,
    analysis: {
      detectedNiche: nicheDetection.niche,
      confidence: nicheDetection.confidence,
      keywords: nicheDetection.keywords,
    },
  });
}
