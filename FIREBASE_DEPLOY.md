# 🔥 Firebase Deployment Guide for InstaAgent

Complete step-by-step guide to deploy InstaAgent on Firebase Hosting with Cloud Functions.

## Prerequisites

- Node.js 18+
- A Google account
- Firebase CLI installed
- A PostgreSQL database (Firebase doesn't include one)

---

## Step 1: Set Up PostgreSQL Database

Since Firebase doesn't offer PostgreSQL, choose one of these providers:

### Option A: Neon (Recommended - Free Tier)

1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub/Google
3. Click "Create Project"
4. Choose a region close to your Firebase region
5. Copy the connection string:
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### Option B: Supabase (Free Tier)

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the "Connection string" (URI format)

### Option C: Google Cloud SQL (Same ecosystem, but paid)

```bash
# Create instance
gcloud sql instances create insta-agent-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1

# Create database
gcloud sql databases create instaagent --instance=insta-agent-db

# Get connection info from Cloud Console
```

---

## Step 2: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Enter project name: `insta-agent` (or your choice)
4. Disable Google Analytics (optional)
5. Click "Create project"

---

## Step 3: Install Firebase CLI

```bash
# Install globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Verify login
firebase projects:list
```

---

## Step 4: Initialize Firebase in Your Project

```bash
cd insta-agent

# Initialize Firebase
firebase init

# Select these options:
# ❯ Hosting: Configure files for Firebase Hosting
# ❯ Functions: Configure a Cloud Functions directory (optional, for API routes)

# Use an existing project → select your project

# When asked about framework:
# ❯ Detected an existing Next.js codebase in the current directory, should we use this? Yes

# Hosting setup:
# ❯ What region? us-central1 (or your preferred region)
```

---

## Step 5: Configure Environment Variables

### Method 1: Firebase Secrets (Recommended for production)

```bash
# Set DATABASE_URL as a secret
firebase functions:secrets:set DATABASE_URL

# Paste your connection string when prompted:
# postgresql://user:pass@host:5432/db?sslmode=require
```

### Method 2: Using .env files

Create `.env.local` for local development:
```env
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
```

For production, set in Firebase Console:
1. Go to Firebase Console → Your Project
2. Project Settings → Service accounts → Environment variables
3. Or use the CLI:
```bash
firebase functions:config:set database.url="your-connection-string"
```

---

## Step 6: Update Firebase Configuration

Your `firebase.json` should look like this:

```json
{
  "hosting": {
    "source": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "frameworksBackend": {
      "region": "us-central1"
    }
  }
}
```

Your `.firebaserc`:
```json
{
  "projects": {
    "default": "your-firebase-project-id"
  }
}
```

---

## Step 7: Upgrade to Blaze Plan

⚠️ **Important:** Firebase requires the Blaze (pay-as-you-go) plan to make external network calls (to your PostgreSQL database).

1. Go to Firebase Console
2. Click "Upgrade" in the bottom left
3. Select "Blaze" plan
4. Add billing info

> **Note:** Blaze plan is pay-as-you-go. With normal usage, you'll likely stay within free tier limits (~$0/month for small projects).

---

## Step 8: Deploy!

```bash
# Build and deploy
firebase deploy

# Or deploy only hosting
firebase deploy --only hosting
```

You'll see output like:
```
✔ Deploy complete!

Hosting URL: https://your-project.web.app
```

---

## Step 9: Initialize Database

After deployment, run these commands to set up your database:

```bash
# Create database tables
curl -X POST https://your-project.web.app/api/db/push

# Load demo data (optional)
curl -X POST https://your-project.web.app/api/seed
```

---

## Step 10: Verify Deployment

1. Visit `https://your-project.web.app`
2. Go to `/connect` and add an Instagram account
3. Run the agent to create content!

---

## Custom Domain (Optional)

1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Follow the DNS verification steps
4. Add these records to your domain registrar:
   - A record: `151.101.1.195`
   - A record: `151.101.65.195`

---

## Firebase CLI Commands Reference

```bash
# Deploy everything
firebase deploy

# Deploy only hosting
firebase deploy --only hosting

# View logs
firebase functions:log

# Run locally
firebase emulators:start

# List projects
firebase projects:list

# Switch project
firebase use <project-id>
```

---

## Troubleshooting

### "External network is not accessible"
**Solution:** Upgrade to Blaze plan

### "Function timeout"
Add to `firebase.json`:
```json
{
  "functions": {
    "timeoutSeconds": 120
  }
}
```

### "Cold start delays"
Keep functions warm:
```json
{
  "hosting": {
    "frameworksBackend": {
      "minInstances": 1
    }
  }
}
```

### "Build fails"
```bash
# Clear cache and rebuild
rm -rf .next .firebase
npm run build
firebase deploy
```

### "Database connection refused"
- Ensure your DATABASE_URL includes `?sslmode=require`
- Check if Neon/Supabase allows connections from any IP
- Verify the connection string is correct

---

## Cost Estimation

| Service | Free Tier | Typical Usage |
|---------|-----------|---------------|
| Firebase Hosting | 10GB storage, 360MB/day | Free |
| Cloud Functions | 2M invocations/month | Free |
| Neon PostgreSQL | 3GB storage, 1 compute | Free |
| **Total** | | **$0/month** |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     Firebase                             │
│  ┌─────────────────┐    ┌─────────────────────────────┐ │
│  │    Hosting      │    │     Cloud Functions         │ │
│  │  (Static CDN)   │───▶│    (Next.js SSR/API)       │ │
│  └─────────────────┘    └──────────────┬──────────────┘ │
└────────────────────────────────────────┼────────────────┘
                                         │
                                         ▼
                          ┌──────────────────────────┐
                          │   PostgreSQL (Neon)      │
                          │   - Instagram Accounts   │
                          │   - Agent Jobs           │
                          │   - Posts                │
                          └──────────────────────────┘
```

---

## Next Steps

After deployment:
1. ✅ Connect your Instagram account at `/connect`
2. ✅ Run the agent to generate content
3. ✅ Set up automations for recurring posts
4. ✅ Monitor analytics

Need help? Check the [Firebase Docs](https://firebase.google.com/docs/hosting/nextjs) or open an issue!
