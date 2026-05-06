export type VoteInput = {
  id: string;
  billNumber: string;
  title: string;
  description?: string;
  date: string;
  repVote: "YES" | "NO" | "ABSTAIN" | string;
  userPosition: "Support" | "Oppose" | "Neutral" | string;
  issueCategory: string;
  newsArticleId?: string | null;
};

export type EnhancedDemoVote = VoteInput & {
  voteStats: {
    yesCount: number;
    noCount: number;
    abstainCount: number;
    totalVoters: number;
  };
  bill: {
    impact: string;
  };
  /** Optional helper link; used by cards for “learn more” affordances. */
  billUrl?: string | null;
};

function stableHashInt(input: string): number {
  // Tiny deterministic hash for demo stats.
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/**
 * Demo-only vote enrichment used by the reps UI to render plausible aggregates.
 * When we switch to live vote rollups, replace this with real counts.
 */
export function enrichDemoVote(vote: VoteInput): EnhancedDemoVote {
  const h = stableHashInt(vote.id);
  const total = 420 + (h % 60); // 420–479 voters
  const yes = 180 + (h % 120); // 180–299
  const no = 120 + (h % 110); // 120–229
  const abstain = Math.max(0, total - yes - no);

  return {
    ...vote,
    billUrl: null,
    bill: {
      impact:
        vote.description?.trim() ||
        "Impact summary coming soon. This preview is illustrative until we wire the full bill metadata.",
    },
    voteStats: {
      yesCount: yes,
      noCount: no,
      abstainCount: abstain,
      totalVoters: total,
    },
  };
}

