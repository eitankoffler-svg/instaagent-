import {
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";

// ── Enums ──
export const nicheEnum = pgEnum("niche", ["travel", "food"]);

export const postStatusEnum = pgEnum("post_status", [
  "draft",
  "generating",
  "ready",
  "scheduled",
  "posting",
  "published",
  "failed",
]);

export const contentTypeEnum = pgEnum("content_type", [
  "reel",
  "story",
  "carousel",
  "ad",
]);

export const jobStatusEnum = pgEnum("job_status", [
  "pending",
  "analyzing",
  "idea",
  "scripting",
  "generating_video",
  "captioning",
  "scheduling",
  "posting",
  "completed",
  "failed",
]);

export const automationStatusEnum = pgEnum("automation_status", [
  "active",
  "paused",
  "disabled",
]);

// ── Instagram Accounts ──
export const instagramAccounts = pgTable("instagram_accounts", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  profileUrl: text("profile_url").notNull(),
  displayName: varchar("display_name", { length: 255 }).notNull().default(""),
  bio: text("bio").notNull().default(""),
  profilePicUrl: text("profile_pic_url").notNull().default(""),
  niche: nicheEnum("niche").notNull().default("travel"),
  detectedNiche: varchar("detected_niche", { length: 100 }).notNull().default(""),
  followerCount: integer("follower_count").notNull().default(0),
  followingCount: integer("following_count").notNull().default(0),
  postCount: integer("post_count").notNull().default(0),
  isConnected: boolean("is_connected").notNull().default(true),
  isActive: boolean("is_active").notNull().default(true),
  lastAnalyzedAt: timestamp("last_analyzed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Posts ──
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => instagramAccounts.id),
  title: varchar("title", { length: 255 }).notNull(),
  caption: text("caption").notNull(),
  hashtags: text("hashtags").notNull().default(""),
  mediaUrl: text("media_url").notNull().default(""),
  thumbnailUrl: text("thumbnail_url").notNull().default(""),
  niche: nicheEnum("niche").notNull().default("travel"),
  contentType: contentTypeEnum("content_type").notNull().default("reel"),
  status: postStatusEnum("status").notNull().default("draft"),
  agentJobId: integer("agent_job_id"),
  scheduledAt: timestamp("scheduled_at"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Agent Jobs ──
export const agentJobs = pgTable("agent_jobs", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => instagramAccounts.id),
  niche: nicheEnum("niche").notNull().default("travel"),
  contentType: contentTypeEnum("content_type").notNull().default("reel"),
  status: jobStatusEnum("status").notNull().default("pending"),
  idea: text("idea"),
  script: text("script"),
  videoPrompt: text("video_prompt"),
  videoUrl: text("video_url"),
  thumbnailUrl: text("thumbnail_url"),
  caption: text("caption"),
  hashtags: text("hashtags"),
  title: varchar("title", { length: 255 }),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  error: text("error"),
  postId: integer("post_id"),
  automationRuleId: integer("automation_rule_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Agent Logs ──
export const agentLogs = pgTable("agent_logs", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id")
    .references(() => agentJobs.id)
    .notNull(),
  step: varchar("step", { length: 100 }).notNull(),
  message: text("message").notNull(),
  level: varchar("level", { length: 20 }).notNull().default("info"),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Automation Rules ──
export const automationRules = pgTable("automation_rules", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => instagramAccounts.id),
  name: varchar("name", { length: 255 }).notNull(),
  niche: nicheEnum("niche").notNull().default("travel"),
  contentType: contentTypeEnum("content_type").notNull().default("reel"),
  status: automationStatusEnum("status").notNull().default("active"),
  frequency: varchar("frequency", { length: 50 }).notNull().default("daily"),
  postsPerRun: integer("posts_per_run").notNull().default(1),
  autoPost: boolean("auto_post").notNull().default(false),
  totalRuns: integer("total_runs").notNull().default(0),
  totalPostsCreated: integer("total_posts_created").notNull().default(0),
  lastRunAt: timestamp("last_run_at"),
  nextRunAt: timestamp("next_run_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Analytics ──
export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id),
  views: integer("views").notNull().default(0),
  likes: integer("likes").notNull().default(0),
  comments: integer("comments_count").notNull().default(0),
  shares: integer("shares").notNull().default(0),
  saves: integer("saves").notNull().default(0),
  engagementRate: integer("engagement_rate").notNull().default(0),
  recordedAt: timestamp("recorded_at").notNull().defaultNow(),
});

// ── Templates ──
export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  caption: text("caption").notNull(),
  hashtags: text("hashtags").notNull().default(""),
  niche: nicheEnum("niche").notNull().default("travel"),
  contentType: contentTypeEnum("content_type").notNull().default("reel"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Campaigns ──
export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull().default(""),
  niche: nicheEnum("niche").notNull().default("travel"),
  budget: integer("budget").notNull().default(0),
  spent: integer("spent").notNull().default(0),
  reach: integer("reach").notNull().default(0),
  impressions: integer("impressions").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Types ──
export type InstagramAccount = typeof instagramAccounts.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type AgentJob = typeof agentJobs.$inferSelect;
export type AgentLog = typeof agentLogs.$inferSelect;
export type AutomationRule = typeof automationRules.$inferSelect;
export type Campaign = typeof campaigns.$inferSelect;
export type NewCampaign = typeof campaigns.$inferInsert;
export type Template = typeof templates.$inferSelect;
export type Analytics = typeof analytics.$inferSelect;
