import { insforge } from "../../lib/insforge";
import { isInsforgeConfigured, insforgeHostFromEnv } from "../../lib/insforgeEnv";
import { withDbTimeout, DB_READ_TIMEOUT_MS } from "../../lib/postsFeed";

function healthPayloadVerbose() {
  return process.env.NODE_ENV !== "production" || process.env.HEALTH_VERBOSE === "1";
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const verbose = healthPayloadVerbose();
  const baseUrlSet = Boolean(process.env.NEXT_PUBLIC_INSFORGE_BASE_URL?.trim());
  const anonKeySet = Boolean(process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY?.trim());
  const configured = isInsforgeConfigured();

  const payload = {
    ok: false,
    insforge: {
      baseUrlConfigured: baseUrlSet,
      anonKeyConfigured: anonKeySet,
      host: insforgeHostFromEnv(),
    },
    postsRead: { ok: false, error: null },
  };

  if (!configured) {
    payload.postsRead.error =
      "InsForge env vars missing (NEXT_PUBLIC_INSFORGE_BASE_URL and/or NEXT_PUBLIC_INSFORGE_ANON_KEY)";
    return res.status(503).json(verbose ? payload : { ok: false });
  }

  try {
    const { data, error } = await withDbTimeout(
      () => insforge.database.from("posts").select("id").limit(1),
      DB_READ_TIMEOUT_MS,
      "health posts read"
    );
    if (error) {
      payload.postsRead.error = error.message || String(error);
      return res.status(503).json(verbose ? payload : { ok: false });
    }
    payload.postsRead.ok = true;
    payload.postsRead.sampleCount = Array.isArray(data) ? data.length : 0;
    payload.ok = true;
    return res.status(200).json(verbose ? payload : { ok: true });
  } catch (err) {
    payload.postsRead.error = err.message || String(err);
    return res.status(503).json(verbose ? payload : { ok: false });
  }
}
