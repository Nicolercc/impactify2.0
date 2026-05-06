"use client";

import { X } from "lucide-react";
import type { NewsCategory } from "@/lib/constants/categories";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function CategoryDrawer({
  categories,
  activeId,
  onSelect,
  trigger,
  title = "Filter by topic",
}: {
  categories: NewsCategory[];
  activeId: string;
  onSelect: (id: string) => void;
  trigger: React.ReactNode;
  title?: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className={cn(
          // Bottom sheet layout
          "fixed bottom-0 left-0 right-0 top-auto translate-x-0 translate-y-0",
          "w-full max-w-none rounded-t-2xl rounded-b-none border border-plum-100 bg-parchment p-0 shadow-2xl",
          // Slide-up motion
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=open]:slide-in-from-bottom-6 data-[state=closed]:slide-out-to-bottom-6",
          "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
          // Safe area for iOS
          "pb-[max(1rem,env(safe-area-inset-bottom))]",
        )}
      >
        <div className="border-b border-plum-100 px-5 py-4">
          <DialogHeader className="relative text-left">
            <DialogTitle className="font-serif text-lg text-plum-700">{title}</DialogTitle>
          </DialogHeader>
          <DialogClose
            className={cn(
              "absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full",
              "border border-plum-200 bg-parchment text-plum-700 shadow-sm hover:bg-plum-50",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4849a] focus-visible:ring-offset-2 focus-visible:ring-offset-parchment",
            )}
          >
            <X className="h-5 w-5" aria-hidden />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>

        <div className="max-h-[70vh] overflow-auto px-4 py-3">
          <div className="space-y-2">
            {categories.map((c) => {
              const active = c.id === activeId;
              const Icon = c.icon;
              return (
                <DialogClose asChild key={c.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(c.id)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-xl px-4",
                      "min-h-12", // 48px tap target
                      active
                        ? "bg-[#d4849a] text-white"
                        : "bg-white text-ink border border-plum-100",
                      "transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4849a] focus-visible:ring-offset-2 focus-visible:ring-offset-parchment",
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={cn(
                          "inline-flex h-9 w-9 items-center justify-center rounded-full",
                          active ? "bg-white/15" : "bg-parchment",
                        )}
                        aria-hidden
                      >
                        <Icon className={cn("h-5 w-5", active ? "text-white" : "text-plum-700")} />
                      </span>
                      <span className="text-left">
                        <span className={cn("block text-sm font-semibold", active ? "text-white" : "text-ink")}>
                          {c.label}
                        </span>
                        <span className={cn("block text-xs", active ? "text-white/80" : "text-ink-muted")}>
                          {c.description}
                        </span>
                      </span>
                    </span>
                    {active ? (
                      <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/90">
                        active
                      </span>
                    ) : null}
                  </button>
                </DialogClose>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

