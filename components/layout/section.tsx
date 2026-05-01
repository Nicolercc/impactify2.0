import { cn } from "@/lib/utils";

export type SectionProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
  "aria-labelledby"?: string;
  /** Parchment base, subtle alt, or plum-900 statement band */
  tone?: "parchment" | "parchment-alt" | "plum-deep";
  fullBleed?: boolean;
  /**
   * Controls the inner content max-width when `fullBleed` is false.
   * - `none`: full width (no max-width constraint)
   * - `content`: legacy site width (tailwind `max-w-content`)
   * - `7xl`: editorial width (tailwind `max-w-7xl`, ~80rem)
   */
  maxWidth?: "none" | "content" | "7xl";
};

const toneClass: Record<NonNullable<SectionProps["tone"]>, string> = {
  parchment: "bg-parchment",
  "parchment-alt": "bg-parchment-100",
  "plum-deep": "bg-plum-900 text-parchment",
};

const sectionPad = "py-[7rem] md:py-[9rem]";
const innerPad = "mx-auto w-full px-6 md:px-12 lg:px-16";

const maxWidthClass: Record<NonNullable<SectionProps["maxWidth"]>, string> = {
  none: "max-w-none",
  content: "max-w-content",
  "7xl": "max-w-7xl",
};

export function Section({
  children,
  className,
  id,
  "aria-labelledby": ariaLabelledBy,
  tone = "parchment",
  fullBleed = false,
  maxWidth = "7xl",
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(sectionPad, toneClass[tone], className)}
      {...(ariaLabelledBy ? { "aria-labelledby": ariaLabelledBy } : {})}
    >
      {fullBleed ? (
        children
      ) : (
        <div className={cn(innerPad, maxWidthClass[maxWidth])}>{children}</div>
      )}
    </section>
  );
}
