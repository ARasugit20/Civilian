# Contributing to Civilian

Thanks for helping improve [Civilian](https://github.com/ARasugit20/Civilian). This repo is maintained as a portfolio-quality civic tech project.

## Good first contributions (4–5 PR-sized ideas)

1. **Tests** — extend `tests/` (moderation edge cases, translate smoke tests, home stats)
2. **Echo UX** — surface server duplicate errors in forum/reels toasts
3. **Accessibility** — keyboard nav on compose flow and map markers
4. **i18n** — add one new language path test + compose language banner copy
5. **Ops** — Upstash-backed rate limiter behind `ANALYZE_RATE_LIMIT_REDIS_URL`

## Development setup

```bash
git clone https://github.com/ARasugit20/Civilian.git
cd Civilian
npm install
cp .env.example .env.local
# fill keys — see docs/MANUAL_SETUP.md
npm run dev
```

## Before opening a PR

```bash
npm run test
npm run build
```

- Keep diffs focused; do not rewrite unrelated files
- Pages Router only — no App Router migration in drive-by PRs
- Database via `lib/insforge.js` — no Supabase
- Moderation and analyze outages should **fail open** unless the issue explicitly changes that policy

## Commit style

Use clear, imperative subjects: `fix:`, `feat:`, `docs:`, `test:` — same as existing history on `main`.
