# Civilian: 90-second presenter script

Live: [gocivilian.org](https://gocivilian.org)  
Mirror: [civic-app-nine.vercel.app](https://civic-app-nine.vercel.app)

This script follows the implemented authenticated flow in [`pages/compose.js`](../pages/compose.js). A successful run saves a post before the result screen appears. Use a demo account and do not click **Send Letter** unless you intend to email the displayed address.

## Before presenting

1. Confirm the homepage and `/compose` load.
2. Sign in with the Google demo account before entering the report.
3. Keep the report and location below in the clipboard.
4. Open `/forum` in another tab as a fallback.

## Script

### 0:00–0:10 — Problem

**Screen:** Homepage.

> “Reporting a broken streetlight should not require knowing the city organization chart. Civilian turns a resident’s description of a specific local problem into a draft request for the relevant government contact.”

The implemented flow is documented in [`docs/ARCHITECTURE.md`](ARCHITECTURE.md).

### 0:10–0:30 — Sign in and compose

1. Click **Sign In** and choose the Google account. If the compose modal is already open, click **Continue with Google**.
2. Click **Raise Issue**.
3. Leave the language set to English.
4. Paste this report:

> Three streetlights on Rural Road between East Lemon Street and East University Drive in Tempe have been out for three weeks. The sidewalk is dark at night. Please inspect and repair the lights.

5. Enter this location:

> Rural Road & East Lemon Street, Tempe, Arizona

6. Click **Find My Voice →**.

> “The client validates the report, calls intent moderation, and then calls the analysis route.”

Evidence: [`pages/compose.js`](../pages/compose.js), [`pages/api/moderate.js`](../pages/api/moderate.js), and [`pages/api/analyze.js`](../pages/api/analyze.js).

### 0:30–1:05 — Result

**Screen:** Loading steps, then result.

> “The analysis route gives Claude web search and instructs it to find official-source contact channels, an applicable ordinance when available, and the responsible department. It drafts a formal request from only the facts submitted.”

Point to:

- department and official name, if returned;
- verified contact channels and source links;
- ordinance, if returned;
- editable letter.

> “The issue is saved to InsForge before this result appears. Email remains a separate, explicit action.”

Evidence: [`pages/api/analyze.js`](../pages/api/analyze.js), [`pages/api/posts.js`](../pages/api/posts.js), [`lib/insforge.js`](../lib/insforge.js), and [`pages/api/send-email.js`](../pages/api/send-email.js).

Do not click **Send Letter** during a portfolio demo.

### 1:05–1:20 — Community

**Screen:** Open **Feed**.

> “Residents can echo an issue. The API resolves an actor identity and the database schema enforces one echo per post and user identity.”

Evidence: [`pages/api/echo.js`](../pages/api/echo.js), [`lib/echoService.js`](../lib/echoService.js), and [`docs/insforge-schema.sql`](insforge-schema.sql).

### 1:20–1:30 — Honest close

> “Civilian began as a HackASU 2026 team prototype and is now maintained as a portfolio project. The core flow is implemented, but it is not production scale: rate limits are single-instance, moderation fails open, multilingual quality is not comprehensively tested, and some feed records are seeded examples.”

Evidence: [`pages/contact.js`](../pages/contact.js), [`pages/settings.js`](../pages/settings.js), [`lib/rateLimit.js`](../lib/rateLimit.js), [`lib/moderation.js`](../lib/moderation.js), and [`lib/civicData.js`](../lib/civicData.js).

## Fallback if analysis is slow

1. Open `/forum`.
2. Explain that its Tempe cards are seeded demonstration data, not measured user activity or verified government outcomes.
3. Show echo behavior and the issue-detail route.
4. Return to the architecture rather than claiming a live provider result.

The fallback data is defined in [`lib/civicData.js`](../lib/civicData.js) and [`lib/postsFeed.js`](../lib/postsFeed.js).

## Boundaries to state if asked

- **PARTIAL multilingual support:** the picker contains 70+ options and passes the selected language to analysis, but the test suite does not verify equivalent quality across languages ([`pages/compose.js`](../pages/compose.js), [`tests/`](../tests/)).
- **Single-instance rate limit:** only analysis has an in-memory per-IP limit ([`pages/api/analyze.js`](../pages/api/analyze.js), [`lib/rateLimit.js`](../lib/rateLimit.js)).
- **Fail-open moderation:** provider and parse failures return allowed ([`pages/api/moderate.js`](../pages/api/moderate.js), [`lib/moderation.js`](../lib/moderation.js)).
- **Authentication required:** compose blocks submission until a NextAuth session exists ([`pages/compose.js`](../pages/compose.js), [`lib/auth.js`](../lib/auth.js)).
- **No outcome claim:** the repository contains seeded examples, not evidence that a government repaired an issue because of Civilian.
