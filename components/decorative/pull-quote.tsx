import { cn } from "@/lib/utils";

export function PullQuote({
  children,
  attribution,
}: {
  children: React.ReactNode;
  attribution?: string;
}) {
  return (
    <section className="relative bg-parchment py-40 text-plum-700 dark:bg-background dark:text-foreground md:py-48" aria-label="Pull quote">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-plum-100 dark:bg-[rgba(244,239,227,0.12)]" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
        <blockquote className="relative z-1 mx-auto max-w-prose text-center">
          <span
            className="pointer-events-none absolute -left-4 top-0 font-serif text-[16rem] leading-none text-plum-300/20 md:-left-6"
            aria-hidden
          >
            &ldquo;
          </span>
          <p className="relative z-2 font-serif text-display italic leading-tight md:text-[3.25rem] md:leading-[1.08]">
            {children}
          </p>
          {attribution ? (
            <footer className="relative z-2 mt-8 font-sans text-eyebrow uppercase tracking-widest text-ink-muted dark:text-[#9d8f7f]">
              {attribution}
            </footer>
          ) : null}
        </blockquote>
      </div>
    </section>
  );
}
