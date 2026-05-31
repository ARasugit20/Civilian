const buckets = new Map();

/**
 * Simple in-memory sliding window rate limiter (per serverless instance).
 * For production at scale, swap for Upstash Redis or Vercel KV.
 */
export function rateLimit(key, { windowMs = 60_000, max = 10 } = {}) {
  const now = Date.now();
  let entry = buckets.get(key);
  if (!entry || now - entry.start > windowMs) {
    entry = { start: now, count: 0 };
    buckets.set(key, entry);
  }
  entry.count += 1;
  if (entry.count > max) {
    return {
      limited: true,
      retryAfterMs: Math.max(0, windowMs - (now - entry.start)),
      remaining: 0,
    };
  }
  return { limited: false, remaining: max - entry.count, retryAfterMs: 0 };
}

export function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  if (Array.isArray(forwarded) && forwarded[0]) return String(forwarded[0]).trim();
  return req.socket?.remoteAddress || "unknown";
}
