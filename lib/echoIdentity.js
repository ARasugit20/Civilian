import crypto from "crypto";
import { getClientIp } from "./rateLimit";

const FP_HEADER = "x-civilian-fingerprint";

export function getEchoActorId(req, sessionUserId) {
  if (sessionUserId) return String(sessionUserId);
  const header = req.headers[FP_HEADER] || req.headers[FP_HEADER.toUpperCase()];
  if (typeof header === "string" && /^fp_[a-zA-Z0-9_-]{8,120}$/.test(header)) {
    return header;
  }
  const ip = getClientIp(req);
  const ua = String(req.headers["user-agent"] || "").slice(0, 200);
  const hash = crypto.createHash("sha256").update(`${ip}|${ua}`).digest("hex").slice(0, 32);
  return `ip_${hash}`;
}

export { FP_HEADER };
