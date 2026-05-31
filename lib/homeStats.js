export function isResolvedStatus(s) {
  const x = String(s || "").toLowerCase();
  return x === "resolved" || x.includes("resolved");
}

/** API fallback + in-app demo threads — not InsForge rows. */
export function isSeedPostId(id) {
  const s = String(id || "");
  return s.startsWith("fallback-") || s.startsWith("demo-");
}

export function isStoredPost(post) {
  const id = String(post?.id || "");
  return Boolean(id) && !isSeedPostId(id);
}

/** Homepage aggregates — stored posts only; empty DB yields zeros. */
export function computeHomeStats(posts) {
  const stored = Array.isArray(posts) ? posts.filter(isStoredPost) : [];

  const totalVoices = stored.reduce((s, p) => s + (Number(p.echo_count) || 0), 0);
  const totalLetters = stored.filter(
    (p) => p.formal_request && String(p.formal_request).trim()
  ).length;
  const totalResolved = stored.filter((p) => isResolvedStatus(p.status)).length;
  const unresolvedCount = stored.filter((p) => !isResolvedStatus(p.status)).length;

  return { totalVoices, totalLetters, totalResolved, unresolvedCount };
}

export function neighborhoodHealthScore(unresolvedCount) {
  return Math.max(0, Math.min(100, 100 - unresolvedCount * 2));
}
