# Civilian — architecture

## Request flow (raise issue → official email)

```mermaid
flowchart LR
  subgraph client [Browser]
    A[User on /compose]
  end
  subgraph api [Next.js API routes]
    M[POST /api/moderate]
    Z[POST /api/analyze]
    P[POST /api/posts]
    E[POST /api/send-email]
  end
  subgraph external [Services]
    C[Anthropic Claude]
    D[(InsForge Postgres)]
    R[Resend]
  end
  A -->|complaint text| M
  M -->|intent check| C
  M -->|allowed| A
  A -->|complaint + location| Z
  Z -->|web search + letter| C
  Z -->|JSON letter + channels| A
  A -->|save issue| P
  P -->|insert row| D
  A -->|optional send| E
  E -->|formal_request| R
  E -->|status update| D
```

## Auth & profile (optional Google sign-in)

- `pages/api/auth/[...nextauth].js` → `lib/auth.js` (Google OAuth)
- On sign-in, `lib/insforge.js` `upsertProfile()` writes `profiles`
- Posts can attach `user_id`, `user_display_name`, `user_avatar` when a session exists

## Echo integrity

- Client stores `civilian_echo_fp` in `localStorage` and sends `X-Civilian-Fingerprint`
- `POST /api/echo` resolves actor via session user id, fingerprint header, or hashed IP+UA
- InsForge `echoes` table enforces `UNIQUE(post_id, user_id)`; count increments only on new row

## Moderation philosophy

- **Intent-based** (`/api/moderate`): civic frustration allowed; abuse blocked
- **Fail-open**: if Anthropic is down or JSON parse fails, the request is allowed so residents are not silently blocked

## Rate limiting

- `POST /api/analyze` uses in-memory sliding window per IP (`lib/rateLimit.js`)
- Tune via `ANALYZE_RATE_LIMIT_MAX` and `ANALYZE_RATE_LIMIT_WINDOW_MS`
- For multi-instance production, replace with Upstash Redis / Vercel KV
