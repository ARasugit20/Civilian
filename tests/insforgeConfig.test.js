import { describe, it, expect, afterEach } from "vitest";
import { isInsforgeConfigured } from "../lib/insforgeEnv";

describe("isInsforgeConfigured", () => {
  const origBase = process.env.NEXT_PUBLIC_INSFORGE_BASE_URL;
  const origKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

  afterEach(() => {
    if (origBase === undefined) delete process.env.NEXT_PUBLIC_INSFORGE_BASE_URL;
    else process.env.NEXT_PUBLIC_INSFORGE_BASE_URL = origBase;
    if (origKey === undefined) delete process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;
    else process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY = origKey;
  });

  it("returns false when either InsForge env var is missing", () => {
    delete process.env.NEXT_PUBLIC_INSFORGE_BASE_URL;
    delete process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;
    expect(isInsforgeConfigured()).toBe(false);

    process.env.NEXT_PUBLIC_INSFORGE_BASE_URL = "https://example.insforge.app";
    expect(isInsforgeConfigured()).toBe(false);
  });

  it("returns true when both vars are non-empty", () => {
    process.env.NEXT_PUBLIC_INSFORGE_BASE_URL = "https://example.insforge.app";
    process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY = "anon-key";
    expect(isInsforgeConfigured()).toBe(true);
  });
});
