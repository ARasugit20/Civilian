import { insforge } from "../../lib/insforge";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, feature } = req.body || {};
  const cleanEmail = String(email || "").trim().slice(0, 320);
  const feat = String(feature || "general").trim().slice(0, 64);

  if (!cleanEmail || !EMAIL_RE.test(cleanEmail)) {
    return res.status(400).json({ error: "invalid_email" });
  }

  try {
    const { error } = await insforge.database.from("waitlist").insert([{ email: cleanEmail, feature: feat }]);
    if (error) {
      const msg = String(error.message || "").toLowerCase();
      if (msg.includes("duplicate") || msg.includes("unique") || error.code === "23505") {
        return res.status(200).json({ success: true });
      }
      console.warn("waitlist insert:", error.message);
      // Table may not exist yet — still acknowledge so signups are not blocked in dev.
      return res.status(200).json({ success: true, persisted: false });
    }
    return res.status(200).json({ success: true, persisted: true });
  } catch (e) {
    console.warn("waitlist:", e?.message || e);
    return res.status(200).json({ success: true, persisted: false });
  }
}
