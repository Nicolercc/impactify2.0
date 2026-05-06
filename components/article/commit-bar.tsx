"use client";

import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CommitBar() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-plum-100 bg-parchment/95 px-4 py-3 backdrop-blur-md pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
      role="region"
      aria-label="Take action"
    >
      <div className="mx-auto flex max-w-[1240px] flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-center font-serif text-base font-semibold text-plum-900 sm:text-left sm:text-lg">
          You&apos;re informed. Now do something.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
          <Button
            type="button"
            variant="default"
            className="min-h-[44px] rounded-full px-5"
            onClick={() => document.getElementById("reps-panel")?.scrollIntoView({ behavior: "smooth", block: "start" })}
          >
            <Phone className="mr-2 h-4 w-4" aria-hidden />
            Call your rep now
          </Button>
          <Button type="button" variant="outline" className="min-h-[44px] rounded-full px-5" asChild>
            <a href="/events">Find an event</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
