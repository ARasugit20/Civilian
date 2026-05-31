import Anthropic from "@anthropic-ai/sdk";
import {
  moderationFailOpen,
  parseModerationResponse,
  prepareModerationInput,
} from "../../lib/moderation";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { complaint } = req.body;
  const prepared = prepareModerationInput(complaint);
  if (prepared.skip) {
    return res.status(200).json(prepared.result);
  }

  try {
    const result = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 100,
      messages: [{ role: "user", content: prepared.prompt }],
    });

    const text = result.content[0].text;
    return res.status(200).json(parseModerationResponse(text));
  } catch {
    return res.status(200).json(moderationFailOpen("API error — defaulting to allowed"));
  }
}
