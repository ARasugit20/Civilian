import { describe, it, expect } from "vitest";
import {
  parseModerationResponse,
  prepareModerationInput,
  moderationFailOpen,
} from "../lib/moderation";

describe("moderation intent parsing", () => {
  it("allows respectful civic frustration", () => {
    const result = parseModerationResponse(
      JSON.stringify({
        allowed: true,
        reason: "Describes a legitimate local safety concern.",
      })
    );
    expect(result.allowed).toBe(true);
  });

  it("blocks abusive content when model rejects", () => {
    const result = parseModerationResponse(
      JSON.stringify({
        allowed: false,
        reason: "Contains threats and slurs not appropriate for officials.",
      })
    );
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/threats|slurs|appropriate/i);
  });

  it("fail-opens on malformed JSON (provider outage safe path)", () => {
    const result = parseModerationResponse("not valid json {{{");
    expect(result.allowed).toBe(true);
    expect(result.reason).toMatch(/Parse error|defaulting/i);
  });

  it("skips very short complaints without calling the model", () => {
    const prepared = prepareModerationInput("ok");
    expect(prepared.skip).toBe(true);
    expect(prepared.result.allowed).toBe(true);
  });

  it("builds prompt for real civic complaints", () => {
    const text =
      "The crosswalk at Mill Ave has no lighting and kids almost got hit twice this week.";
    const prepared = prepareModerationInput(text);
    expect(prepared.skip).toBe(false);
    expect(prepared.prompt).toContain(text);
  });

  it("moderationFailOpen always allows", () => {
    expect(moderationFailOpen("API error — defaulting to allowed")).toEqual({
      allowed: true,
      reason: "API error — defaulting to allowed",
    });
  });
});
