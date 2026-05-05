import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { RepsPanel } from "@/components/reps/reps-panel";

vi.mock("@/hooks/useRepVotes", () => ({
  useRepVotes: () => ({
    status: "ready" as const,
    message: undefined,
    cards: [
      {
        rep: {
          id: "r1",
          name: "Sen. Jane Doe",
          role: "senator",
          party: "D",
          state: "NY",
          district: null,
          contact: { phone: "202-555-0101", email: "jane@example.com", websiteUrl: null },
          verified: true,
        },
        status: "YEA" as const,
        alignmentPercent: 60,
        govtrackVoteLink: "https://www.govtrack.us/congress/votes/119-2026/h155",
        lastUpdatedLabel: "Last updated 4h ago",
        historyCount: 3,
      },
    ],
  }),
}));

describe("RepsPanel", () => {
  it("renders a rep card with stance and actions", () => {
    render(<RepsPanel govtrackBillId={430139} issue="housing" />);
    expect(screen.getByText(/Sen\. Jane Doe/i)).toBeInTheDocument();
    expect(screen.getAllByText("YEA").length).toBeGreaterThan(0);
    expect(screen.getByText("CALL")).toBeInTheDocument();
    expect(screen.getByText("EMAIL")).toBeInTheDocument();
    expect(screen.getByText("GOVTRACK")).toBeInTheDocument();
  });
});

