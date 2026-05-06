"use client";

import { useMemo } from "react";
import type { VoteStatus } from "@/components/reps/vote-status-badge";

export type RepVoteHistoryItem = {
  status: Exclude<VoteStatus, "UNDECIDED">; // only actual actions
};

export type UserIssuePosition = "YEA" | "NAY";

export function computeAlignmentPercent(opts: {
  userPosition: UserIssuePosition;
  history: RepVoteHistoryItem[];
}): number | null {
  const { userPosition, history } = opts;
  if (!history.length) return null;

  const relevant = history.filter((h) => h.status === "YEA" || h.status === "NAY");
  if (!relevant.length) return null;

  const aligned = relevant.filter((h) => h.status === userPosition).length;
  return Math.round((aligned / relevant.length) * 100);
}

export function useRepAlignment(args: {
  userPosition: UserIssuePosition | null;
  history: RepVoteHistoryItem[];
}) {
  return useMemo(() => {
    if (!args.userPosition) return { percent: null as number | null };
    return { percent: computeAlignmentPercent({ userPosition: args.userPosition, history: args.history }) };
  }, [args.history, args.userPosition]);
}

