import { cn } from "@/lib/utils";

export function PullQuote({
  children,
  attribution,
}: {
  children: React.ReactNode;
  attribution?: string;
}) {
  return (
    <section className="relative bg-parchment py-[10rem] text-plum-700 md:py-[12rem]" aria-label="Pull quote">
      <div className="relative mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
        <blockquote className="relative z-[1] mx-auto max-w-prose text-center">
          <span
            className="pointer-events-none absolute -left-4 top-0 font-serif text-[16rem] leading-none text-plum-300/20 md:-left-6"
            aria-hidden
          >
            &ldquo;
          </span>
          <p className="relative z-[2] font-serif text-display italic leading-tight md:text-[3.25rem] md:leading-[1.08]">
            {children}
          </p>
          {attribution ? (
            <footer className="relative z-[2] mt-8 font-sans text-eyebrow uppercase tracking-widest text-ink-muted">
              {attribution}
            </footer>
          ) : null}
        </blockquote>
      </div>
    </section>
  );
}
