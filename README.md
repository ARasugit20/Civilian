<div align="center">

<img src="https://img.shields.io/badge/HackASU%202026-Winner-gold?style=for-the-badge" />
<img src="https://img.shields.io/badge/Built%20in-36%20hours-blue?style=for-the-badge" />
<img src="https://img.shields.io/badge/70%2B%20Languages-Global%20Access-22c55e?style=for-the-badge" />

# Civilian

### Turn a plain-language complaint into a routed government request — in any language, in under two minutes.

**Civilian** converts everyday neighborhood frustration into formal, ordinance-cited letters addressed to the right local official — then lets neighbors echo the issue until it becomes impossible to ignore.

<br/>

[![Live Demo](https://img.shields.io/badge/Live-gocivilian.org-22c55e?style=for-the-badge)](https://gocivilian.org)
[![Mirror Demo](https://img.shields.io/badge/Mirror-civic--app--nine.vercel.app-181717?style=for-the-badge)](https://civic-app-nine.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-ARasugit20%2FCivilian-181717?style=for-the-badge&logo=github)](https://github.com/ARasugit20/Civilian)

**HackASU 2026 winner** · built in **36 hours** · maintained by [Aditya Ranjan](https://github.com/ARasugit20)

**90-second demo script:** [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md)

</div>

---

## The outcome

Maria sees the same broken streetlight every night. She does not know which department handles it, does not speak English fluently, and does not know how to write a formal complaint. So she does nothing.

**Civilian closes that gap:**

1. **Describe the problem** in plain language — 70+ languages supported.
2. **AI routes it** — finds the real official, cites applicable municipal code, and drafts a formal letter.
3. **Community amplifies it** — neighbors echo the issue; collective pressure replaces a single ignored email.

That is the product. The stack exists to deliver that outcome.

---

## What is real vs. hackathon glue

| Real (works end-to-end today) | Hackathon glue (needs rework for production) |
|---|---|
| `/compose` AI flow: moderation → analyze → letter + contact channels | **Rate limiting** only on `POST /api/analyze` (in-memory, per serverless instance). `/api/moderate` and `/api/translate` are unbounded. |
| Claude web search for officials, ordinances, and contact channels | **Distributed rate limits** (Upstash Redis / Vercel KV) across all LLM routes |
| Multilingual input and letter generation (70+ languages) | **Multilingual input validation** — length limits exist; no script detection, locale normalization, or adversarial testing |
| Community feed, echoes, map, search, profile | **Error handling depth** — many routes return generic 500s; InsForge timeouts now fall back to seeded posts on `/api/posts`, but other DB paths still need the same treatment |
| Optional Google sign-in (NextAuth) + anonymous posting | **Structured response validation** — analyze output is JSON-parsed with light sanitization, not schema-validated (Zod) |
| Email send via Resend (`POST /api/send-email`) | **Demo fixtures** — forum sidebar, homepage stats, resolved-case cards, and fallback posts in `lib/civicData.js` / `lib/postsFeed.js` are seeded Tempe examples, not live government responses |
| Intent-based moderation with fail-open on outage | **TinyFish follow-up agent** — optional integration; not core to the demo path |
| Vitest unit tests for moderation, rate limits, echo logic, home stats, feed fallback | **Integration / E2E tests** — no Playwright or API contract tests yet |
| InsForge Postgres for posts, echoes, profiles | **Observability** — console logging only; no Sentry, structured logs, or alerting |

**Bottom line:** the core demo path is real. The surrounding reliability, abuse prevention, and data-quality layers are prototype-grade.

---

## Production hygiene checklist

### Already in place

- [x] Secrets in env vars only — see [`.env.example`](.env.example); never commit `.env.local`
- [x] InsForge client uses `NEXT_PUBLIC_INSFORGE_BASE_URL` + `NEXT_PUBLIC_INSFORGE_ANON_KEY` ([`lib/insforge.js`](lib/insforge.js))
- [x] Analyze rate limit per IP ([`lib/rateLimit.js`](lib/rateLimit.js))
- [x] Echo deduplication via `UNIQUE(post_id, user_id)` + fingerprint header
- [x] Intent-based moderation with fail-open ([`lib/moderation.js`](lib/moderation.js))
- [x] Unit tests: `npm run test` (moderation, rate limit, echo, home stats, posts feed fallback)
- [x] Architecture doc: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

### Missing — intern week-one hardening pass

- [ ] Redis-backed rate limits on **all** LLM routes (`/api/analyze`, `/api/moderate`, `/api/translate`)
- [ ] Zod (or similar) schema validation on API request bodies and Claude JSON responses
- [ ] Consistent DB timeout + fallback pattern across every InsForge read (not just `/api/posts`)
- [ ] Multilingual input tests: RTL scripts, mixed-language input, emoji/symbol edge cases, max-length abuse
- [ ] Playwright smoke test: homepage → compose → forum feed loads
- [ ] Sentry (or equivalent) for API 5xx and Claude parse failures
- [ ] CI workflow: `npm run test && npm run build` on every PR
- [ ] Replace demo fixtures with clear "sample data" labels in the UI when DB is empty

---

## How it works

```
You describe the problem  →  AI routes + writes the letter  →  Community echoes it
```

| Step | What happens |
|---|---|
| Describe | Resident writes in any language on `/compose`; optional photo upload |
| Moderate | Claude Haiku checks intent (civic frustration OK, abuse blocked); fail-open on outage |
| Analyze | Claude Sonnet web-searches for the real official, ordinance, and contact channels; writes formal letter |
| Publish | Issue saved to InsForge, appears on feed + map |
| Amplify | Neighbors echo; urgency rises; optional email via Resend |

---

## Tech stack

<details>
<summary>Stack details (click to expand)</summary>

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (Pages Router) |
| Frontend | React 19 + Tailwind CSS 4 |
| AI — Analysis | Claude Sonnet with live web search |
| AI — Moderation / Translation | Claude Haiku |
| Database | InsForge (Postgres BaaS) |
| Maps | Mapbox GL + react-map-gl |
| Email | Resend |
| Auth | NextAuth v5 (Google, optional) |
| Deployment | Vercel |

</details>

---

## Pages & API

<details>
<summary>Routes (click to expand)</summary>

| Page | Purpose |
|---|---|
| `/` | Landing — hero, stats, how-it-works demo |
| `/compose` | Raise an issue (core AI flow) |
| `/forum` | Community feed |
| `/map` | Issues on interactive map |
| `/search` | Full-text search |
| `/post/[id]` | Single issue — echoes, comments |
| `/profile` | User's raised and echoed issues |

| API route | Purpose |
|---|---|
| `POST /api/analyze` | Official lookup, ordinance cite, formal letter |
| `POST /api/moderate` | Intent-based moderation |
| `POST /api/translate` | Translate letter |
| `GET/POST /api/posts` | Feed CRUD (fallback posts on DB timeout) |
| `POST /api/echo` | Echo / upvote |
| `POST /api/send-email` | Send letter via Resend |

Full list in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

</details>

---

## Local setup

```bash
git clone https://github.com/ARasugit20/Civilian.git
cd Civilian
npm install
cp .env.example .env.local   # fill in keys — see docs/MANUAL_SETUP.md
npm run dev                  # http://localhost:3000
npm run test
npm run build
```

Required env vars: `NEXT_PUBLIC_INSFORGE_BASE_URL`, `NEXT_PUBLIC_INSFORGE_ANON_KEY`, `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_MAPBOX_TOKEN`, `RESEND_API_KEY`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`. Optional: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ANALYZE_RATE_LIMIT_MAX`, `INSFORGE_READ_TIMEOUT_MS`.

Database schema: [`docs/insforge-schema.sql`](docs/insforge-schema.sql) · seed: `node scripts/seed.js`

---

## Project structure

```
pages/          # Pages Router routes + API handlers
components/     # Nav, Toast, dialogs
lib/            # insforge, auth, moderation, rateLimit, postsFeed, civicData
tests/          # vitest unit tests
docs/           # ARCHITECTURE, MANUAL_SETUP, DEMO_SCRIPT, schema SQL
```

---

<div align="center">

Built in 36 hours at **HackASU 2026** · winner · live at **[gocivilian.org](https://gocivilian.org)**

*Every resident deserves to be heard by the right person, in the right format, with their community behind them.*

</div>
