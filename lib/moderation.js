/** Parse Claude moderation JSON; fail-open on malformed output. */
export function parseModerationResponse(text) {
  const cleaned = String(text || "").replace(/```json|```/g, "").trim();
  try {
    const data = JSON.parse(cleaned);
    return { allowed: !!data.allowed, reason: data.reason || "" };
  } catch {
    return { allowed: true, reason: "Parse error — defaulting to allowed" };
  }
}

export function buildModerationPrompt(complaint) {
  return `You are reviewing a message that a citizen wants to submit to their local government on a civic complaints platform.

Read the message and decide: is this appropriate to send to a government official?

Respond with ONLY: {"allowed": true/false, "reason": "one sentence"}

Use your judgment. A good civic complaint is respectful and describes a real problem. Messages that are disrespectful, insulting, abusive, threatening, or have no legitimate civic purpose should not be sent to officials.

Message: "${complaint}"`;
}

export function prepareModerationInput(complaint) {
  const sanitizedComplaint = String(complaint || "").slice(0, 500).trim();
  if (!sanitizedComplaint || sanitizedComplaint.length < 3) {
    return { skip: true, result: { allowed: true, reason: "Too short to evaluate" } };
  }
  return { skip: false, sanitizedComplaint, prompt: buildModerationPrompt(sanitizedComplaint) };
}

/** Fail-open when the moderation provider is down — civic flow must not hard-stop. */
export function moderationFailOpen(reason) {
  return { allowed: true, reason: reason || "API error — defaulting to allowed" };
}
