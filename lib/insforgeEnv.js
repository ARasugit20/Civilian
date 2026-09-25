export function isInsforgeConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_INSFORGE_BASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY?.trim()
  );
}

export function insforgeHostFromEnv() {
  const raw = process.env.NEXT_PUBLIC_INSFORGE_BASE_URL;
  if (!raw) return null;
  try {
    return new URL(raw).host;
  } catch {
    return null;
  }
}
