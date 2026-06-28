# 🚀 Deployment Guide — InstaAgent

This guide covers deploying InstaAgent to production with various hosting platforms.

## Prerequisites

- A PostgreSQL database (we'll set one up)
- A GitHub account (to push your code)
- An account on your chosen hosting platform

---

## 📦 Environment Variables

Your production deployment needs these environment variables:

```env
DATABASE_URL=postgresql://user:password@host:5432/database_name
```

Optional (for future Instagram API integration):
```env
INSTAGRAM_CLIENT_ID=your_client_id
INSTAGRAM_CLIENT_SECRET=your_client_secret
```

---

## Option 1: Vercel + Neon (Recommended)

**Best for:** Easiest deployment, free tier available, optimal Next.js performance

### Step 1: Set up Neon PostgreSQL (Free)

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project
3. Copy your connection string (looks like `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb`)

### Step 2: Deploy to Vercel

1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/insta-agent.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) and sign in with GitHub

3. Click "Add New Project" → Import your repository

4. Add environment variable:
   - `DATABASE_URL` = your Neon connection string

5. Click "Deploy"

### Step 3: Initialize Database

After deployment, run the schema push via Vercel CLI or the dashboard terminal:
```bash
npx drizzle-kit push
```

Or seed via API:
```bash
curl -X POST https://your-app.vercel.app/api/seed
```

---

## Option 2: Railway (All-in-One)

**Best for:** Full-stack deployment with built-in PostgreSQL

### Step 1: Deploy to Railway

1. Go to [railway.app](https://railway.app) and sign in with GitHub

2. Click "New Project" → "Deploy from GitHub repo"

3. Select your repository

4. Railway auto-detects Next.js and sets up the build

### Step 2: Add PostgreSQL

1. In your Railway project, click "New" → "Database" → "PostgreSQL"

2. Railway automatically sets `DATABASE_URL` for you

### Step 3: Deploy

Railway auto-deploys. After deployment:
```bash
# In Railway shell or locally with Railway CLI
npx drizzle-kit push
```

---

## Option 3: Render

**Best for:** Simple deployment with managed PostgreSQL

### Step 1: Create PostgreSQL on Render

1. Go to [render.com](https://render.com) → Dashboard → New → PostgreSQL
2. Create database, copy the "External Connection String"

### Step 2: Create Web Service

1. New → Web Service → Connect your GitHub repo
2. Settings:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Environment Variables:** Add `DATABASE_URL`

3. Deploy

---

## Option 4: Fly.io (Docker)

**Best for:** Global edge deployment, more control

### Step 1: Install Fly CLI

```bash
curl -L https://fly.io/install.sh | sh
fly auth login
```

### Step 2: Create fly.toml

```toml
app = "insta-agent"
primary_region = "iad"

[build]
  builder = "heroku/buildpacks:20"

[env]
  PORT = "3000"

[http_service]
  internal_port = 3000
  force_https = true

[[services]]
  internal_port = 3000
  protocol = "tcp"

  [[services.ports]]
    port = 80
    handlers = ["http"]

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]
```

### Step 3: Create Fly Postgres

```bash
fly postgres create --name insta-agent-db
fly postgres attach insta-agent-db
```

### Step 4: Deploy

```bash
fly deploy
```

---

## Option 5: Firebase Hosting + Cloud Functions

**Best for:** If you're already in the Google/Firebase ecosystem

> **Note:** Firebase doesn't have PostgreSQL. You'll need an external database (Neon, Supabase, etc.)

### Step 1: Set up PostgreSQL (Choose one)

**Option A: Neon (Recommended - Free)**
1. Go to [neon.tech](https://neon.tech)
2. Create project, copy connection string

**Option B: Supabase (Free)**
1. Go to [supabase.com](https://supabase.com)
2. Create project → Settings → Database → Connection string

**Option C: Google Cloud SQL (Paid)**
1. Go to Google Cloud Console
2. Create Cloud SQL PostgreSQL instance
3. Get connection string

### Step 2: Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### Step 3: Initialize Firebase

```bash
# Create a new Firebase project at console.firebase.google.com first
firebase init hosting

# When prompted:
# - Select your project
# - Choose "Detected Next.js" when asked about framework
# - Select region (us-central1 is default)
```

### Step 4: Configure Environment Variables

```bash
# Set your database URL as a Firebase secret
firebase functions:secrets:set DATABASE_URL

# When prompted, paste your PostgreSQL connection string
```

Or add to `.env.local` for local development:
```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

### Step 5: Update firebase.json

Your `firebase.json` should look like:
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

### Step 6: Deploy

```bash
firebase deploy
```

### Step 7: Initialize Database

After deployment:
```bash
curl -X POST https://your-project.web.app/api/db/push
curl -X POST https://your-project.web.app/api/seed
```

### Firebase Pricing Notes
- **Hosting:** Free tier includes 10GB storage, 360MB/day transfer
- **Cloud Functions:** Free tier includes 2M invocations/month
- **Blaze Plan** (pay-as-you-go) required for external network calls (to your PostgreSQL)

### Troubleshooting Firebase

**"External network not accessible"**
- You need to upgrade to the Blaze plan (pay-as-you-go) to make external API calls

**Cold starts are slow**
- Cloud Functions have cold start latency; consider keeping minimum instances:
```json
{
  "hosting": {
    "frameworksBackend": {
      "region": "us-central1",
      "minInstances": 1
    }
  }
}
```

**Build timeout**
- Increase timeout in `firebase.json`:
```json
{
  "functions": {
    "runtime": "nodejs20",
    "timeoutSeconds": 120
  }
}
```

---

## Option 6: DigitalOcean App Platform

1. Go to [cloud.digitalocean.com](https://cloud.digitalocean.com) → Apps → Create App
2. Connect GitHub repo
3. Add a managed PostgreSQL database
4. Configure environment variables
5. Deploy

---

## 🗄️ Database Setup (Post-Deployment)

After deploying, initialize your database schema:

### Option A: Via API (Easiest)
```bash
# Push schema
curl -X POST https://your-app.vercel.app/api/db/push

# Seed demo data
curl -X POST https://your-app.vercel.app/api/seed
```

### Option B: Via CLI (Local)
```bash
# Set production DATABASE_URL locally
export DATABASE_URL="your-production-connection-string"

# Push schema
npx drizzle-kit push

# Or run migrations
npx drizzle-kit migrate
```

---

## 🔐 Security Checklist

- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS (automatic on Vercel/Railway/Render)
- [ ] Set up rate limiting for API routes (optional)
- [ ] Configure CORS if needed

---

## 📊 Post-Deployment

1. **Visit your app** at your deployment URL
2. **Seed demo data** via Settings → Load Demo Data
3. **Connect your Instagram** at /connect
4. **Run the agent** to generate your first content!

---

## 🔧 Troubleshooting

### Database Connection Issues
- Ensure `DATABASE_URL` includes `?sslmode=require` for cloud databases
- Check if your database allows external connections

### Build Failures
- Check Node.js version (requires 18+)
- Ensure all dependencies are in `package.json`

### Schema Issues
```bash
# Reset and repush schema
npx drizzle-kit push --force
```

---

## 💡 Tips

- **Vercel** is free for hobby projects and has the best Next.js integration
- **Neon** offers a generous free tier for PostgreSQL
- **Railway** is great for quick full-stack deploys with built-in Postgres
- Set up a custom domain for a professional look

---

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Neon Docs: https://neon.tech/docs
- Railway Docs: https://docs.railway.app
- Drizzle Docs: https://orm.drizzle.team
