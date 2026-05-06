"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { BriefingContent } from "@/lib/news/briefing";
import {
  parseBriefingJsonComplete,
  parsePartialBriefingJson,
} from "@/lib/news/parse-partial-briefing";

type BriefingPhase = "idle" | "loading" | "streaming" | "error";

export type BriefingState = {
  complete: BriefingContent | null;
  partial: Partial<BriefingContent>;
  phase: BriefingPhase;
  errorMessage: string | null;
};

function tryParseJson(raw: string): unknown | null {
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

const BriefingCtx = createContext<BriefingState | null>(null);

export function useBriefingData(): BriefingState {
  const ctx = useContext(BriefingCtx);
  if (!ctx) throw new Error("useBriefingData must be inside <BriefingProvider>");
  return ctx;
}

export function BriefingProvider({
  articleId,
  articleTitle,
  articleBody,
  existingBriefing,
  children,
}: {
  articleId: string;
  articleTitle: string;
  articleBody: string;
  existingBriefing: BriefingContent | null;
  children: ReactNode;
}) {
  const [complete, setComplete] = useState<BriefingContent | null>(existingBriefing);
  const [partial, setPartial] = useState<Partial<BriefingContent>>({});
  const [phase, setPhase] = useState<BriefingPhase>(existingBriefing ? "idle" : "loading");
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
          body: JSON.stringify({ articleId, title: articleTitle, body: articleBody.slice(0, 1500) }),
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

        const parsed = tryParseJson(rawText);
        if (parsed && typeof parsed === "object") {
          const o = parsed as Record<string, unknown>;
          const b = o.briefing;
          if (b && typeof b === "object") {
            setComplete(b as BriefingContent);
            setPhase("idle");
            return;
          }
          if (typeof o.error === "string") throw new Error(o.error);
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

  return (
    <BriefingCtx.Provider value={{ complete, partial, phase, errorMessage }}>
      {children}
    </BriefingCtx.Provider>
  );
}
