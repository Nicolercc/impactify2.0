import type { Metadata } from "next";
import { Section } from "@/components/layout/section";

export const metadata: Metadata = {
  title: "Cookie Policy | Impactify",
  description: "Cookie policy for Impactify.",
};

export default function CookiesPage() {
  return (
    <main id="main-content">
      <Section tone="parchment" aria-labelledby="cookies-heading">
        <div className="mx-auto max-w-3xl">
          <h1
            id="cookies-heading"
            className="font-serif text-4xl font-semibold tracking-[-0.03em] text-plum-700 dark:text-foreground"
          >
            Cookie Policy
          </h1>
          <p className="mt-4 text-[1.05rem] leading-relaxed text-ink-muted dark:text-[#d4c9bc]">
            We use cookies only where necessary to operate the product and improve reliability.
          </p>

          <div className="prose prose-plum mt-10 max-w-none dark:prose-invert">
            <h2>What cookies we use</h2>
            <ul>
              <li>Authentication cookies (if you sign in).</li>
              <li>Preference cookies (theme, basic UX settings).</li>
            </ul>

            <h2>Managing cookies</h2>
            <p>You can manage cookies in your browser settings.</p>
          </div>
        </div>
      </Section>
    </main>
  );
}

