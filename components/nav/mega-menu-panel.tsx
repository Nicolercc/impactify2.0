"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { PrimaryNavMenuItemFromConst } from "@/lib/constants/nav";
import { cn } from "@/lib/utils";

export type MegaMenuPanelProps = {
  item: PrimaryNavMenuItemFromConst;
  panelId: string;
  isOpen: boolean;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  user: User | null;
  /** When true, focus first enabled menuitem on open. */
  focusFirstItem?: boolean;
};

function FeaturedStrip({
  eyebrow,
  title,
  href,
  tint,
  onClose,
}: PrimaryNavMenuItemFromConst["featured"] & { onClose: () => void }) {
  const tintClass =
    tint === "chartreuse"
      ? "bg-chartreuse-500 text-ink"
      : tint === "peach"
        ? "bg-peach-200 text-ink"
        : "bg-plum-100 text-plum-700";

  return (
    <div className={cn("flex items-center justify-between gap-4 rounded-xl px-5 py-4", tintClass)}>
      <div className="min-w-0">
        <div className="font-sans text-eyebrow font-semibold uppercase tracking-widest">
          {eyebrow}
        </div>
        <div className="mt-1 truncate font-serif text-lg font-medium">{title}</div>
      </div>
      <Link
        href={href}
        className="inline-flex shrink-0 items-center gap-2 rounded-full bg-plum-700 px-4 py-2 font-sans text-sm font-medium text-parchment hover:bg-plum-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500 focus-visible:ring-offset-2 focus-visible:ring-offset-parchment"
        onClick={onClose}
      >
        Explore
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  );
}

export function MegaMenuPanel({
  item,
  panelId,
  isOpen,
  wrapperRef,
  triggerRef,
  onClose,
  focusFirstItem,
}: MegaMenuPanelProps) {
  const prefersReducedMotion = useReducedMotion();
  const firstItemRef = React.useRef<HTMLAnchorElement | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    if (!focusFirstItem) return;
    window.requestAnimationFrame(() => {
      firstItemRef.current?.focus();
    });
  }, [isOpen, focusFirstItem]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      window.requestAnimationFrame(() => triggerRef.current?.focus());
      return;
    }

    if (e.key === "Tab") {
      const panel = document.getElementById(panelId);
      const first = firstItemRef.current;
      if (!panel || !first) return;

      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        onClose();
        window.requestAnimationFrame(() => triggerRef.current?.focus());
      }
    }
  }

  const motionProps = prefersReducedMotion
    ? { initial: false, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 6, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 6, scale: 0.98 },
        transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] as const },
      };

  // Causes column renders labels only (no descriptions).
  const isCausesGroup = (heading: string) => heading.trim().toLowerCase() === "causes";

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          id={panelId}
          role="menu"
          aria-label={`${item.label} menu`}
          {...motionProps}
          onKeyDown={onKeyDown}
          className={cn(
            "absolute z-50 w-[min(92vw,780px)] origin-top rounded-2xl border border-plum-100 bg-parchment p-6 shadow-xl",
          )}
          style={{
            top: "calc(100% + 12px)",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          {/* Speech-bubble caret */}
          <div
            aria-hidden="true"
            className="absolute -top-2 h-4 w-4 rotate-45 border-l border-t border-plum-100 bg-parchment"
            style={{ left: 48 }}
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {item.groups.map((group) => (
              <div key={group.heading} className="min-w-0">
                <div className="font-sans text-eyebrow font-semibold uppercase tracking-widest text-ink-muted">
                  {group.heading}
                </div>
                <div className="mt-3 space-y-1">
                  {group.links.map((link, idx) => {
                    const causesMode = isCausesGroup(group.heading);
                    const common = causesMode
                      ? "block rounded-md py-1 text-sm"
                      : "block rounded-lg p-3 -mx-3";

                    if ("disabled" in link && link.disabled) {
                      return (
                        <span
                          key={link.href}
                          aria-disabled="true"
                          className={cn(
                            common,
                            "cursor-not-allowed opacity-40 select-none",
                            causesMode
                              ? "text-ink-muted"
                              : "hover:bg-transparent",
                          )}
                        >
                          <span
                            className={cn(
                              causesMode ? "font-sans font-medium text-ink-muted" : "font-medium text-plum-700",
                            )}
                          >
                            {link.label}
                          </span>
                          {!causesMode && "description" in link && link.description ? (
                            <span className="mt-0.5 block font-sans text-caption text-ink-muted">
                              {link.description}
                            </span>
                          ) : null}
                        </span>
                      );
                    }

                    const setFirstRef = (node: HTMLAnchorElement | null) => {
                      if (!node) return;
                      if (firstItemRef.current) return;
                      firstItemRef.current = node;
                    };

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        role="menuitem"
                        ref={idx === 0 ? setFirstRef : undefined}
                        className={cn(
                          common,
                          causesMode
                            ? "text-ink-muted hover:text-plum-700"
                            : "transition-colors hover:bg-plum-50",
                        )}
                        onClick={() => onClose()}
                      >
                        <span
                          className={cn(
                            causesMode ? "font-sans font-medium" : "font-medium text-plum-700",
                          )}
                        >
                          {link.label}
                        </span>
                        {!causesMode && "description" in link && link.description ? (
                          <span className="mt-0.5 block font-sans text-caption text-ink-muted">
                            {link.description}
                          </span>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <FeaturedStrip {...item.featured} onClose={onClose} />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

