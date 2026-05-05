import { describe, expect, it } from "vitest";
import { computeAlignmentPercent } from "@/hooks/useRepAlignment";

describe("computeAlignmentPercent", () => {
  it("returns null for empty history", () => {
    expect(computeAlignmentPercent({ userPosition: "YEA", history: [] })).toBeNull();
  });

  it("computes aligned percent over yea/nay votes", () => {
    const percent = computeAlignmentPercent({
      userPosition: "YEA",
      history: [{ status: "YEA" }, { status: "NAY" }, { status: "YEA" }],
    });
    expect(percent).toBe(67);
  });
});

