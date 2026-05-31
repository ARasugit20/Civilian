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
| `NEXTAUTH_URL` | Production site URL (e.g. `https://www.gocivilian.org`) |
| `NEXTAUTH_SECRET` | Random string for session encryption |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

Do **not** use `INSFORGE_URL` or `INSFORGE_ANON_KEY` unless you change `lib/insforge.js` on purpose.

After saving, **Redeploy** the latest `main` commit (Deployments → … → Redeploy).

## 2. InsForge database

1. Open the InsForge SQL editor for your project.
2. Run `docs/insforge-schema.sql` if you need profiles, echoes, waitlist, notifications, and extra post columns.
3. To clear fake or demo rows before going live, run:

```sql
TRUNCATE TABLE posts RESTART IDENTITY CASCADE;
TRUNCATE TABLE notifications RESTART IDENTITY CASCADE;
```

4. Optional demo content:
   - `demo_posts.sql` in the repo root **deletes all posts** then inserts many Tempe sample rows — only run on a dev or empty database.
   - Or run `node scripts/seed.js` locally with env configured.

## 3. Google OAuth (NextAuth)

Configure Google Cloud OAuth with:

- Authorized JavaScript origins: `http://localhost:3000`, `https://www.gocivilian.org`, `https://gocivilian.org`
- Redirect URIs: `http://localhost:3000/api/auth/callback/google`, `https://www.gocivilian.org/api/auth/callback/google`

Set `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, and `GOOGLE_CLIENT_SECRET` in `.env.local` and on Vercel.

## 4. Verify production

Open https://www.gocivilian.org/ (or your Vercel URL) and confirm:

- Hero stats show numbers from the database (zeros when empty).
- “See it in action” animates within a few seconds.
- `/forum` loads issues; `/compose` can reach Anthropic when the API key is set.
- Google sign-in works when NextAuth env vars are set.

Run locally before deploy:

```bash
npm run test
npm run build
```

If the feed is empty but the homepage looks fine, InsForge is missing or misconfigured — fix steps 1 and 2.
