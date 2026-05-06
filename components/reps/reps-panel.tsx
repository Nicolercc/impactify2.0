"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { VoteStatusBadge, type VoteStatus } from "@/components/reps/vote-status-badge";
import { WidgetErrorBoundary } from "@/components/reps/widget-error-boundary";
import { useRepVotes } from "@/hooks/useRepVotes";

function AlignmentBar({ percent }: { percent: number | null }) {
  const v = percent == null ? 0 : Math.max(0, Math.min(100, percent));
  return (
    <div className="mt-2">
      <div className="h-2 w-full rounded-full bg-ink/10 dark:bg-white/10" aria-hidden />
      <div
        className="relative -mt-2 h-2 rounded-full bg-chartreuse-500"
        style={{ width: `${v}%` }}
        aria-label={percent == null ? "Alignment unavailable" : `Alignment ${v}%`}
      />
    </div>
  );
}

function stanceLabel(status: VoteStatus) {
  if (status === "PENDING") return "Vote pending";
  if (status === "ABSTAIN") return "Abstained";
  return status;
}

export function RepsPanel(props: { govtrackBillId: number; issue: string; title?: string }) {
  const { govtrackBillId, issue, title = "Your reps" } = props;
  const state = useRepVotes({ govtrackBillId, issue });

  return (
    <WidgetErrorBoundary>
      <aside
        className={cn(
          "rounded-2xl border border-border/60 bg-white p-4 shadow-sm",
          "dark:bg-[#0E0A14] dark:text-[#F4EFE3] dark:border-[rgba(244,239,227,0.10)]",
        )}
        aria-label="Representatives voting panel"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-ink dark:text-[#F4EFE3]">{title}</div>
            <div className="mt-1 text-xs text-ink-muted dark:text-[#d4c9bc]">
              Votes from GovTrack ·{" "}
              {state.status === "loading" ? "Loading…" : state.status === "unavailable" ? "Data unavailable" : "Updated"}
            </div>
          </div>

          <div className="text-xs text-ink-muted dark:text-[#d4c9bc]">{issue}</div>
        </div>

        <div className="mt-4 space-y-3">
          {state.cards.length === 0 ? (
            <div className="rounded-xl border border-border/60 bg-parchment-100 p-3 text-sm text-ink-muted dark:bg-white/5 dark:text-[#d4c9bc]">
              {state.status === "unavailable" ? state.message : "Loading…"}
            </div>
          ) : (
            state.cards.slice(0, 5).map((c) => {
              const hasPhone = Boolean(c.rep.contact.phone);
              const hasEmail = Boolean(c.rep.contact.email);
              const govtrackHref = c.govtrackVoteLink ?? `https://www.govtrack.us/`;

              return (
                <div
                  key={c.rep.id}
                  className={cn(
                    "rounded-xl border border-border/60 bg-white p-3",
                    "dark:bg-white/5 dark:border-white/10",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-ink dark:text-[#F4EFE3]">
                        {c.rep.name}
                      </div>
                      <div className="mt-0.5 text-xs text-ink-muted dark:text-[#d4c9bc]">
                        {c.rep.role ?? "Representative"}
                        {c.rep.party ? ` · ${c.rep.party}` : ""}
                        {c.rep.district ? ` · ${c.rep.state}-${c.rep.district}` : ` · ${c.rep.state}`}
                      </div>
                    </div>
                    <VoteStatusBadge status={c.status} />
                  </div>

                  <div className="mt-2 text-xs text-ink-muted dark:text-[#d4c9bc]">{stanceLabel(c.status)}</div>

                  <AlignmentBar percent={c.alignmentPercent} />

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!hasPhone}
                      asChild={hasPhone}
                      className={cn(
                        "h-8 rounded-full px-3 text-xs",
                        "dark:bg-transparent dark:border-white/15 dark:text-[#F4EFE3] dark:hover:bg-white/5",
                      )}
                    >
                      {hasPhone ? (
                        <a href={`tel:${c.rep.contact.phone}`} aria-label={`Call ${c.rep.name}`}>
                          CALL
                        </a>
                      ) : (
                        <span aria-disabled="true">CALL</span>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!hasEmail}
                      asChild={hasEmail}
                      className={cn(
                        "h-8 rounded-full px-3 text-xs",
                        "dark:bg-transparent dark:border-white/15 dark:text-[#F4EFE3] dark:hover:bg-white/5",
                      )}
                    >
                      {hasEmail ? (
                        <a href={`mailto:${c.rep.contact.email}`} aria-label={`Email ${c.rep.name}`}>
                          EMAIL
                        </a>
                      ) : (
                        <span aria-disabled="true">EMAIL</span>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className={cn(
                        "h-8 rounded-full px-3 text-xs",
                        "dark:bg-transparent dark:border-white/15 dark:text-[#F4EFE3] dark:hover:bg-white/5",
                      )}
                    >
                      <Link href={govtrackHref} target="_blank" rel="noopener noreferrer">
                        GOVTRACK
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {state.message ? (
          <div className="mt-3 text-xs text-ink-muted dark:text-[#9d8f7f]">{state.message}</div>
        ) : null}
      </aside>
    </WidgetErrorBoundary>
  );
}

