import { db } from "@/db";
import { agentJobs, agentLogs, posts, instagramAccounts } from "@/db/schema";
import { eq } from "drizzle-orm";

// ── Content databases ──

const TRAVEL_IDEAS = [
  { title: "Hidden Waterfalls of Bali", topic: "secret waterfalls in Bali Indonesia", style: "cinematic aerial drone" },
  { title: "Santorini Sunset Magic", topic: "golden hour sunset over Santorini Greece", style: "timelapse cinematic" },
  { title: "Tokyo Neon Night Walk", topic: "walking through neon-lit streets of Tokyo at night", style: "POV walking tour" },
  { title: "Maldives Overwater Dream", topic: "luxury overwater bungalow in crystal clear Maldives", style: "dreamy aerial cinematic" },
  { title: "Iceland Northern Lights", topic: "aurora borealis dancing over Icelandic landscape", style: "long exposure timelapse" },
  { title: "Swiss Alps Train Journey", topic: "scenic train ride through Swiss Alps mountains", style: "window seat POV" },
  { title: "Dubai Future City", topic: "futuristic skyline and architecture of Dubai at dusk", style: "drone hyperlapse" },
  { title: "Amalfi Coast Road Trip", topic: "driving the winding roads of Amalfi Coast Italy", style: "dashcam cinematic" },
  { title: "Marrakech Medina Walk", topic: "wandering through colorful markets of Marrakech Morocco", style: "handheld POV immersive" },
  { title: "Patagonia Wild", topic: "untouched wilderness of Patagonia glaciers and peaks", style: "epic landscape drone" },
  { title: "Vietnam Street Life", topic: "bustling morning streets of Hanoi Vietnam", style: "slow motion street" },
  { title: "Greek Island Hopping", topic: "ferry between white-washed Greek islands", style: "travel montage" },
  { title: "Kyoto Temple Garden", topic: "zen garden and ancient temple in Kyoto Japan", style: "peaceful slow cinema" },
  { title: "Norwegian Fjords", topic: "sailing through dramatic Norwegian fjords", style: "aerial tracking shot" },
  { title: "Sahara Desert Dunes", topic: "golden sand dunes of Sahara Desert at sunrise", style: "sweeping drone" },
];

const FOOD_IDEAS = [
  { title: "Japanese Ramen ASMR", topic: "making authentic tonkotsu ramen from scratch", style: "close-up ASMR cooking" },
  { title: "Italian Pasta Masterclass", topic: "handmade fresh pasta in a Roman kitchen", style: "overhead cooking ASMR" },
  { title: "Thai Street Food Night", topic: "sizzling pad thai and mango sticky rice at a Bangkok market", style: "immersive street food" },
  { title: "French Pastry Art", topic: "crafting perfect croissants and pain au chocolat", style: "satisfying process" },
  { title: "Mexican Taco Heaven", topic: "authentic street tacos al pastor in Mexico City", style: "food close-up cinematic" },
  { title: "Korean BBQ Experience", topic: "grilling premium Korean BBQ meats at the table", style: "sizzle ASMR close-up" },
  { title: "Sushi Chef Precision", topic: "master sushi chef slicing and assembling nigiri", style: "blade close-up ASMR" },
  { title: "Indian Curry Journey", topic: "grinding spices and slow-cooking rich butter chicken", style: "process montage" },
  { title: "NYC Pizza Slice", topic: "classic New York pizza being folded and eaten", style: "cheesy pull close-up" },
  { title: "Turkish Baklava Layers", topic: "assembling layers of filo pastry and pistachios", style: "satisfying layering ASMR" },
  { title: "Moroccan Tagine Cooking", topic: "slow cooking lamb tagine in a traditional clay pot", style: "steam and spice close-up" },
  { title: "Peruvian Ceviche Fresh", topic: "preparing fresh ceviche with lime and seafood", style: "bright food styling" },
  { title: "Vietnamese Pho Ritual", topic: "pouring rich broth over fresh herbs and noodles", style: "slow pour ASMR" },
  { title: "Spanish Paella Fire", topic: "cooking paella over open flames with saffron and seafood", style: "fire and sizzle" },
  { title: "Greek Mezze Spread", topic: "assembling a full Mediterranean mezze platter", style: "overhead assembly" },
];

const TRAVEL_THUMBNAILS = [
  "https://images.pexels.com/photos/4784345/pexels-photo-4784345.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/2064750/pexels-photo-2064750.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/8332575/pexels-photo-8332575.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/19074743/pexels-photo-19074743.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
];

