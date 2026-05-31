import { describe, it, expect, vi } from "vitest";
import { recordEcho } from "../lib/echoService";
import { getEchoActorId } from "../lib/echoIdentity";

function mockInsforge({ insertError = null, echoCount = 5 } = {}) {
  const insert = vi.fn().mockResolvedValue({ error: insertError });
  const select = vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue({ data: { echo_count: echoCount }, error: null }),
    }),
  });
  const update = vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { id: "post-1", echo_count: echoCount + 1 },
          error: null,
        }),
      }),
    }),
  });
  return {
    database: {
      from: vi.fn((table) => {
        if (table === "echoes") return { insert };
        if (table === "posts") {
          return { select, update };
        }
        return {};
      }),
    },
    _insert: insert,
  };
}

describe("recordEcho", () => {
  it("rejects duplicate client flag without incrementing", async () => {
    const insforge = mockInsforge();
    const result = await recordEcho({
      insforge,
      postId: "post-1",
      actorId: "fp_test12345678",
      alreadyEchoed: true,
    });
    expect(result.ok).toBe(false);
    expect(result.status).toBe(400);
    expect(insforge._insert).not.toHaveBeenCalled();
  });

  it("increments echo_count once when echo row is new", async () => {
    const insforge = mockInsforge({ echoCount: 10 });
    const result = await recordEcho({
      insforge,
      postId: "post-1",
      actorId: "fp_test12345678",
      alreadyEchoed: false,
    });
    expect(result.ok).toBe(true);
    expect(result.echo_count).toBe(11);
    expect(insforge._insert).toHaveBeenCalledWith([
      { post_id: "post-1", user_id: "fp_test12345678" },
    ]);
  });

  it("blocks second echo from same fingerprint via unique constraint", async () => {
    const insforge = mockInsforge({
      insertError: { code: "23505", message: "duplicate key value violates unique constraint" },
    });
    const result = await recordEcho({
      insforge,
      postId: "post-1",
      actorId: "fp_test12345678",
      alreadyEchoed: false,
    });
    expect(result.ok).toBe(false);
    expect(result.duplicate).toBe(true);
  });
});

describe("getEchoActorId", () => {
  it("prefers signed-in user id over fingerprint header", () => {
    const req = { headers: { "x-civilian-fingerprint": "fp_abc12345678901" } };
    expect(getEchoActorId(req, "google-user-1")).toBe("google-user-1");
  });

  it("uses fingerprint header for anonymous sessions", () => {
    const req = { headers: { "x-civilian-fingerprint": "fp_abc12345678901" } };
    expect(getEchoActorId(req, null)).toBe("fp_abc12345678901");
  });
});
