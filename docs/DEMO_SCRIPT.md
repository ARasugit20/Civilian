# Civilian — 90-second demo script

**Live URL:** [gocivilian.org](https://gocivilian.org) · mirror: [civic-app-nine.vercel.app](https://civic-app-nine.vercel.app)

**Presenter:** Aditya Ranjan · **Event:** HackASU 2026 (winner) · **Built in:** 36 hours

---

## Timing guide

| Time | Beat |
|---|---|
| 0:00–0:15 | Problem + hook |
| 0:15–0:45 | Live compose flow |
| 0:45–1:05 | Community feed + multilingual |
| 1:05–1:20 | Impact + honesty close |
| 1:20–1:30 | Ask / Q&A buffer |

---

## Script

### 0:00 — Hook (15 sec)

> "Maria walks past the same broken streetlight every night. She does not know who to call, does not speak English fluently, and does not know how to write a formal complaint — so she does nothing.
>
> **Civilian** fixes that. We built it in 36 hours at HackASU and won. You describe a problem in plain language — any of 70-plus languages — and AI turns it into a formal letter routed to the real local official."

**Screen:** Homepage at `gocivilian.org` — point to hero and stats bar.

---

### 0:15 — Compose flow (30 sec)

> "Let me show you the core flow."

**Action:** Click **Raise Issue** → `/compose`

> "I'll describe a real neighborhood problem — a broken streetlight on Rural Road that's been out for three weeks."

**Type (or paste):**
```
There's a broken streetlight on Rural Road near the Tempe library. It's been out for 3 weeks and it's dangerous at night for pedestrians.
```

**Action:** Click **Analyze** (or equivalent submit button).

> "Behind the scenes, Claude moderates for intent, then web-searches for the actual responsible official, the city ordinance that applies, and every real contact channel — email, 311 portal, phone. It writes a formal letter citing real law. That took about 30 seconds instead of hours of bureaucracy research."

**Screen:** Show the generated letter, official name, department, and contact channels panel.

**Do not** click Send Email or Publish unless you want a real post in the feed.

---

### 0:45 — Community + multilingual (20 sec)

**Action:** Navigate to **Feed** → `/forum`

> "Once published, the issue goes to a public feed. Neighbors who've seen the same pothole or broken light can **echo** it — one voice is easy to ignore, fifty from the same block is a pattern."

**Point to:** Echo counts on trending sidebar.

> "Notice this Spanish report — same workflow, same quality letter. Language is not a barrier."

**Point to:** The Spanish pothole thread in the trending list (`Hay un bache enorme...`).

Optional: Open **Map** (`/map`) for 5 seconds — "Every issue is geocoded and visible on the city map."

---

### 1:05 — Close with honesty (15 sec)

> "This is a HackASU prototype that actually works end-to-end — real AI routing, real letters, real community feed. What still needs a production pass: distributed rate limiting on all LLM calls, deeper error handling, and schema validation on multilingual input. But the outcome is real: plain language in, routed government request out, community pressure behind it."

**Screen:** Return to homepage CTA — "Start Reporting Free."

---

### 1:20 — Buffer / Q&A (10 sec)

> "Happy to take questions — or try it yourself at gocivilian.org. No account required."

---

## Fallback paths (if live AI is slow)

Use these if `/api/analyze` takes longer than 15 seconds or rate-limits during judging.

### Fallback A — Homepage demo widget

1. Stay on `/` and click **Replay** on the "See it in action" widget.
2. Narrate the four steps (Describe → AI Analyzes → Letter Written → Sent) while the animation plays.
3. Jump to `/forum` for the community/multilingual beat.

### Fallback B — Pre-seeded feed only

1. Skip compose entirely.
2. Open `/forum` — trending sidebar has 5 Tempe issues including the Spanish report.
3. Say: "The AI flow takes 15–30 seconds live; here's what the output looks like once routed" and open any existing post from the sidebar.

### Fallback C — Rate limited

If you see "Too many analysis requests":
> "We rate-limit analyze calls to 8 per minute per IP — that's one of the prototype guardrails I mentioned. Let me show the feed and map instead."

Navigate to `/forum` or `/map`.

---

## Pre-demo checklist (2 minutes before)

- [ ] Open `gocivilian.org` in a fresh tab — confirm homepage loads
- [ ] Open `/forum` in a second tab — confirm feed shows issues (not stuck on "Loading...")
- [ ] Confirm `.env.local` / Vercel has `ANTHROPIC_API_KEY` set (analyze will 500 without it)
- [ ] Close extra tabs to avoid burning analyze rate limit
- [ ] Have the compose complaint text copied to clipboard
- [ ] Do **not** submit a real email unless intentional

---

## One-liner versions

**Elevator (10 sec):** "Civilian turns plain-language neighborhood complaints into formal government letters routed to the right official — in 70+ languages — and lets neighbors echo until the city responds."

**Judge (20 sec):** "We won HackASU 2026 by building this in 36 hours. Residents describe a problem casually; AI finds the real official, cites the ordinance, writes the letter. Community echoes turn one frustrated email into collective pressure."