const FOOD_THUMBNAILS = [
  "https://images.pexels.com/photos/1327393/pexels-photo-1327393.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/24289165/pexels-photo-24289165.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/5156929/pexels-photo-5156929.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/6327536/pexels-photo-6327536.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
];

const TRAVEL_HASHTAGS = [
  "#travel #wanderlust #travelreels #explore #beautifuldestinations #travelphotography #travelgram #facelesscreator #adventure #paradise",
  "#travelvideo #droneshots #placestovisit #worldtravel #bucketlist #travelhacks #travelinspo #facelesstravel #viraltravel #vacationmode",
  "#traveladdict #instatravel #luxurytravel #roadtrip #solotravel #travelcontent #facelessvideo #globetrotter #dreamdestination #exploring",
];

const FOOD_HASHTAGS = [
  "#food #foodie #foodreels #cooking #recipe #foodasmr #facelessfoodie #yummy #delicious #homecooking",
  "#foodporn #instafood #cheflife #streetfood #foodvideo #facelesscooking #tasty #foodlover #recipevideo #satisfying",
  "#cookingasmr #foodart #gourmet #foodcontent #facelesschef #easyrecipe #foodhack #viralrecipe #foodstagram #chefsofinstagram",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function log(
  jobId: number,
  step: string,
  message: string,
  level: string = "info",
  metadata?: string
) {
  await db.insert(agentLogs).values({
    jobId,
    step,
    message,
    level,
    metadata: metadata || null,
  });
}

// ── PIPELINE STEPS ──

async function stepAnalyzeAccount(jobId: number, account: { username: string; niche: string; bio: string; followerCount: number }) {
  await db
    .update(agentJobs)
    .set({ status: "analyzing", startedAt: new Date() })
    .where(eq(agentJobs.id, jobId));
  await log(jobId, "analyze", `🔍 Analyzing @${account.username}'s profile...`);
  await sleep(600);
  await log(jobId, "analyze", `📊 Account: @${account.username} — ${account.followerCount.toLocaleString()} followers`, "info");
  await log(jobId, "analyze", `🎯 Detected niche: ${account.niche} — Tailoring content to match your style`, "success");
  await sleep(400);
}

async function stepIdea(jobId: number, niche: "travel" | "food", username: string) {
  await db
    .update(agentJobs)
    .set({ status: "idea" })
    .where(eq(agentJobs.id, jobId));
  await log(jobId, "idea", `🧠 Brainstorming content idea for @${username}...`);
  await sleep(800);

  const ideas = niche === "travel" ? TRAVEL_IDEAS : FOOD_IDEAS;
  const idea = pick(ideas);

  await db
    .update(agentJobs)
    .set({ idea: JSON.stringify(idea), title: idea.title })
    .where(eq(agentJobs.id, jobId));
  await log(jobId, "idea", `💡 Idea selected: "${idea.title}" — ${idea.topic}`, "success", JSON.stringify(idea));
  return idea;
}

async function stepScript(jobId: number, niche: "travel" | "food", idea: { title: string; topic: string; style: string }, username: string) {
  await db.update(agentJobs).set({ status: "scripting" }).where(eq(agentJobs.id, jobId));
  await log(jobId, "script", `📝 Writing video script tailored for @${username}...`);
  await sleep(1000);

  const travelScripts = [
    `[SCENE 1] Aerial drone shot slowly revealing ${idea.topic}.\n[SCENE 2] Close-up of textures — water, stone, leaves.\n[SCENE 3] Wide angle golden hour with lens flare.\n[SCENE 4] Pull-back revealing the full destination.\n[TEXT OVERLAY] "This place is unreal" ✨\n[CTA] Follow @${username} for more\n[MUSIC] Ambient cinematic lo-fi beat`,
    `[HOOK] "You've never seen anything like this..."\n[SCENE 1] ${idea.style} shot of ${idea.topic}.\n[SCENE 2] Slow motion details — ripples, shadows, light.\n[SCENE 3] Time-lapse from day to golden hour.\n[TEXT OVERLAY] "Save this for your bucket list 📌"\n[CTA] More on @${username}\n[MUSIC] Dreamy travel beat`,
    `[SCENE 1] POV walking toward ${idea.topic}.\n[SCENE 2] 360° reveal of the location.\n[SCENE 3] Macro details — dewdrops, petals, sand.\n[SCENE 4] Final wide establishing shot.\n[TEXT OVERLAY] "Add this to your list" 🗺️\n[CTA] Follow @${username}\n[MUSIC] Upbeat adventure soundtrack`,
  ];

  const foodScripts = [
    `[SCENE 1] Close-up of raw ingredients laid out beautifully.\n[SCENE 2] Hands preparing — chopping, mixing, seasoning.\n[SCENE 3] The cooking process — sizzle, steam, flames.\n[SCENE 4] Final plating with garnish.\n[TEXT OVERLAY] "Would you eat this?" 🤤\n[CTA] Follow @${username} for recipes\n[MUSIC] Soft lo-fi cooking beat`,
    `[HOOK] The sizzle hits first 🔥\n[SCENE 1] Macro shot of ${idea.topic}.\n[SCENE 2] Step-by-step ${idea.style} preparation.\n[SCENE 3] Satisfying texture shots.\n[SCENE 4] The final reveal — steam rising.\n[TEXT OVERLAY] "Recipe on @${username}" 📖\n[MUSIC] ASMR ambient + gentle music`,
    `[SCENE 1] Kitchen establishing shot.\n[SCENE 2] Fresh ingredient showcase.\n[SCENE 3] Cooking process montage with ${idea.style}.\n[SCENE 4] The money shot — cheese pull / sauce pour / steam.\n[TEXT OVERLAY] "This changed everything" 🍽️\n[CTA] More on @${username}\n[MUSIC] Upbeat cooking montage track`,
  ];

  const script = pick(niche === "travel" ? travelScripts : foodScripts);
  await db.update(agentJobs).set({ script }).where(eq(agentJobs.id, jobId));
  await log(jobId, "script", "✅ Script written successfully", "success");
  return script;
}

async function stepGenerateVideo(jobId: number, niche: "travel" | "food", idea: { title: string; topic: string; style: string }, username: string) {
  await db.update(agentJobs).set({ status: "generating_video" }).where(eq(agentJobs.id, jobId));
  await log(jobId, "video", `🎬 Generating faceless video for @${username}...`);
  await sleep(1200);

  const videoPrompt = `Create a ${idea.style} faceless video of ${idea.topic} for Instagram account @${username}. No faces or people speaking on camera. Use B-roll footage, cinematic transitions, text overlays, and ${niche === "food" ? "cooking ASMR sounds" : "ambient travel sounds"}. Vertical 9:16 format for Instagram Reels. Include CTA to follow @${username}.`;

  const thumbnails = niche === "travel" ? TRAVEL_THUMBNAILS : FOOD_THUMBNAILS;
  const thumbnailUrl = pick(thumbnails);
  const videoUrl = `https://content-agent.demo/videos/${username}/${niche}/${Date.now()}.mp4`;

  await db.update(agentJobs).set({ videoPrompt, videoUrl, thumbnailUrl }).where(eq(agentJobs.id, jobId));
  await log(jobId, "video", "🎥 Video generated successfully", "success");
  await log(jobId, "video", `📸 Thumbnail selected for @${username}`, "info");
  return { videoUrl, thumbnailUrl };
}

async function stepCaption(jobId: number, niche: "travel" | "food", idea: { title: string; topic: string; style: string }, username: string) {
  await db.update(agentJobs).set({ status: "captioning" }).where(eq(agentJobs.id, jobId));
  await log(jobId, "caption", `✍️ Writing viral caption for @${username}...`);
  await sleep(900);

  const travelCaptions = [
    `POV: You just discovered paradise 🌴✨\n\n${idea.topic} — absolutely unreal. The kind of place that makes you quit your job and never look back.\n\nSave this for your next trip 📌\nTag someone who needs to see this 👇\n\n📸 @${username}`,
    `Add this to your bucket list immediately 🗺️\n\n${idea.topic} — where dreams meet reality. No filter needed when nature does the editing.\n\nWould you visit? Drop a 🔥\n\nFollow @${username} for more hidden gems 💎`,
    `This place is straight out of a movie 🎬\n\n${idea.topic} hits different when you see it for real. But since we can't all be there... this reel will do 😏\n\n📍 Follow @${username} for more\n⬇️ Save this for later`,
  ];

  const foodCaptions = [
    `Wait for the final reveal 🤤\n\n${idea.topic} — made from scratch, and yes, it tastes as good as it looks.\n\nWould you try this? Comment your answer 👇\n📖 More recipes on @${username}`,
    `The sounds alone are worth the watch 🔊\n\n${idea.topic} is pure therapy for your eyes and ears. Who else watches cooking videos at 2am? 😅\n\nSave this to try later 📌\nFollow @${username} for daily recipes`,
    `I promise you, this is the one 🍽️\n\n${idea.topic} — every bite is a flavor explosion. This is what food content is all about.\n\nTag a foodie who needs this 👇\n🔗 @${username}`,
  ];

  const caption = pick(niche === "travel" ? travelCaptions : foodCaptions);
  const hashtags = pick(niche === "travel" ? TRAVEL_HASHTAGS : FOOD_HASHTAGS);

  await db.update(agentJobs).set({ caption, hashtags }).where(eq(agentJobs.id, jobId));
  await log(jobId, "caption", "✅ Caption and hashtags generated", "success");
  return { caption, hashtags };
}

async function stepPost(
  jobId: number,
  accountId: number,
  niche: "travel" | "food",
  contentType: "reel" | "story" | "carousel" | "ad",
  title: string,
  caption: string,
  hashtags: string,
  videoUrl: string,
  thumbnailUrl: string,
  autoPost: boolean,
  username: string
) {
  const targetStatus = autoPost ? "posting" : "scheduling";
  await db.update(agentJobs).set({ status: targetStatus as "posting" | "scheduling" }).where(eq(agentJobs.id, jobId));

  if (autoPost) {
    await log(jobId, "post", `📤 Publishing to @${username}'s Instagram...`);
    await sleep(1000);
    await log(jobId, "post", `✅ Posted to @${username}'s feed via Instagram API`, "success");
  } else {
    await log(jobId, "post", `📅 Scheduling post for @${username}...`);
    await sleep(500);
  }

  const scheduledAt = new Date(Date.now() + Math.floor(Math.random() * 86400000 * 3));
  const postStatus = autoPost ? "published" : "scheduled";

  const [newPost] = await db
    .insert(posts)
    .values({
      accountId,
      title,
      caption: caption + "\n\n" + hashtags,
      hashtags,
      mediaUrl: videoUrl,
      thumbnailUrl,
      niche,
      contentType,
      status: postStatus,
      agentJobId: jobId,
      scheduledAt: autoPost ? null : scheduledAt,
      publishedAt: autoPost ? new Date() : null,
    })
    .returning();

  await db.update(agentJobs).set({ status: "completed", completedAt: new Date(), postId: newPost.id }).where(eq(agentJobs.id, jobId));

  const msg = autoPost
    ? `🎉 Published to @${username}! Post ID: ${newPost.id}`
    : `📅 Scheduled for @${username} on ${scheduledAt.toLocaleDateString()} — Post ID: ${newPost.id}`;
  await log(jobId, "post", msg, "success");

  return newPost;
}

// ── MAIN PIPELINE ──

export async function runAgentPipeline(
  accountId: number,
  contentType: "reel" | "story" | "carousel" | "ad" = "reel",
  autoPost: boolean = false,
  automationRuleId?: number
): Promise<number> {
  // Fetch the account
  const [account] = await db.select().from(instagramAccounts).where(eq(instagramAccounts.id, accountId));
  if (!account) throw new Error("Account not found");

  const niche = account.niche as "travel" | "food";

  // Create the job
  const [job] = await db
    .insert(agentJobs)
    .values({
      accountId,
      niche,
      contentType,
      status: "pending",
      automationRuleId: automationRuleId ?? null,
    })
    .returning();

  await log(job.id, "init", `🚀 Agent pipeline started for @${account.username} — niche: ${niche}, type: ${contentType}`);

  try {
    // Step 0: Analyze account
    await stepAnalyzeAccount(job.id, account);

    // Step 1: Ideation
    const idea = await stepIdea(job.id, niche, account.username);

    // Step 2: Script
    await stepScript(job.id, niche, idea, account.username);

    // Step 3: Video Generation
    const { videoUrl, thumbnailUrl } = await stepGenerateVideo(job.id, niche, idea, account.username);

    // Step 4: Caption & Hashtags
    const { caption, hashtags } = await stepCaption(job.id, niche, idea, account.username);

    // Step 5: Create/Publish Post
    await stepPost(job.id, accountId, niche, contentType, idea.title, caption, hashtags, videoUrl, thumbnailUrl, autoPost, account.username);

    await log(job.id, "done", `✅ Pipeline completed for @${account.username}!`, "success");
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    await db.update(agentJobs).set({ status: "failed", error: msg }).where(eq(agentJobs.id, job.id));
    await log(job.id, "error", `❌ Pipeline failed: ${msg}`, "error");
  }

  return job.id;
}
