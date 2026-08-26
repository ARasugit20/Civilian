import { describe, it, expect } from "vitest";
import {
  FALLBACK_POSTS,
  withDbTimeout,
  resolveFallbackPosts,
  resolveFeedPosts,
} from "../lib/postsFeed";

describe("postsFeed helpers", () => {
  it("returns fallback posts when DB errors or is empty", () => {
    const fromError = resolveFeedPosts({ data: null, error: new Error("timeout"), sort: "new" });
    const fromEmpty = resolveFeedPosts({ data: [], error: null, sort: "new" });
    expect(fromError.length).toBe(FALLBACK_POSTS.length);
    expect(fromEmpty.length).toBe(FALLBACK_POSTS.length);
  });

  it("sorts fallback posts by trending echo count", () => {
    const posts = resolveFallbackPosts({ sort: "trending" });
    expect(posts[0].echo_count).toBeGreaterThanOrEqual(posts[1].echo_count);
  });

  it("filters fallback posts by issue type", () => {
    const posts = resolveFallbackPosts({ sort: "new", filterType: "street_lighting" });
    expect(posts.every((p) => p.issue_type === "street_lighting")).toBe(true);
    expect(posts.length).toBeGreaterThan(0);
  });

  it("returns empty list for user-specific fallback queries", () => {
    expect(resolveFallbackPosts({ userId: "user-123" })).toEqual([]);
  });

  it("withDbTimeout rejects stalled promises", async () => {
    await expect(withDbTimeout(() => new Promise(() => {}), 20, "test query")).rejects.toThrow(/timed out/i);
  });
});
