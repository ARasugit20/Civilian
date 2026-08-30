# Civilian

[![Tests](https://github.com/ARasugit20/Civilian/actions/workflows/test.yml/badge.svg)](https://github.com/ARasugit20/Civilian/actions/workflows/test.yml)
[![Live demo](https://img.shields.io/badge/demo-gocivilian.org-2563eb)](https://gocivilian.org)
[![Mirror](https://img.shields.io/badge/mirror-civic--app--nine.vercel.app-64748b)](https://civic-app-nine.vercel.app)

Civilian turns a resident's description of a local physical problem into a draft request for the relevant government contact. The implemented path moderates the report, asks Claude to search for official contact channels and an applicable ordinance, drafts a letter, saves the issue to InsForge, and lets the signed-in resident decide whether to send the letter through Resend.

Evidence: the client orchestration is in [`pages/compose.js`](pages/compose.js), analysis and web-search instructions are in [`pages/api/analyze.js`](pages/api/analyze.js), persistence uses [`pages/api/posts.js`](pages/api/posts.js) and [`lib/insforge.js`](lib/insforge.js), and email delivery is in [`pages/api/send-email.js`](pages/api/send-email.js).

Civilian began as **CivicPulse**, a HackASU 2026 team prototype built with [Sumedha Gupta (`sgupt354`)](https://github.com/sgupt354) on upstream [`ClaudeHacks`](https://github.com/sgupt354/ClaudeHacks). I ([Aditya Ranjan](https://github.com/ARasugit20)) now maintain this repository. Team credit remains in [`pages/contact.js`](pages/contact.js) and [`pages/settings.js`](pages/settings.js).

## Contributions

Git history on `main` (63 commits): **54 by `sgupt354`, 9 by `ARasugit20`**. Current-line blame is similar for the large UI files. The table below states who primarily wrote each area and what I can defend in an interview.

| Area | Primary author | My role |
|---|---|---|
| Core UI: compose, forum, landing (`pages/compose.js`, `pages/forum.js`, `pages/index.js`) | Sumedha Gupta (~91–98% of current lines) | co-maintainer; added auth gating on compose submit |
| Claude analyze route (`pages/api/analyze.js`) | Sumedha Gupta (~95%) | extended; wired in-memory rate limit |
| Resend email route (`pages/api/send-email.js`) | Sumedha Gupta (100%) | not mine |
| InsForge client rename (`lib/supabase.js` → `lib/insforge.js`, commit `966a353`) | Sumedha Gupta | extended — added `upsertProfile()` and wired auth/posts ([`lib/insforge.js`](lib/insforge.js)) |
| Google OAuth + NextAuth (`lib/auth.js`, `pages/api/auth/[...nextauth].js`) | Aditya Ranjan (100%) | author |
| Echo deduplication (`lib/echoService.js`, `pages/api/echo.js`, `UNIQUE(post_id, user_id)` in schema) | Aditya Ranjan (~68–100%) | author |
| Analyze rate limiter (`lib/rateLimit.js`, used in `pages/api/analyze.js`) | Aditya Ranjan (100%) | author |
| Moderation helpers + fail-open parsing (`lib/moderation.js`, `pages/api/moderate.js`) | Aditya Ranjan (helper module); earlier moderation flow by Sumedha Gupta | refactored teammate moderation into testable helpers with fail-open behavior |
| Vitest suite + architecture/setup docs (`tests/`, `docs/ARCHITECTURE.md`, `docs/MANUAL_SETUP.md`) | Aditya Ranjan (100%) | author |
| Feed timeout fallback (`lib/postsFeed.js`, bounded reads in `pages/api/posts.js`) | Aditya Ranjan (100%) | author |
| Demo seed/fixture data (`lib/civicData.js`, `scripts/seed-data.json`) | Sumedha Gupta | not mine |

**What I built or can defend in an interview**

- Google OAuth, NextAuth session wiring, and InsForge profile upsert on sign-in ([`lib/auth.js`](lib/auth.js), [`lib/insforge.js`](lib/insforge.js), [`pages/api/auth/[...nextauth].js`](pages/api/auth/[...nextauth].js)).
- Echo deduplication: resolve actor from session, fingerprint header, or hashed request identity; enforce one echo per post and actor ([`lib/echoService.js`](lib/echoService.js), [`pages/api/echo.js`](pages/api/echo.js), [`docs/insforge-schema.sql`](docs/insforge-schema.sql)).
- In-memory per-IP analyze rate limiting ([`lib/rateLimit.js`](lib/rateLimit.js), [`pages/api/analyze.js`](pages/api/analyze.js)).
- Fail-open moderation helpers extracted from the earlier route logic ([`lib/moderation.js`](lib/moderation.js), [`tests/moderation.test.js`](tests/moderation.test.js)). The intent-moderation concept and first route implementation were teammate work; I refactored and test-covered the fail-open path.
- InsForge integration after the team rename: I did **not** perform the initial Supabase→InsForge rename; I extended the client and connected it to auth and posts ([`lib/insforge.js`](lib/insforge.js)).
- Vitest unit tests for moderation, rate limits, echo logic, homepage stats, and feed fallback ([`tests/`](tests/)).
- Evidence-backed portfolio README, demo script, CI workflow ([`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md), [`.github/workflows/test.yml`](.github/workflows/test.yml)).

**What teammates built**

- The original HackASU prototype, most pages, the analyze prompt and web-search flow, multilingual picker UI, community feed/map/reels, email sending, and demo fixtures ([`pages/`](pages/), [`lib/civicData.js`](lib/civicData.js)).

## 90-second demo script

The successful path creates an InsForge post before showing the result. Use a demo account and stop before **Send Letter** unless you intend to email the displayed address.

**0:00–0:10 — Sign in**

1. Open [gocivilian.org](https://gocivilian.org).
2. Click **Sign In** in the top navigation and choose the Google account. If the compose modal appears instead, click **Continue with Google**.
3. Click **Raise Issue**.

Say: “Civilian helps a resident turn a specific local problem into a government-ready request.”

**0:10–0:30 — Enter one report**

Leave the language set to English and paste:

> Three streetlights on Rural Road between East Lemon Street and East University Drive in Tempe have been out for three weeks. The sidewalk is dark at night. Please inspect and repair the lights.

For **Location**, enter:

> Rural Road & East Lemon Street, Tempe, Arizona

Click **Find My Voice →**.

This input is specific, observable, local, and avoids inventing an injury or incident; those are the boundaries enforced by the classifier prompt in [`pages/api/analyze.js`](pages/api/analyze.js).

**0:30–1:05 — Show the generated result**

Say: “The app first calls the moderation route, then asks Claude to search official sources for the responsible department, contact channels, and a relevant ordinance. It drafts the request and saves the issue.”

Point to the department, official or contact channels, ordinance when one was found, and editable letter. The actual sequence is visible in [`pages/compose.js`](pages/compose.js); contact-channel filtering is in [`pages/api/analyze.js`](pages/api/analyze.js).

**1:05–1:20 — Show community evidence**

Open **Feed** and point to echo counts. Echo identity and deduplication are handled by [`pages/api/echo.js`](pages/api/echo.js), [`lib/echoService.js`](lib/echoService.js), and the unique database constraint in [`docs/insforge-schema.sql`](docs/insforge-schema.sql).

**1:20–1:30 — Close honestly**

Say: “This is a maintained hackathon prototype, not a production-scale civic system. The core request flow is implemented; the limitations below are the next hardening work.”

A longer presenter version and fallback route are in [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md).

## Implemented capabilities

- **Moderation before analysis:** `/compose` calls `/api/moderate` before `/api/analyze` ([`pages/compose.js`](pages/compose.js), [`pages/api/moderate.js`](pages/api/moderate.js)).
- **Official-contact and ordinance search:** the analysis route gives Claude a web-search tool and requires official-source contact channels ([`pages/api/analyze.js`](pages/api/analyze.js)).
- **Draft letter and editable result:** the analyzed `formal_request` is shown in an editable result view ([`pages/compose.js`](pages/compose.js)).
- **InsForge persistence:** successful analysis is inserted into the `posts` table before the result screen appears ([`pages/compose.js`](pages/compose.js), [`pages/api/posts.js`](pages/api/posts.js), [`lib/insforge.js`](lib/insforge.js)).
- **Optional email action:** the user must choose **Send Letter** and confirm before the Resend API route is called ([`pages/compose.js`](pages/compose.js), [`pages/api/send-email.js`](pages/api/send-email.js)).
- **Google OAuth:** submissions currently require an authenticated NextAuth session ([`pages/compose.js`](pages/compose.js), [`components/AuthModal.js`](components/AuthModal.js), [`lib/auth.js`](lib/auth.js)).
- **Echo deduplication:** echo actors are derived from a session, browser fingerprint, or hashed request identity and backed by `UNIQUE(post_id, user_id)` ([`pages/api/echo.js`](pages/api/echo.js), [`lib/echoService.js`](lib/echoService.js), [`docs/insforge-schema.sql`](docs/insforge-schema.sql)).
- **PARTIAL — multilingual input:** the compose picker exposes 70+ language options and passes the selected language into analysis ([`pages/compose.js`](pages/compose.js)). The test suite does not establish equal output quality across those languages.
- **Feed fallback:** `/api/posts` returns seeded sample posts if its bounded InsForge read fails or times out ([`pages/api/posts.js`](pages/api/posts.js), [`lib/postsFeed.js`](lib/postsFeed.js)).

## Known limitations

- The `/api/analyze` limiter is an in-memory, per-IP window. It is single-instance only and is not shared across serverless instances ([`lib/rateLimit.js`](lib/rateLimit.js), [`pages/api/analyze.js`](pages/api/analyze.js)).
- Moderation intentionally fails open when the provider is unavailable or returns malformed JSON ([`pages/api/moderate.js`](pages/api/moderate.js), [`lib/moderation.js`](lib/moderation.js)).
- Claude output is JSON-parsed and contact channels receive basic filtering, but the full response is not validated against a schema and the ordinance is not independently verified by application code ([`pages/api/analyze.js`](pages/api/analyze.js)).
- Google sign-in is currently required to submit an issue ([`pages/compose.js`](pages/compose.js)). Anonymous-submission text elsewhere in the UI is stale.
- Feed cards, resolved examples, and fallback records include seeded Tempe data; they are not measured deployments or verified government outcomes ([`lib/civicData.js`](lib/civicData.js), [`lib/postsFeed.js`](lib/postsFeed.js), [`scripts/seed-data.json`](scripts/seed-data.json)).
- The tests are focused unit tests; there are no browser end-to-end or live-provider contract tests ([`tests/`](tests/)).
- CI runs `npm test` only. It does not deploy, exercise live credentials, or prove the public sites are healthy ([`.github/workflows/test.yml`](.github/workflows/test.yml)).

## Production hygiene

Present:

- Environment-variable based service configuration in [`lib/insforge.js`](lib/insforge.js), [`lib/auth.js`](lib/auth.js), and the API routes.
- Unit tests for moderation, rate limiting, echo logic, homepage statistics, and feed fallback in [`tests/`](tests/).
- Request-flow documentation in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
- GitHub Actions running the unit suite on pushes and pull requests.

What I would build next:

- Shared Redis-backed limits for every LLM route.
- Request and model-response schema validation.
- Consistent timeouts and typed errors across all provider and database calls.
- Multilingual fixtures covering right-to-left scripts, mixed-language input, and malformed payloads.
- Browser tests for sign-in, compose, result, feed, and explicit email consent.
- Structured error reporting and alerts.

## Local setup

Requirements and environment-variable names are documented in [`docs/MANUAL_SETUP.md`](docs/MANUAL_SETUP.md).

```bash
npm install
npm run dev
npm test
npm run build
```

The app is Next.js Pages Router with React; see [`package.json`](package.json) and [`pages/`](pages/). The database schema is in [`docs/insforge-schema.sql`](docs/insforge-schema.sql).
