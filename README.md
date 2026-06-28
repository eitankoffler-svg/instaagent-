# 🤖 InstaAgent — Automated Instagram Content Creator

An AI-powered agent that automatically creates and posts faceless videos to your Instagram account. Perfect for travel and food content creators who want to scale their content production.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![Drizzle](https://img.shields.io/badge/Drizzle-ORM-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## ✨ Features

### 🔗 Connect Your Instagram
- Paste your Instagram profile link or @username
- AI automatically detects your niche (Travel or Food)
- Profile analysis with confidence score
- Manage multiple connected accounts

### 🤖 Automated Content Pipeline
1. **🔍 Analyze** — Scans your profile to match your style
2. **🧠 Ideate** — Generates viral content ideas
3. **📝 Script** — Writes video scripts with CTAs
4. **🎬 Video** — Creates faceless video content
5. **✍️ Caption** — Writes engaging captions & hashtags
6. **📤 Publish** — Auto-posts to your Instagram

### ⚡ Automations
- Schedule recurring content creation (hourly/daily/weekly)
- Set posts per run (1-5 posts)
- Auto-post or schedule for review
- Track total runs and posts created

### 📊 Analytics
- Track views, likes, comments, shares, saves
- Per-post engagement metrics
- Visual performance charts

### 🎯 Supported Niches
- **Travel** — Destinations, adventures, hidden gems
- **Food** — Cooking ASMR, recipes, street food

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/insta-agent.git
cd insta-agent

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# Push database schema
npx drizzle-kit push

# Run development server
npm run dev
```

Visit `http://localhost:3000` and start connecting your Instagram!

## 📦 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL + Drizzle ORM
- **Styling:** Tailwind CSS 4
- **Icons:** Lucide React
- **Language:** TypeScript

## 🗂️ Project Structure

```
src/
├── app/
│   ├── agent/          # Agent runner UI
│   ├── automations/    # Automation rules
│   ├── connect/        # Instagram connection flow
│   ├── pipeline/       # Job details & logs
│   ├── posts/          # Published/scheduled posts
│   ├── analytics/      # Performance metrics
│   ├── campaigns/      # Ad campaigns
│   └── api/            # API routes
├── components/         # Reusable UI components
├── db/                 # Database schema & client
└── lib/                # Agent engine & utilities
```

## 🔧 Configuration

### Environment Variables

```env
DATABASE_URL=postgresql://user:password@localhost:5432/insta_agent
```

### Database Schema

The app uses these main tables:
- `instagram_accounts` — Connected Instagram profiles
- `agent_jobs` — Pipeline execution records
- `agent_logs` — Step-by-step execution logs
- `posts` — Generated content
- `automation_rules` — Recurring schedules
- `analytics` — Post performance metrics

## 📖 API Reference

### Accounts
- `POST /api/accounts/connect` — Connect Instagram account
- `GET /api/accounts` — List connected accounts
- `DELETE /api/accounts/[id]` — Disconnect account

### Agent
- `POST /api/agent/run` — Run content pipeline
- `GET /api/agent/jobs` — List all jobs
- `GET /api/agent/jobs/[id]` — Get job details

### Automations
- `POST /api/automations` — Create automation rule
- `POST /api/automations/[id]/trigger` — Manually trigger rule

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick deploy options:**
- **Vercel + Neon** (Recommended)
- **Railway**
- **Render**
- **Fly.io**

## 🛣️ Roadmap

- [ ] Real Instagram Graph API integration
- [ ] AI video generation (RunwayML/Pika integration)
- [ ] AI caption generation (GPT-4 integration)
- [ ] Multi-account dashboard
- [ ] Content calendar view
- [ ] A/B testing for captions
- [ ] Competitor analysis

## 📄 License

MIT License — feel free to use this for your own projects!

## 🙏 Credits

Built with ❤️ using Next.js, Drizzle ORM, and Tailwind CSS.

Stock photos from [Pexels](https://pexels.com).
