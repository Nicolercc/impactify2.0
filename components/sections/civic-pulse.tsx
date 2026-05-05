"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Briefcase, HeartPulse, Home, Leaf, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { GrainOverlay } from "@/components/decorative/grain-overlay";

type CauseId = "housing" | "climate" | "democracy" | "health" | "labor";

const CAUSES: { id: CauseId; label: string; color: string; x: number; y: number }[] = [
  { id: "housing", label: "Housing", color: "#E07856", x: 0.26, y: 0.28 },
  { id: "climate", label: "Climate", color: "#D4F25A", x: 0.74, y: 0.22 },
  { id: "democracy", label: "Democracy", color: "#B888E0", x: 0.5, y: 0.74 },
  { id: "health", label: "Health", color: "#7DD8C5", x: 0.22, y: 0.68 },
  { id: "labor", label: "Labor", color: "#F2B05A", x: 0.78, y: 0.62 },
];

const CAUSE_ICONS: Record<CauseId, React.ComponentType<{ className?: string }>> = {
  housing: Home,
  climate: Leaf,
  democracy: Landmark,
  health: HeartPulse,
  labor: Briefcase,
};

// MVP-aligned signal types only (truthful, shippable today).
const PULSE_EVENTS: { type: "vote" | "bill" | "briefing" | "article"; label: string; cause: CauseId }[] = [
  { type: "vote", label: "YEA · S.1234", cause: "climate" },
  { type: "bill", label: "H.R. 891 filed", cause: "housing" },
  { type: "briefing", label: "Clarity report", cause: "climate" },
  { type: "article", label: "Guardian · housing", cause: "housing" },
  { type: "article", label: "Guardian · climate", cause: "climate" },
  { type: "vote", label: "NAY · H.R. 700", cause: "labor" },
];

type Ping = {
  id: string;
  cause: CauseId;
  createdAt: number;
  eventLabel: string;
};

type SignalKind = "VOTE" | "BILL" | "BRIEFING" | "ARTICLE";

function signalKindFromEventLabel(label: string): SignalKind {
  const k = label.split("·")[0]?.trim().toUpperCase();
  if (k === "VOTE") return "VOTE";
  if (k === "BILL") return "BILL";
  if (k === "BRIEFING") return "BRIEFING";
  if (k === "ARTICLE") return "ARTICLE";
  return "ARTICLE";
}

function signalSource(kind: SignalKind): "ProPublica" | "Guardian" | "Impactify" {
  if (kind === "VOTE" || kind === "BILL") return "ProPublica";
  if (kind === "ARTICLE") return "Guardian";
  return "Impactify";
}

