import type { Metadata } from "next";
import { Section } from "@/components/layout/section";

export const metadata: Metadata = {
  title: "Privacy Policy | Impactify",
  description: "Privacy policy for Impactify.",
};

export default function PrivacyPage() {
  return (
    <main id="main-content">
      <Section tone="parchment" aria-labelledby="privacy-heading">
        <div className="mx-auto max-w-3xl">
          <h1
            id="privacy-heading"
            className="font-serif text-4xl font-semibold tracking-[-0.03em] text-plum-700 dark:text-foreground"
          >
            Privacy Policy
          </h1>
          <p className="mt-4 text-[1.05rem] leading-relaxed text-ink-muted dark:text-[#d4c9bc]">
            Impactify is privacy-first. We don’t sell personal data. This policy explains what we
            collect and why.
          </p>

          <div className="prose prose-plum mt-10 max-w-none dark:prose-invert">
            <h2>What we collect</h2>
            <ul>
              <li>Email address (only if you subscribe).</li>
              <li>Optional interests you select (used for newsletter segmentation).</li>
            </ul>

            <h2>How we use it</h2>
            <ul>
              <li>To send your weekly briefing (with double opt-in confirmation).</li>
              <li>To improve relevance based on your selected interests.</li>
            </ul>

            <h2>Contact</h2>
            <p>If you have privacy questions, email us at <a href="mailto:hello@impactify.example">hello@impactify.example</a>.</p>
          </div>
        </div>
      </Section>
    </main>
  );
}

