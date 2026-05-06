"use client";

import { cn } from "@/lib/utils";
import type { BriefingContent } from "@/lib/news/briefing";
import { useBriefingData } from "@/components/news/briefing-store";

type BriefingFocus = "context" | "timeline" | "stakes";

function BriefingSection({
  label,
  idx,
  children,
  animate,
}: {
  label: string;
  idx: number;
  children: React.ReactNode;
  animate?: boolean;
}) {
  if (!children) return null;
  return (
    <section
      className={cn(
        animate &&
          "animate-in fade-in slide-in-from-bottom-2 duration-500 [animation-fill-mode:both]",
      )}
      style={animate ? { animationDelay: `${idx * 120}ms` } : undefined}
    >
      <h3 className="font-serif text-[0.9375rem] font-semibold text-plum-700">{label}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function BriefingSections({
  briefing,
  animateKeys,
  focus,
}: {
  briefing: Partial<BriefingContent>;
  animateKeys?: boolean;
  focus?: BriefingFocus;
}) {
  const showContext = !focus || focus === "context";
  const showTimeline = !focus || focus === "timeline";
  const showStakes = !focus || focus === "stakes";

  return (
    <div className="space-y-8">
      {showContext ? (
        <BriefingSection idx={0} label="Background" animate={animateKeys}>
          {briefing.background ? (
            <p className="text-sm leading-[1.7] text-ink">{briefing.background}</p>
          ) : null}
        </BriefingSection>
      ) : null}

      {showContext ? (
        <BriefingSection idx={1} label="Key players" animate={animateKeys}>
          {briefing.keyPlayers && briefing.keyPlayers.length > 0 ? (
            <ul className="space-y-3 text-ink">
              {briefing.keyPlayers.map((p, i) => (
                <li
                  key={`${p.name}-${i}`}
                  className="border-l-2 border-l-[#d4849a]/60 pl-3 leading-[1.65]"
                >
                  <div className="font-mono text-[0.75rem] font-medium uppercase tracking-[0.08em] text-[#d4849a]">
                    {p.name}
                  </div>
                  {p.role ? (
                    <div className="mt-0.5 font-sans text-sm text-ink-muted">{p.role}</div>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </BriefingSection>
      ) : null}

      {showTimeline ? (
        <BriefingSection idx={2} label="Timeline" animate={animateKeys}>
          {briefing.timeline && briefing.timeline.length > 0 ? (
            <ol className="space-y-3 text-sm text-ink">
              {briefing.timeline.map((t, i) => (
                <li
                  key={`${t.date}-${i}`}
                  className="border-l-2 border-l-[#d4849a]/50 pl-3 leading-[1.65] transition-[border-color] duration-300"
                >
                  <span className="font-semibold text-plum-700">{t.date}</span>
                  {t.event ? <span> — {t.event}</span> : null}
                </li>
              ))}
            </ol>
          ) : null}
        </BriefingSection>
      ) : null}

      {showStakes ? (
        <BriefingSection idx={3} label="What's at stake" animate={animateKeys}>
          {briefing.whatsAtStake ? (
            <p className="rounded-lg border border-chartreuse-300/60 bg-chartreuse-100/40 px-4 py-3 text-sm leading-[1.7] text-ink">
              {briefing.whatsAtStake}
            </p>
          ) : null}
        </BriefingSection>
      ) : null}
    </div>
  );
}

function ThinkingIndicator() {
  return (
    <div className="space-y-4" aria-label="Generating briefing" role="status">
      <div className="flex items-center gap-2.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-chartreuse-500 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-chartreuse-500" />
        </span>
        <span className="font-sans text-[0.7rem] text-ink-muted">Generating briefing…</span>
      </div>

      <div className="space-y-2.5">
        {[100, 92, 85, 78, 92, 70].map((w, i) => (
          <div
            key={i}
            className="h-2.5 animate-pulse rounded-full bg-plum-100/70"
            style={{
              width: `${w}%`,
              animationDelay: `${i * 80}ms`,
              animationDuration: "1.4s",
            }}
          />
        ))}
      </div>

      <div className="space-y-2">
        {["Key players", "Timeline", "What's at stake"].map((label, i) => (
          <div
            key={label}
            className="animate-pulse rounded-lg border border-plum-100/50 p-3"
            style={{ animationDelay: `${(i + 1) * 120}ms`, animationDuration: "1.4s" }}
          >
            <div className="h-2.5 w-24 rounded bg-plum-100/60" />
            <div className="mt-2 h-2.5 w-full rounded bg-plum-100/40" />
            <div className="mt-1.5 h-2.5 w-[75%] rounded bg-plum-100/40" />
          </div>
        ))}
      </div>
    </div>
  );
}

export type BriefingPanelProps = {
  /** Optional: render only one section cluster (used by mobile tabs). */
  focus?: BriefingFocus;
  /** Legacy: pre-fetched briefing from server. If provided, skips context fetch. */
  existingBriefing?: BriefingContent | null;
  relatedCauseSlug?: string | null;
  // These are no longer used (fetch lives in BriefingProvider), kept for
  // backwards compat with ArticleBriefingAside which doesn't use the store.
  articleId?: string;
  articleTitle?: string;
  articleBody?: string;
};

export function BriefingPanel({ focus, existingBriefing }: BriefingPanelProps) {
  const { complete, partial, phase, errorMessage } = useBriefingData();

  const display = existingBriefing ?? complete;
  const hasPartial = !display && Object.values(partial).some((v) =>
    Array.isArray(v) ? v.length > 0 : Boolean(v),
  );
  const showThinking =
    !display && (phase === "loading" || (phase === "streaming" && !hasPartial));

  return (
    <div>
      {display ? <BriefingSections briefing={display} focus={focus} /> : null}
      {showThinking ? <ThinkingIndicator /> : null}
      {!display && hasPartial ? (
        <BriefingSections briefing={partial} animateKeys focus={focus} />
      ) : null}
      {phase === "error" || errorMessage ? (
        <p className="rounded-lg bg-peach-200/30 px-3 py-2 text-sm text-peach-600">
          {errorMessage ?? "Unable to load briefing."}
        </p>
      ) : null}
    </div>
  );
}