function signalHref(kind: SignalKind): string {
  if (kind === "VOTE" || kind === "BILL") return "/reps";
  return "/news";
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function CornerBrackets() {
  // 1000x1000 viewBox; brackets are 56px in from corners.
  const s = 42;
  const m = 44;
  const stroke = "rgba(212, 242, 90, 0.65)";
  return (
    <g stroke={stroke} strokeWidth="2" fill="none" opacity="0.9">
      {/* TL */}
      <path d={`M${m} ${m + s} V${m} H${m + s}`} />
      {/* TR */}
      <path d={`M${1000 - m - s} ${m} H${1000 - m} V${m + s}`} />
      {/* BL */}
      <path d={`M${m} ${1000 - m - s} V${1000 - m} H${m + s}`} />
      {/* BR */}
      <path d={`M${1000 - m - s} ${1000 - m} H${1000 - m} V${1000 - m - s}`} />
    </g>
  );
}

export function CivicPulse() {
  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  }, []);

  const [pings, setPings] = useState<Ping[]>([]);
  const timeoutsRef = useRef<Record<string, number>>({});

  const [stream, setStream] = useState<{ label: string; cause: CauseId }[]>(() => []);

  const pingIntervalRef = useRef<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(true);

  const pos = useMemo(() => {
    const center = { x: 500, y: 500 };
    const nodes = Object.fromEntries(
      CAUSES.map((c) => [c.id, { x: c.x * 1000, y: c.y * 1000, color: c.color, label: c.label }]),
    ) as Record<CauseId, { x: number; y: number; color: string; label: string }>;
    return { center, nodes };
  }, []);

  function clearAllTimers() {
    if (pingIntervalRef.current) window.clearInterval(pingIntervalRef.current);
    pingIntervalRef.current = null;
    for (const id of Object.values(timeoutsRef.current)) window.clearTimeout(id);
    timeoutsRef.current = {};
  }

  useEffect(() => {
    // Offscreen suspension: stop all work when section isn't visible.
    const el = document.getElementById("civic-pulse");
    if (!el || !("IntersectionObserver" in window)) return;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        setInView(entry.isIntersecting && entry.intersectionRatio > 0.05);
      },
      { root: null, threshold: [0, 0.05, 0.15] },
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    clearAllTimers();
    setPings([]);

    // Motion governance:
    // - reduced motion: fully static
    // - paused: fully static
    // - offscreen: no background work
    if (reducedMotion || paused || !inView) return;

    pingIntervalRef.current = window.setInterval(() => {
      const e = PULSE_EVENTS[randInt(0, PULSE_EVENTS.length - 1)]!;
      const pingId = uid();
      const now = Date.now();
      const ping: Ping = { id: pingId, cause: e.cause, createdAt: now, eventLabel: `${e.type.toUpperCase()} · ${e.label}` };

      // Center stays quiet; right rail is the proof. We still keep a single subtle ping
      // at a low frequency to preserve “alive” without distraction.
      setPings([ping]);

      setStream((prev) => {
        const next = [{ label: ping.eventLabel, cause: ping.cause }, ...prev].slice(0, 4);
        return next;
      });

      timeoutsRef.current[pingId] = window.setTimeout(() => {
        setPings([]);
        delete timeoutsRef.current[pingId];
      }, 1800);
    }, 8000);

    return () => clearAllTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, paused, inView]);

  const latestSignals = (stream.length
    ? stream
    : [
        { label: "BRIEFING · Clarity report", cause: "climate" as const },
        { label: "VOTE · YEA · S.1234", cause: "climate" as const },
        { label: "BILL · H.R. 891 filed", cause: "housing" as const },
        { label: "ARTICLE · Guardian · housing", cause: "housing" as const },
      ]).slice(0, 3);

  const activeCause = !reducedMotion && pings.length ? pings[0]!.cause : null;

  function signalTitle(label: string) {
    // Prefer a readable, non-telemetry title.
    // Examples:
    // "ARTICLE · Guardian · housing" -> "Guardian: housing"
    // "BILL · H.R. 891 filed" -> "H.R. 891 filed"
    const parts = label.split("·").map((p) => p.trim()).filter(Boolean);
    if (parts.length <= 1) return label;
    const kind = parts[0]!;
    const rest = parts.slice(1).join(" · ");
    if (kind.toUpperCase() === "ARTICLE") return rest.replace(/^Guardian\s·\s/i, "Guardian: ");
    return rest;
  }

  return (
    <section
      id="civic-pulse"
      className={cn(
        "dark relative overflow-hidden",
        "bg-[linear-gradient(to_bottom,rgba(74,31,79,0.20),rgba(14,10,20,1))]",
        "before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(900px_500px_at_50%_35%,rgba(212,242,90,0.10),transparent_65%)] before:opacity-90",
        "text-foreground",
        "py-18 md:py-22",
      )}
      aria-label="Civic Pulse"
    >
      <GrainOverlay className="opacity-[0.02]" />

      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-[11px] font-semibold tracking-[0.2em] text-white">
            §05 · CIVIC PULSE
          </p>
          <h2 className="mt-4 font-serif text-[34px] font-semibold leading-[1.05] tracking-[-0.03em] text-foreground md:text-[44px] lg:text-[52px]">
            Everything connects to{" "}
            <em className="font-serif italic text-[#D4F25A]">you</em>.
          </h2>
          <p className="mt-4 text-[1.05rem] leading-relaxed text-white md:text-[1.125rem]">
            A preview visualization of how votes, bills, and briefings relate to the issues you
            care about.
          </p>
        </div>

        <div className="mt-10 space-y-8">
          {/* Row 1 (bento): dominant visualization + proof rail */}
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(260px,1.2fr)] lg:gap-8">
            <div className="flex justify-center">
              <div className="w-full max-w-[1120px]">
                <div
                  className={cn(
                    // Square on mobile/tablet for legibility; wide/rectangular on desktop to avoid “humongous” feel.
                    "relative w-full overflow-hidden rounded-3xl",
                    "aspect-square md:aspect-4/3 lg:aspect-video",
                    "border border-[rgba(244,239,227,0.18)] bg-[rgba(14,10,20,0.72)] backdrop-blur",
                    "shadow-[0_28px_90px_rgba(0,0,0,0.45)]",
                  )}
                >
              <svg
                viewBox="0 0 1000 1000"
                className="absolute inset-0 h-full w-full"
                aria-hidden="true"
              >
                {/* Concentric rings */}
                {[160, 260, 360, 460].map((r) => (
                  <circle
                    key={r}
                    cx="500"
                    cy="500"
                    r={r}
                    fill="none"
                    stroke="rgba(244, 239, 227, 0.07)"
                    strokeWidth="1"
                    strokeDasharray="5 8"
                  />
                ))}

                {/* Crosshair */}
                <line x1="500" y1="90" x2="500" y2="910" stroke="rgba(244, 239, 227, 0.06)" strokeWidth="1" />
                <line x1="90" y1="500" x2="910" y2="500" stroke="rgba(244, 239, 227, 0.06)" strokeWidth="1" />

                {/* Node connectors */}
                {CAUSES.map((c) => (
                  <line
                    key={c.id}
                    x1={pos.nodes[c.id].x}
                    y1={pos.nodes[c.id].y}
                    x2={pos.center.x}
                    y2={pos.center.y}
                    stroke="rgba(244, 239, 227, 0.10)"
                    strokeWidth="1"
                    strokeDasharray="3 8"
                  />
                ))}

                {/* Corner brackets */}
                <CornerBrackets />

                {/* Center hub */}
                <circle cx="500" cy="500" r="44" fill="rgba(212, 242, 90, 0.06)" stroke="rgba(212, 242, 90, 0.85)" strokeWidth="2" />
                <circle cx="500" cy="500" r="8" fill="rgba(212, 242, 90, 1)" />

                {/* YOU label */}
                <text x="500" y="512" textAnchor="middle" fontFamily="var(--font-dm-mono)" fontSize="13" fill="rgba(255,255,255,0.98)" letterSpacing="0.18em">
                  YOU
                </text>

                {/* Cause nodes */}
                {CAUSES.map((c) => (
                  <g key={`node-${c.id}`}>
                    <circle cx={pos.nodes[c.id].x} cy={pos.nodes[c.id].y} r="14" fill={c.color} opacity="0.55" />
                    <circle cx={pos.nodes[c.id].x} cy={pos.nodes[c.id].y} r="22" fill="none" stroke="rgba(244,239,227,0.10)" strokeWidth="1" />
                  </g>
                ))}

                {/* Pings */}
                {!reducedMotion
                  ? pings.map((p) => {
                      const n = pos.nodes[p.cause];
                      const path = `M ${n.x} ${n.y} L 500 500`;
                      return (
                        <g key={p.id}>
                          {/* Ripple */}
                          <circle cx={n.x} cy={n.y} r="14" fill="none" stroke={n.color} strokeWidth="2" opacity="0.75">
                            <animate attributeName="r" from="14" to="36" dur="0.9s" fill="freeze" />
                            <animate attributeName="opacity" from="0.8" to="0" dur="0.9s" fill="freeze" />
                          </circle>
                          {/* Traveling dot */}
                          <circle r="4.5" fill="rgba(244,239,227,0.90)">
                            <animateMotion path={path} dur="1.6s" fill="freeze" />
                            <animate attributeName="opacity" from="1" to="0" begin="1.45s" dur="0.15s" fill="freeze" />
                          </circle>
                        </g>
                      );
                    })
                  : null}
              </svg>

              {/* HUD overlays */}
              <div className="absolute left-5 top-5 rounded-xl border border-white/10 bg-black/75 px-4 py-3 backdrop-blur">
                <div className="font-mono text-[11px] font-semibold tracking-[0.12em] text-white">
                  CIVIC PULSE
                </div>
                    <div className="mt-1 inline-flex items-center gap-2">
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 font-mono text-[10px] font-semibold tracking-[0.14em] text-white">
                        PREVIEW
                      </span>
                      <span className="font-mono text-[11px] font-semibold tracking-[0.12em] text-white/90">
                        Updated hourly · Sources: ProPublica, Guardian, Impactify
                      </span>
                </div>
              </div>

              <div className="absolute right-5 top-5 rounded-xl border border-white/10 bg-black/75 px-4 py-3 text-right backdrop-blur">
                    <div className="font-mono text-[11px] font-semibold tracking-[0.12em] text-white">
                      SIGNALS (SAMPLE)
                </div>
                    <div className="mt-1 font-mono text-[12px] font-semibold tracking-[0.12em] text-white/90">
                      ProPublica · Guardian · Impactify
                </div>
              </div>

              {/* Cause labels */}
              <div className="absolute inset-0 pointer-events-none">
                {CAUSES.map((c) => {
                  const n = pos.nodes[c.id];
                  const Icon = CAUSE_ICONS[c.id];
                  const isActive = activeCause === c.id;
                  return (
                    <div
                      key={`label-${c.id}`}
                      className="absolute -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${(n.x / 1000) * 100}%`, top: `${(n.y / 1000) * 100}%` }}
                    >
                      <div className="mt-6 inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-black/75 px-3 py-1 backdrop-blur">
                        <span
                          className={cn(
                            "relative inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white",
                            isActive && !reducedMotion ? "ring-2 ring-[#D4F25A] ring-offset-2 ring-offset-[#0E0A14]" : null,
                          )}
                          style={{
                            boxShadow: `0 0 0 1px rgba(255,255,255,0.06), 0 10px 26px rgba(0,0,0,0.45), 0 0 26px ${c.color}33`,
                          }}
                          aria-hidden
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {isActive && !reducedMotion ? (
                            <span
                              className="absolute inset-0 rounded-full"
                              style={{
                                boxShadow: `0 0 0 10px ${c.color}22`,
                                opacity: 0.9,
                              }}
                            />
                          ) : null}
                        </span>
                        <span className="font-mono text-[12px] font-semibold tracking-widest text-white">
                          {c.label.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

                <div className="mt-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div className="font-mono text-[11px] font-semibold tracking-[0.14em] text-white">
                    ↳ EVERY SIGNAL → ONE PAGE
                  </div>
                  <div className="font-mono text-[11px] font-semibold tracking-[0.14em] text-white">
                    Preview • Sources: ProPublica, Guardian
                  </div>
                </div>
              </div>
            </div>

            {/* Proof rail (always visible): latest signals */}
            <aside className="w-full">
              <div className="flex items-end justify-between gap-4">
                <h3 className="font-serif text-2xl font-semibold tracking-[-0.02em] text-white">
                  Latest signals
                </h3>
                <Link
                  href="/news"
                  className="text-sm font-semibold text-white/85 underline underline-offset-4 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0E0A14]"
                >
                  View all →
                </Link>
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/60 p-4 backdrop-blur">
                <div className="space-y-3">
                  {latestSignals.map((s, idx) => {
                    const kind = signalKindFromEventLabel(s.label);
                    const src = signalSource(kind);
                    const href = signalHref(kind);
                    const c = pos.nodes[s.cause];
                    return (
                      <Link
                        key={`${s.label}-${idx}`}
                        href={href}
                        className="group block rounded-xl border border-white/10 bg-white/5 px-3 py-3 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0E0A14]"
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: c.color }}
                            aria-hidden
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="inline-flex h-6 items-center rounded-full border border-white/10 bg-black/60 px-2.5 font-mono text-[10px] font-semibold tracking-[0.16em] text-white">
                                {kind}
                              </span>
                              <span className="font-mono text-[10px] font-semibold tracking-[0.14em] text-white/85">
                                From {src}
                              </span>
                            </div>
                            <div
                              className="mt-2 line-clamp-2 font-sans text-[15px] font-semibold leading-snug text-white group-hover:text-[#D4F25A]"
                              title={signalTitle(s.label)}
                            >
                              {signalTitle(s.label)}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-white/80">
                  {reducedMotion ? "Reduced motion: updates paused" : paused ? "Updates paused" : "Updates on"}
                </span>
                <button
                  type="button"
                  onClick={() => setPaused((p) => !p)}
                  disabled={reducedMotion}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0E0A14] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {paused ? "Resume updates" : "Pause updates"}
                </button>
              </div>
            </aside>
          </div>
        </div>

        {/* Row 2 (bento): explainer + legend + CTA */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/50 p-6 backdrop-blur">
            <h3 className="font-serif text-xl font-semibold tracking-[-0.02em] text-white">
              What you’re seeing
            </h3>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-white/90">
              <li>
                <span className="font-semibold text-white">Signals are samples</span> from trusted sources — no real‑time claims.
              </li>
              <li>
                <span className="font-semibold text-white">Colors map to issues</span> so you can spot what matters at a glance.
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/50 p-6 backdrop-blur">
            <h3 className="font-serif text-xl font-semibold tracking-[-0.02em] text-white">
              Legend
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
              {CAUSES.map((c) => (
                <div key={c.id} className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} aria-hidden />
                  <span className="text-sm font-semibold text-white">{c.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/50 p-6 backdrop-blur">
            <h3 className="font-serif text-xl font-semibold tracking-[-0.02em] text-white">
              Next steps
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-white/90">
              Jump into your reps or read today’s briefing to see the same sources in context.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <Link
                href="/reps"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#D4F25A] px-6 font-sans text-sm font-semibold text-[#0E0A14] transition-colors hover:bg-chartreuse-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4F25A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0E0A14]"
              >
                See your reps
              </Link>
              <Link
                href="/news"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 font-sans text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4F25A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0E0A14]"
              >
                Read today’s briefing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

