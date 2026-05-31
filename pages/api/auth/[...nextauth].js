import { handlers } from "../../../lib/auth";

async function toWebResponse(req, res) {
  const proto = String(req.headers["x-forwarded-proto"] || "http").split(",")[0].trim();
  const host = req.headers.host;
  const url = `${proto}://${host}${req.url}`;

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value == null) continue;
    if (Array.isArray(value)) value.forEach((v) => headers.append(key, v));
    else headers.set(key, value);
  }

  const init = { method: req.method, headers };
  if (req.method && !["GET", "HEAD"].includes(req.method)) {
    init.body = typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? {});
  }

  const request = new Request(url, init);
  const handler = req.method === "POST" ? handlers.POST : handlers.GET;
  const response = await handler(request);

  res.status(response.status);
  if (typeof response.headers.getSetCookie === "function") {
    for (const cookie of response.headers.getSetCookie()) {
      res.appendHeader("set-cookie", cookie);
    }
  } else {
    response.headers.forEach((value, key) => res.setHeader(key, value));
  }

  const body = await response.text();
  if (body) res.send(body);
  else res.end();
}

export default async function authRoute(req, res) {
  try {
    await toWebResponse(req, res);
  } catch (err) {
    console.error("NextAuth route error:", err);
    res.status(500).json({ error: "auth_error" });
  }
}
