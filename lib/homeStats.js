import { FORUM_THREADS } from "./civicData";

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

export function computeHomeStats(posts) {
  const threadVoices = FORUM_THREADS.reduce((s, t) => s + (Number(t.support) || 0), 0);
  const lettersFromThreads = FORUM_THREADS.filter((t) => (t.text || "").trim()).length;
  const resolvedFromThreads = FORUM_THREADS.filter(
    (t) => isResolvedStatus(t.status) || t.gov_response
  ).length;
  const unresolvedThreads = FORUM_THREADS.filter(
    (t) => !isResolvedStatus(t.status) && !t.gov_response
  ).length;

  const stored = Array.isArray(posts) ? posts.filter(isStoredPost) : [];

  if (!stored.length) {
    return {
      totalVoices: threadVoices,
      totalLetters: lettersFromThreads,
      totalResolved: resolvedFromThreads,
      unresolvedCount: unresolvedThreads,
    };
  }

  const dbVoices = stored.reduce((s, p) => s + (Number(p.echo_count) || 0), 0);
  const dbLetters = stored.filter(
    (p) => (p.formal_request && String(p.formal_request).trim()) || p.complaint
  ).length;
  const dbResolved = stored.filter((p) => isResolvedStatus(p.status)).length;
  const dbUnresolved = stored.filter((p) => !isResolvedStatus(p.status)).length;

  return {
    totalVoices: threadVoices + dbVoices,
    totalLetters: lettersFromThreads + dbLetters,
    totalResolved: resolvedFromThreads + dbResolved,
    unresolvedCount: unresolvedThreads + dbUnresolved,
  };
}

export function neighborhoodHealthScore(unresolvedCount) {
  return Math.max(0, Math.min(100, 100 - unresolvedCount * 2));
}
