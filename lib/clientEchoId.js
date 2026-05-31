const STORAGE_KEY = "civilian_echo_fp";

/** Stable anonymous id for echo deduplication (sent as X-Civilian-Fingerprint). */
export function getOrCreateEchoFingerprint() {
  if (typeof window === "undefined") return "";
  try {
    let fp = localStorage.getItem(STORAGE_KEY);
    if (!fp) {
      const uuid = typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      fp = `fp_${uuid.replace(/-/g, "")}`;
      localStorage.setItem(STORAGE_KEY, fp);
    }
    return fp;
  } catch {
    return "";
  }
}

export function echoFetchHeaders() {
  const fp = getOrCreateEchoFingerprint();
  return fp ? { "X-Civilian-Fingerprint": fp } : {};
}
