"use client";

import { useEffect, useRef, useState } from "react";
import type { BriefingContent } from "@/lib/news/briefing";
import { parseBriefingJsonComplete, parsePartialBriefingJson } from "@/lib/news/parse-partial-briefing";
import { cn } from "@/lib/utils";

/** Parse JSON from a fetch body; tolerate BOM / leading junk / outer wrapper around `{...}`. */
function tryParseResponseJson(raw: string): unknown | null {
  const s = raw.trim().replace(/^\uFEFF/, "");
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

function BriefingSections({
  briefing,
  animateKeys,
}: {
  briefing: Partial<BriefingContent>;
  animateKeys?: boolean;
}) {
  const wrap = (idx: number, label: string, body: React.ReactNode) =>
    body ? (
      <section
        key={label}
        className={cn(
          animateKeys && "animate-in fade-in slide-in-from-bottom-1 duration-500",
        )}
        style={animateKeys ? { animationDelay: `${idx * 90}ms` } : undefined}
      >
        <h3 className="font-serif text-sm font-medium text-plum-700">{label}</h3>
        <div className="mt-2">{body}</div>
      </section>
    ) : null;

  return (
    <div className="space-y-6">
      {wrap(
        0,
        "Background",
        briefing.background ? (
          <p className="text-sm leading-relaxed text-ink">{briefing.background}</p>
        ) : null,
      )}
      {wrap(
        1,
        "Key players",
        briefing.keyPlayers && briefing.keyPlayers.length > 0 ? (
          <ul className="space-y-2 text-sm text-ink">
            {briefing.keyPlayers.map((p, i) => (
              <li key={`${p.name}-${i}`}>
                <span className="font-medium">{p.name}</span>
                {p.role ? <span className="text-ink-muted"> — {p.role}</span> : null}
              </li>
            ))}
          </ul>
        ) : null,
      )}
      {wrap(
        2,
        "Timeline",
        briefing.timeline && briefing.timeline.length > 0 ? (
          <ul className="space-y-2 text-sm text-ink">
            {briefing.timeline.map((t, i) => (
              <li key={`${t.date}-${i}`}>
                <span className="font-medium text-plum-700">{t.date}</span>
                {t.event ? <span> — {t.event}</span> : null}
              </li>
            ))}
          </ul>
        ) : null,
      )}
      {wrap(
        3,
        "What's at stake",
        briefing.whatsAtStake ? (
          <p className="text-sm leading-relaxed text-ink">{briefing.whatsAtStake}</p>
        ) : null,
      )}
    </div>
  );
}

function StreamingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-3 w-24 animate-pulse rounded-full bg-plum-100" />
          <div className="h-3 w-full animate-pulse rounded-full bg-parchment-100" />
          <div className="h-3 w-full max-w-md animate-pulse rounded-full bg-parchment-100" />
        </div>
      ))}
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

  const showSkeleton =
    !display && (phase === "loading" || (phase === "streaming" && !hasPartial));

  return (
    <div>
      {display ? <BriefingSections briefing={display} /> : null}
      {showSkeleton ? <StreamingSkeleton /> : null}
      {!display && hasPartial ? <BriefingSections briefing={partial} animateKeys /> : null}
      {phase === "error" || errorMessage ? (
        <p className="text-sm text-peach-600">{errorMessage ?? "Unable to load briefing."}</p>
      ) : null}
    </div>
  );
}
