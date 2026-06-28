import { db } from "@/db";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

// This endpoint creates all tables if they don't exist
// Useful for initializing the database after deployment

export async function POST() {
  try {
    // Create enums
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE niche AS ENUM ('travel', 'food');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE post_status AS ENUM ('draft', 'generating', 'ready', 'scheduled', 'posting', 'published', 'failed');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE content_type AS ENUM ('reel', 'story', 'carousel', 'ad');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE job_status AS ENUM ('pending', 'analyzing', 'idea', 'scripting', 'generating_video', 'captioning', 'scheduling', 'posting', 'completed', 'failed');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE automation_status AS ENUM ('active', 'paused', 'disabled');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create instagram_accounts table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS instagram_accounts (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        profile_url TEXT NOT NULL,
        display_name VARCHAR(255) NOT NULL DEFAULT '',
        bio TEXT NOT NULL DEFAULT '',
        profile_pic_url TEXT NOT NULL DEFAULT '',
        niche niche NOT NULL DEFAULT 'travel',
        detected_niche VARCHAR(100) NOT NULL DEFAULT '',
        follower_count INTEGER NOT NULL DEFAULT 0,
        following_count INTEGER NOT NULL DEFAULT 0,
        post_count INTEGER NOT NULL DEFAULT 0,
        is_connected BOOLEAN NOT NULL DEFAULT true,
        is_active BOOLEAN NOT NULL DEFAULT true,
        last_analyzed_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create posts table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        account_id INTEGER REFERENCES instagram_accounts(id),
        title VARCHAR(255) NOT NULL,
        caption TEXT NOT NULL,
        hashtags TEXT NOT NULL DEFAULT '',
        media_url TEXT NOT NULL DEFAULT '',
        thumbnail_url TEXT NOT NULL DEFAULT '',
        niche niche NOT NULL DEFAULT 'travel',
        content_type content_type NOT NULL DEFAULT 'reel',
        status post_status NOT NULL DEFAULT 'draft',
        agent_job_id INTEGER,
        scheduled_at TIMESTAMP,
        published_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create agent_jobs table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS agent_jobs (
        id SERIAL PRIMARY KEY,
        account_id INTEGER REFERENCES instagram_accounts(id),
        niche niche NOT NULL DEFAULT 'travel',
        content_type content_type NOT NULL DEFAULT 'reel',
        status job_status NOT NULL DEFAULT 'pending',
        idea TEXT,
        script TEXT,
        video_prompt TEXT,
        video_url TEXT,
        thumbnail_url TEXT,
        caption TEXT,
        hashtags TEXT,
        title VARCHAR(255),
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        error TEXT,
        post_id INTEGER,
        automation_rule_id INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create agent_logs table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS agent_logs (
        id SERIAL PRIMARY KEY,
        job_id INTEGER NOT NULL REFERENCES agent_jobs(id),
        step VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        level VARCHAR(20) NOT NULL DEFAULT 'info',
        metadata TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create automation_rules table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS automation_rules (
        id SERIAL PRIMARY KEY,
        account_id INTEGER REFERENCES instagram_accounts(id),
        name VARCHAR(255) NOT NULL,
        niche niche NOT NULL DEFAULT 'travel',
        content_type content_type NOT NULL DEFAULT 'reel',
        status automation_status NOT NULL DEFAULT 'active',
        frequency VARCHAR(50) NOT NULL DEFAULT 'daily',
        posts_per_run INTEGER NOT NULL DEFAULT 1,
        auto_post BOOLEAN NOT NULL DEFAULT false,
        total_runs INTEGER NOT NULL DEFAULT 0,
        total_posts_created INTEGER NOT NULL DEFAULT 0,
        last_run_at TIMESTAMP,
        next_run_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create analytics table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS analytics (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id),
        views INTEGER NOT NULL DEFAULT 0,
        likes INTEGER NOT NULL DEFAULT 0,
        comments_count INTEGER NOT NULL DEFAULT 0,
        shares INTEGER NOT NULL DEFAULT 0,
        saves INTEGER NOT NULL DEFAULT 0,
        engagement_rate INTEGER NOT NULL DEFAULT 0,
        recorded_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create templates table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS templates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        caption TEXT NOT NULL,
        hashtags TEXT NOT NULL DEFAULT '',
        niche niche NOT NULL DEFAULT 'travel',
        content_type content_type NOT NULL DEFAULT 'reel',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create campaigns table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS campaigns (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        niche niche NOT NULL DEFAULT 'travel',
        budget INTEGER NOT NULL DEFAULT 0,
        spent INTEGER NOT NULL DEFAULT 0,
        reach INTEGER NOT NULL DEFAULT 0,
        impressions INTEGER NOT NULL DEFAULT 0,
        clicks INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT true,
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    return NextResponse.json({
      success: true,
      message: "Database schema created successfully!",
    });
  } catch (error) {
    console.error("Schema push error:", error);
    return NextResponse.json(
      { error: "Failed to create schema", details: String(error) },
      { status: 500 }
    );
  }
}
