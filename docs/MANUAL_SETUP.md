# Civilian — manual setup (you do this; the app cannot)

## 1. Vercel production environment

In **Vercel → Project → Settings → Environment Variables** (Production), set:

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_INSFORGE_BASE_URL` | InsForge project URL |
| `NEXT_PUBLIC_INSFORGE_ANON_KEY` | InsForge anon key |
| `ANTHROPIC_API_KEY` | Compose / analyze |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Map + geocoding |
| `RESEND_API_KEY` | Outbound email |

Do **not** use `INSFORGE_URL` or `INSFORGE_ANON_KEY` unless you change `lib/insforge.js` on purpose.

After saving, **Redeploy** the latest `main` commit (Deployments → … → Redeploy).

## 2. InsForge database

1. Open the InsForge SQL editor for your project.
2. Run `docs/insforge-schema.sql` if you need profiles, echoes, waitlist, notifications, and extra post columns.
3. Optional demo content:
   - `demo_posts.sql` in the repo root **deletes all posts** then inserts many Tempe sample rows — only run on a dev or empty database.
   - Or run `node scripts/seed.js` locally with env configured.

## 3. Google OAuth (not in the app yet)

When you add NextAuth, configure Google Cloud OAuth with:

- Authorized JavaScript origins: `https://www.gocivilian.org`, `https://gocivilian.org`
- Redirect URI: `https://www.gocivilian.org/api/auth/callback/google`

Set `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` on Vercel.

## 4. Verify production

Open https://www.gocivilian.org/ and confirm:

- Hero stats show numbers (not long dashes) without scrolling.
- “See it in action” animates within a few seconds.
- `/forum` loads issues; `/compose` can reach Anthropic when the API key is set.

If the feed is empty but the homepage looks fine, InsForge is missing or misconfigured — fix step 1 and 2.
