import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/layout/section";

export const metadata: Metadata = {
  title: "Volunteer | Impactify",
  description: "Volunteer opportunities and ways to get involved.",
};

export default function VolunteerPage() {
  return (
    <main id="main-content">
      <Section tone="parchment" aria-labelledby="volunteer-heading">
        <div className="mx-auto max-w-3xl">
          <h1
            id="volunteer-heading"
            className="font-serif text-4xl font-semibold tracking-[-0.03em] text-plum-700 dark:text-foreground"
          >
            Volunteer
          </h1>
          <p className="mt-4 text-[1.05rem] leading-relaxed text-ink-muted dark:text-[#d4c9bc]">
            Coming soon. In the meantime, start with the{" "}
            <Link href="/news" className="font-medium text-plum-700 underline underline-offset-4 dark:text-chartreuse-500">
              briefing
            </Link>{" "}
            and follow up via your representatives.
          </p>
        </div>
      </Section>
    </main>
  );
}

