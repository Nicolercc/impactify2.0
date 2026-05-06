"use client";

import { ChevronDown } from "lucide-react";
import type { RefObject } from "react";
import { cn } from "@/lib/utils";

export type NavOpenMeta = { fromArrowDown?: boolean };

export type NavTriggerProps = {
  label: string;
  panelId: string;
  isOpen: boolean;
  isActive: boolean;
  tone?: "light" | "dark";
  triggerRef: RefObject<HTMLButtonElement | null>;
  onOpenChange: (open: boolean, meta?: NavOpenMeta) => void;
};

export function NavTrigger({
  label,
  panelId,
  isOpen,
  isActive,
  tone = "light",
  triggerRef,
  onOpenChange,
}: NavTriggerProps) {
  return (
    <button
      ref={triggerRef}
      type="button"
      aria-haspopup="menu"
      aria-expanded={isOpen}
      aria-controls={panelId}
      onClick={() => onOpenChange(!isOpen)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenChange(!isOpen);
        }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          onOpenChange(true, { fromArrowDown: true });
        }
      }}
      className={cn(
        "inline-flex items-center gap-1 rounded-sm text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500",
        "focus-visible:ring-offset-2",
        tone === "dark"
          ? "focus-visible:ring-offset-[#1a0618]"
          : "focus-visible:ring-offset-parchment",
        tone === "dark"
          ? isActive
            ? "text-white underline decoration-chartreuse-500 decoration-2 underline-offset-4"
            : "text-white hover:text-white"
          : isActive
            ? "text-plum-700 underline decoration-chartreuse-500 decoration-2 underline-offset-4"
            : "text-ink-muted hover:text-plum-500",
      )}
    >
      {label}
      <ChevronDown
        className={cn(
          "h-4 w-4 shrink-0 transition-transform duration-200",
          isOpen && "rotate-180",
        )}
        aria-hidden
      />
    </button>
  );
}

