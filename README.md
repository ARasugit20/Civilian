<div align="center">

<img src="https://img.shields.io/badge/Built%20for-HackASU-blue?style=for-the-badge" />
<img src="https://img.shields.io/badge/Powered%20by-Claude%20AI-orange?style=for-the-badge" />
<img src="https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge" />

# 🏛️ Civilian

### *Your voice. Your city. Amplified by AI.*

**Civilian** is an AI-powered civic engagement platform that turns everyday frustration into formal government action — in any language, for any resident, in under 2 minutes.

<br/>

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-civic--app--nine.vercel.app-22c55e?style=for-the-badge)](https://civic-app-nine.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-ARasugit20%2FCivilian-181717?style=for-the-badge&logo=github)](https://github.com/ARasugit20/Civilian)

**Portfolio maintainer:** [Aditya Ranjan](https://github.com/ARasugit20) · **Origin:** built for [HackASU](https://github.com/sgupt354/ClaudeHacks) (team prototype), evolved into production civic app at [gocivilian.org](https://www.gocivilian.org).

</div>

---

## 🧩 The Problem

> *Maria walks past the same broken streetlight every night. It's been dark for six weeks. Her neighbor's kid nearly got hit by a car last month.*
>
> *She wants to report it — but she doesn't know who to call. She doesn't speak English fluently. She doesn't know what department handles streetlights, or how to write a formal complaint.*
>
> *So she does nothing. The light stays broken.*

This is the **civic participation gap**. It's not apathy — it's friction. And it hits hardest on people who are already underserved: non-English speakers, first-generation residents, anyone who's never had to navigate government bureaucracy.

The people who need their government to listen the most are the ones least equipped to make it happen.

**Civilian exists to close that gap.**

---

## ✨ How It Works

```
You describe the problem  →  AI does the rest  →  Community amplifies it
```

**1. Describe it in plain language** — in any of 70+ languages, as casually as you want.

**2. AI finds the right official** — Claude searches the web for the real, current responsible official in your city, looks up the actual municipal codes that apply, and writes a formal professional complaint letter on your behalf.

**3. Community rallies behind you** — Your issue is posted to a public feed. Neighbors who've seen the same pothole, the same broken light, the same unsafe crosswalk can echo your complaint. One voice is easy to ignore. Fifty voices from the same neighborhood is a pattern that demands a response.

---

## 🌍 Real World Impact

Every complaint submitted through Civilian:

| What happens | Why it matters |
|---|---|
| Goes to a **named, real official** | Not a generic inbox that gets ignored |
| Cites the **specific city ordinance** being violated | Officials can't claim ignorance |
| Shows a **community echo count** | Turns individual frustration into collective pressure |
| Is **publicly visible** | Creates transparency and accountability |
| Can be **marked resolved** | Closes the loop — residents see results |

When ten people echo the same pothole report, it signals a neighborhood problem. The urgency score rises. The issue becomes harder to deprioritize.

---

## ⚖️ Ethics & Fairness

Civilian was built with a deliberate commitment to not making existing inequalities worse.

**🌐 Language equity** — 70+ languages supported. A resident who speaks Somali, Gujarati, or Haitian Creole gets the same access as an English speaker. The language barrier is removed entirely.

**⚖️ No bias in routing** — The AI finds officials based on location and issue type, not who the user is. A complaint from a low-income neighborhood gets the same quality letter and the same official contact as one from an affluent area.

**🛡️ Intent-based moderation, not keyword policing** — The system understands that a frustrated resident venting about a dangerous road is not the same as someone being abusive. It asks one question: *is this message appropriate to send to a government official?* Legitimate civic frustration passes. Actual abuse doesn't.

**🔒 Privacy-first posting** — Google sign-in is optional; anonymous posting still works. No PII required to raise an issue.

**🔓 Fail-open design** — If moderation or translation APIs are unavailable, the system defaults to allowing the complaint through. Civic participation is never silently blocked by a technical failure.

---

## 🔐 Security & reliability

| Control | Implementation |
|---|---|
| Analyze rate limit | In-memory per-IP window on `POST /api/analyze` (default 8/min). Set `ANALYZE_RATE_LIMIT_MAX` / `ANALYZE_RATE_LIMIT_WINDOW_MS`. Use Redis/Upstash at scale. |
| Echo deduplication | `echoes` table `UNIQUE(post_id, user_id)` + `X-Civilian-Fingerprint` / session id |
| Moderation | Intent-based Claude Haiku; **fail-open** on outage (see `lib/moderation.js`, `tests/moderation.test.js`) |
| Secrets | Never commit `.env.local`; see `.env.example` |

Architecture diagram: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

---

## 🛠️ Tech Stack

<div align="center">

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (Pages Router) |
| Frontend | React 19 + Tailwind CSS 4 |
| AI — Analysis | Claude `claude-sonnet-4-6` with live web search |
| AI — Moderation | Claude `claude-haiku-4-5` |
| AI — Translation | Claude `claude-haiku-4-5` |
| Database | InsForge (Postgres BaaS) |
| Maps | Mapbox GL + react-map-gl + Leaflet |
| Email | Resend |
| Animation | Framer Motion + Three.js |
| PDF Export | jsPDF |
| Deployment | Vercel |

</div>

---

## 🗺️ Pages

| Page | What it does |
|---|---|
| `/` | Landing — hero, stats, how it works |
| `/compose` | Raise an issue — the core AI flow |
| `/forum` | Community feed of all issues |
| `/map` | All issues plotted on an interactive map |
| `/search` | Full-text search across all issues |
| `/reels` | Short-form vertical scroll of recent issues |
| `/post/[id]` | Single issue — details, echoes, comments |
| `/similar` | Issues matching yours after you submit |
| `/profile` | Your raised and echoed issues |

---

## 🔌 API Routes

| Route | Purpose |
|---|---|
| `POST /api/analyze` | Claude finds official, cites ordinance, writes formal letter |
| `POST /api/moderate` | Intent-based content moderation |
| `POST /api/translate` | Translate complaint to English |
| `GET/POST /api/posts` | Fetch all posts or create one |
| `GET /api/search` | Full-text search |
| `GET /api/similar` | Posts matching issue type + location |
| `POST /api/echo` | Upvote / echo a post |
| `GET/POST /api/comments` | Comments on a post |
| `POST /api/send-email` | Send formal complaint to official via Resend |
| `POST /api/resolve` | Mark issue as resolved |

---

## 🚀 Local Setup

### Prerequisites

- Node.js 18+
- [Anthropic API key](https://console.anthropic.com/)
- [InsForge](https://insforge.app) project
- [Resend](https://resend.com) API key
- [Mapbox](https://mapbox.com) token

### Install & Run

```bash
git clone https://github.com/ARasugit20/Civilian.git
cd Civilian
npm install
```

Create `.env.local` (see `.env.example` and [`docs/MANUAL_SETUP.md`](docs/MANUAL_SETUP.md)):

```env
NEXT_PUBLIC_INSFORGE_BASE_URL=https://your-project.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=your_insforge_anon_key
ANTHROPIC_API_KEY=your_anthropic_key
RESEND_API_KEY=your_resend_key
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_a_random_string
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

```bash
npm run dev
# open http://localhost:3000
npm run test    # vitest — moderation, echo, stats
npm run build
```

### Database Schema

```sql
create table posts (
  id            uuid primary key default gen_random_uuid(),
  complaint     text,
  formal_request text,
  department    text,
  official_name text,
  official_email text,
  issue_type    text,
  location      text,
  urgency_score int,
  echo_count    int default 0,
  resolved      boolean default false,
  created_at    timestamptz default now()
);
```

Seed demo data:

```bash
node scripts/seed.js
```

---

## 📁 Project Structure

```
civic-app/
├── pages/
│   ├── index.js          # Landing page
│   ├── compose.js        # Raise an issue (core AI flow)
│   ├── forum.js          # Community feed
│   ├── map.js            # Issues map
│   ├── search.js         # Search
│   ├── reels.js          # Issue reels
│   ├── profile.js        # User profile
│   ├── post/[id].js      # Single issue
│   ├── similar.js        # Similar issues
│   └── api/              # All API routes
├── components/
│   ├── Nav.js
│   └── Toast.js
├── lib/
│   ├── insforge.js       # Database client + profile upsert
│   ├── auth.js            # NextAuth (Google)
│   ├── moderation.js      # Intent moderation helpers
│   ├── rateLimit.js       # Analyze rate limiting
│   └── homeStats.js       # Homepage aggregates
├── tests/                 # vitest unit tests
├── docs/
│   ├── ARCHITECTURE.md
│   └── MANUAL_SETUP.md
└── styles/
    └── globals.css
```

---

<div align="center">

Built for **HackASU** · maintained by **Aditya Ranjan** as a portfolio piece.

*Every resident deserves to have their voice heard by the right person, in the right format, with their community behind them.*

</div>
