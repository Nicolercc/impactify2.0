import type { Metadata } from "next";
import { Section } from "@/components/layout/section";

export const metadata: Metadata = {
  title: "Terms of Service | Impactify",
  description: "Terms of Service for Impactify.",
};

export default function TermsPage() {
  return (
    <main id="main-content">
      <Section tone="parchment" aria-labelledby="terms-heading">
        <div className="mx-auto max-w-3xl">
          <h1
            id="terms-heading"
            className="font-serif text-4xl font-semibold tracking-[-0.03em] text-plum-700 dark:text-foreground"
          >
            Terms of Service
          </h1>
          <p className="mt-4 text-[1.05rem] leading-relaxed text-ink-muted dark:text-[#d4c9bc]">
            These terms govern your use of Impactify. This is a demo MVP; features may change.
          </p>

          <div className="prose prose-plum mt-10 max-w-none dark:prose-invert">
            <h2>Use of the service</h2>
            <p>Use Impactify for informational purposes. Don’t abuse the service or attempt to disrupt it.</p>

            <h2>Data sources</h2>
            <p>Some content is derived from third-party sources (e.g., ProPublica, Congress.gov, news providers).</p>

            <h2>Disclaimer</h2>
            <p>Impactify does not provide legal advice. Verify critical information with original sources.</p>
          </div>
        </div>
      </Section>
    </main>
  );
}

