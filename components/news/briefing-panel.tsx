"use client";

import { useEffect, useRef, useState } from "react";
import type { BriefingContent } from "@/lib/news/briefing";
import { parseBriefingJsonComplete, parsePartialBriefingJson } from "@/lib/news/parse-partial-briefing";
import { cn } from "@/lib/utils";

function tryParseResponseJson(raw: string): unknown | null {
  const s = raw.trim().replace(/^﻿/, "");
  try {
    return JSON.parse(s) as unknown;
  } catch {
    const start = s.indexOf("{");
    const end = s.lastIndexOf("}");
    if (start === -1 || end <= start) return null;
    try {
      return JSON.parse(s.slice(start, end + 1)) as unknown;
    } catch {
      return null;
    }
  }
}

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
      <h3 className="font-serif text-sm font-medium text-plum-700">{label}</h3>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function BriefingSections({
  briefing,
  animateKeys,
}: {
  briefing: Partial<BriefingContent>;
  animateKeys?: boolean;
}) {
  return (
    <div className="space-y-6">
      <BriefingSection idx={0} label="Background" animate={animateKeys}>
        {briefing.background ? (
          <p className="text-sm leading-relaxed text-ink">{briefing.background}</p>
        ) : null}
      </BriefingSection>

      <BriefingSection idx={1} label="Key players" animate={animateKeys}>
        {briefing.keyPlayers && briefing.keyPlayers.length > 0 ? (
          <ul className="space-y-2 text-sm text-ink">
            {briefing.keyPlayers.map((p, i) => (
              <li key={`${p.name}-${i}`}>
                <span className="font-medium">{p.name}</span>
                {p.role ? <span className="text-ink-muted"> — {p.role}</span> : null}
              </li>
            ))}
          </ul>
        ) : null}
      </BriefingSection>

      <BriefingSection idx={2} label="Timeline" animate={animateKeys}>
        {briefing.timeline && briefing.timeline.length > 0 ? (
          <ol className="relative ml-1 space-y-3 border-l border-plum-100 pl-4 text-sm text-ink">
            {briefing.timeline.map((t, i) => (
              <li key={`${t.date}-${i}`} className="relative">
                <span
                  aria-hidden
                  className="absolute -left-[1.1875rem] top-[0.3rem] h-2 w-2 rounded-full border-2 border-plum-300 bg-parchment"
                />
                <span className="font-medium text-plum-700">{t.date}</span>
                {t.event ? <span> — {t.event}</span> : null}
              </li>
            ))}
          </ol>
        ) : null}
      </BriefingSection>

      <BriefingSection idx={3} label="What's at stake" animate={animateKeys}>
        {briefing.whatsAtStake ? (
          <p className="rounded-lg border border-chartreuse-300/60 bg-chartreuse-100/40 px-4 py-3 text-sm leading-relaxed text-ink">
            {briefing.whatsAtStake}
          </p>
        ) : null}
      </BriefingSection>
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
  articleId: string;
  articleTitle: string;
  articleBody: string;
  existingBriefing: BriefingContent | null;
  relatedCauseSlug: string | null;
};

export function BriefingPanel({
  articleId,
  articleTitle,
  articleBody,
  existingBriefing,
}: BriefingPanelProps) {
  const [partial, setPartial] = useState<Partial<BriefingContent>>({});
  const [complete, setComplete] = useState<BriefingContent | null>(null);
  const [phase, setPhase] = useState<"idle" | "loading" | "streaming" | "error">(
    existingBriefing ? "idle" : "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const bufferRef = useRef("");

  useEffect(() => {
    if (existingBriefing) return;

    const ac = new AbortController();

    async function run() {
      setPhase("loading");
      setErrorMessage(null);
      bufferRef.current = "";
      setPartial({});

      try {
        const res = await fetch("/api/briefings/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            articleId,
            title: articleTitle,
            body: articleBody,
          }),
          signal: ac.signal,
        });

        if (res.status === 429) {
          await res.text().catch(() => {});
          setErrorMessage("Too many requests, please wait a moment.");
          setPhase("error");
          return;
        }

        const rawText = await res.text();

        if (!res.ok) {
          let msg = `Briefing request failed (${res.status})`;
          try {
            const errJson = JSON.parse(rawText) as { error?: string };
            if (typeof errJson?.error === "string") msg = errJson.error;
          } catch {
            const t = rawText.trim();
            if (t) msg = t.slice(0, 280);
          }
          throw new Error(msg);
        }

        const parsedBody = tryParseResponseJson(rawText);

        if (parsedBody && typeof parsedBody === "object") {
          const o = parsedBody as Record<string, unknown>;
          const b = o.briefing;
          if (b && typeof b === "object") {
            setComplete(b as BriefingContent);
            setPhase("idle");
            return;
          }
          if (typeof o.error === "string") {
            throw new Error(o.error);
          }
          setErrorMessage("Unexpected response from server.");
          setPhase("error");
          return;
        }

        bufferRef.current = rawText;
        setPhase("streaming");
        setPartial(parsePartialBriefingJson(bufferRef.current));
        const final = parseBriefingJsonComplete(bufferRef.current);
        if (final) {
          setComplete(final);
          setPartial({});
          setPhase("idle");
        } else {
          setErrorMessage("Could not parse the AI briefing. Please try again later.");
          setPhase("error");
        }
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setPhase("error");
        setErrorMessage(e instanceof Error ? e.message : "Something went wrong.");
      }
    }

    void run();
    return () => ac.abort();
  }, [articleBody, articleId, articleTitle, existingBriefing]);

  const display = existingBriefing ?? complete;
  const hasPartial = !display && Object.values(partial).some((v) =>
    Array.isArray(v) ? v.length > 0 : Boolean(v),
  );

  const showThinking =
    !display && (phase === "loading" || (phase === "streaming" && !hasPartial));

  return (
    <div>
      {display ? <BriefingSections briefing={display} /> : null}
      {showThinking ? <ThinkingIndicator /> : null}
      {!display && hasPartial ? <BriefingSections briefing={partial} animateKeys /> : null}
      {phase === "error" || errorMessage ? (
        <p className="rounded-lg bg-peach-200/30 px-3 py-2 text-sm text-peach-600">
          {errorMessage ?? "Unable to load briefing."}
        </p>
      ) : null}
    </div>
  );
}
