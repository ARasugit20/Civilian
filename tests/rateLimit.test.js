import { describe, it, expect } from "vitest";
import { rateLimit } from "../lib/rateLimit";

describe("rateLimit", () => {
  it("allows requests under the cap", () => {
    const key = `test-${Date.now()}`;
    const first = rateLimit(key, { max: 3, windowMs: 60_000 });
    const second = rateLimit(key, { max: 3, windowMs: 60_000 });
    expect(first.limited).toBe(false);
    expect(second.limited).toBe(false);
  });

  it("blocks after max requests in window", () => {
    const key = `test-block-${Date.now()}`;
    rateLimit(key, { max: 2, windowMs: 60_000 });
    rateLimit(key, { max: 2, windowMs: 60_000 });
    const third = rateLimit(key, { max: 2, windowMs: 60_000 });
    expect(third.limited).toBe(true);
    expect(third.remaining).toBe(0);
  });
});
