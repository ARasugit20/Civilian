import { describe, it, expect } from "vitest";
import { computeHomeStats } from "../lib/homeStats";

describe("computeHomeStats", () => {
  it("counts only posts with formal_request as letters sent", () => {
    const stats = computeHomeStats([
      { id: "1", complaint: "Pothole on Main St", formal_request: "", echo_count: 2, status: "pending" },
      { id: "2", complaint: "Broken light", formal_request: "Dear Director...", echo_count: 1, status: "pending" },
      { id: "demo-1", complaint: "seed", formal_request: "letter", echo_count: 99, status: "pending" },
    ]);
    expect(stats.totalLetters).toBe(1);
    expect(stats.totalVoices).toBe(3);
  });

  it("returns zeros for empty database", () => {
    expect(computeHomeStats([])).toEqual({
      totalVoices: 0,
      totalLetters: 0,
      totalResolved: 0,
      unresolvedCount: 0,
    });
  });
});
