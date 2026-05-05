import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/layout/section";

export const metadata: Metadata = {
  title: "Vote Tracker | Impactify",
  description: "Track key votes and see what they mean.",
};

export default function VoteTrackerPage() {
  return (
    <main id="main-content">
      <Section tone="parchment" aria-labelledby="vote-tracker-heading">
        <div className="mx-auto max-w-3xl">
          <h1
            id="vote-tracker-heading"
            className="font-serif text-4xl font-semibold tracking-[-0.03em] text-plum-700 dark:text-foreground"
          >
            Vote Tracker
          </h1>
          <p className="mt-4 text-[1.05rem] leading-relaxed text-ink-muted dark:text-[#d4c9bc]">
            Coming soon. For now, you can see recent votes inside the{" "}
            <Link href="/reps" className="font-medium text-plum-700 underline underline-offset-4 dark:text-chartreuse-500">
              representatives scorecard
            </Link>
            .
          </p>
        </div>
      </Section>
    </main>
  );
}

