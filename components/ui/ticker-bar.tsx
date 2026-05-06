"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const TICKER_ITEMS = [
  {
    tag: "VOTE",
    text: "S.1234 Climate Action Act — passed Senate 54-46",
    t: "2m ago",
    color: "lime",
  },
  {
    tag: "REP",
    text: "Your reps — latest roll calls and statements",
    t: "now",
    color: "rust",
  },
  {
    tag: "BILL",
    text: "H.R. 891 Rent Stabilization heads to floor vote",
    t: "14m ago",
    color: "lime",
  },
  {
    tag: "BRIEFING",
    text: "Atlantic offshore wind project — clarity report ready",
    t: "4m ago",
    color: "rust",
  },
  {
    tag: "RALLY",
    text: "Sunrise March for Climate Justice — Portland, OR",
    t: "1h ago",
    color: "lime",
  },
  {
    tag: "REP",
    text: "Sen. Maria Gonzalez voted YEA on Voting Rights Act",
    t: "6h ago",
    color: "rust",
  },
] as const;

export function TickerBar() {
  const id = useId().replace(/:/g, "");
  const animName = useMemo(() => `impactify-ticker-${id}`, [id]);
  const trackClass = useMemo(() => `impactify-ticker-track-${id}`, [id]);

  const items = useMemo(() => [...TICKER_ITEMS, ...TICKER_ITEMS], []);

  const [intentRevealed, setIntentRevealed] = useState(false);
  const [heroVisible, setHeroVisible] = useState(true);
  const [pulseVisible, setPulseVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [footerFade, setFooterFade] = useState(1);
  const fadeRafRef = useRef<number | null>(null);

  const revealed = intentRevealed && !heroVisible && !pulseVisible;

  useEffect(() => {
    const footer = document.getElementById("site-footer");
    if (!footer) return;

    const update = () => {
      const footerTop = footer.getBoundingClientRect().top;
      // Banner is fixed to viewport bottom and has height (~38px). Start fading when
      // the footer approaches the banner's occupied space (not the absolute bottom edge).
      const bannerHeight = 38;
      const overlapStart = window.innerHeight - bannerHeight;
      const gap = footerTop - overlapStart;
      const fadeStart = 220; // px away from overlap → start fading
      const next = Math.max(0, Math.min(1, gap / fadeStart));
      setFooterFade(next);
    };

    const onScroll = () => {
      if (fadeRafRef.current) return;
      fadeRafRef.current = window.requestAnimationFrame(() => {
        fadeRafRef.current = null;
        update();
      });
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (fadeRafRef.current) window.cancelAnimationFrame(fadeRafRef.current);
      fadeRafRef.current = null;
    };
  }, []);

  useEffect(() => {
    const mql = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const initial = mql?.matches ?? false;
    setPrefersReducedMotion(initial);
    setPaused(initial);

    const onChange = () => {
      const next = mql?.matches ?? false;
      setPrefersReducedMotion(next);
      if (next) setPaused(true);
    };

    if (mql?.addEventListener) mql.addEventListener("change", onChange);
    else mql?.addListener?.(onChange);

    return () => {
      if (mql?.removeEventListener) mql.removeEventListener("change", onChange);
      else mql?.removeListener?.(onChange);
    };
  }, []);

  useEffect(() => {
    let done = false;
    const revealOnce = () => {
      if (done) return;
      done = true;
      setIntentRevealed(true);
    };

    const onScroll = () => {
      if (window.scrollY >= 100) revealOnce();
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // If user navigates via keyboard or programmatic scroll, also reveal when #news is near.
    const news = document.getElementById("news");
    let io: IntersectionObserver | null = null;
    if (news && "IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          const any = entries.some((e) => e.isIntersecting);
          if (any) revealOnce();
        },
        { root: null, threshold: 0.02 },
      );
      io.observe(news);
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      io?.disconnect();
    };
  }, []);

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero || !("IntersectionObserver" in window)) {
      // If we can't observe, fail safe: don't hide on hero visibility.
      setHeroVisible(false);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        // Consider hero “visible” if any meaningful part is in view.
        setHeroVisible(entry.isIntersecting && entry.intersectionRatio > 0.02);
      },
      {
        root: null,
        threshold: [0, 0.02, 0.1, 0.25],
      },
    );
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const pulse = document.getElementById("civic-pulse");
    if (!pulse || !("IntersectionObserver" in window)) return;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        setPulseVisible(entry.isIntersecting && entry.intersectionRatio > 0.05);
      },
      { root: null, threshold: [0, 0.05, 0.15] },
    );
    io.observe(pulse);
    return () => io.disconnect();
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-60",
        "max-[359px]:hidden",
        "transition-opacity duration-300 ease-out",
        revealed ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      role="presentation"
      aria-hidden="true"
      style={{
        opacity: revealed ? footerFade : 0,
        pointerEvents: revealed && footerFade > 0.1 ? "auto" : "none",
      }}
    >
      <style jsx global>{`
        @keyframes ${animName} {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .${trackClass} {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>

      <div
        className={cn(
          "h-[38px] w-full border-t",
          "border-[rgba(244,239,227,0.10)]",
          "bg-[rgba(14,10,20,0.78)] backdrop-blur",
        )}
      >
        <div className="relative flex h-full w-full items-center overflow-hidden">
          {/* Fixed label */}
          <div className="relative z-10 flex h-full shrink-0 items-center gap-2 pl-4 pr-4">
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              disabled={prefersReducedMotion}
              className={cn(
                "ml-2 inline-flex h-7 w-7 items-center justify-center rounded-full border",
                "border-white/10 bg-white/5 text-parchment/80",
                "transition-colors hover:bg-white/10 hover:text-parchment",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0E0A14]",
                "disabled:cursor-not-allowed disabled:opacity-40",
              )}
              aria-label={
                prefersReducedMotion
                  ? "Ticker paused due to reduced motion"
                  : paused
                    ? "Resume ticker"
                    : "Pause ticker"
              }
            >
              {paused ? (
                <Play className="h-4 w-4" aria-hidden />
              ) : (
                <Pause className="h-4 w-4" aria-hidden />
              )}
            </button>

            {/* Gradient mask so ticker never “clips” at label edge */}
            <span
              className="pointer-events-none absolute right-0 top-0 h-full w-10"
              style={{
                background:
                  "linear-gradient(to right, rgba(14,10,20,0.78), rgba(14,10,20,0))",
              }}
              aria-hidden
            />
          </div>

          {/* Scrolling track */}
          <div className="relative flex-1 overflow-hidden">
            <div
              className={cn("flex w-max items-center gap-6 pr-6", trackClass)}
              style={{
                animation: paused ? "none" : `${animName} 90s linear infinite`,
                willChange: "transform",
              }}
            >
              {items.map((it, idx) => (
                <div key={`${it.tag}-${idx}`} className="flex items-center gap-3 whitespace-nowrap">
                  <span
                    className={cn(
                      "inline-flex h-6 items-center rounded-full border px-3 font-mono text-[10px] font-semibold tracking-[0.18em]",
                      it.color === "lime"
                        ? "border-[#D4F25A]/30 bg-[#D4F25A]/10 text-[#D4F25A]"
                        : "border-[#E07856]/30 bg-[#E07856]/10 text-[#E07856]",
                    )}
                  >
                    {it.tag}
                  </span>
                  <span className="font-sans text-[12px] font-medium text-parchment/80">
                    {it.text}
                  </span>
                  <span className="font-mono text-[11px] font-semibold tracking-[0.14em] text-parchment/55">
                    {it.t}
                  </span>
                  <span className="h-4 w-px bg-white/10" aria-hidden />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

