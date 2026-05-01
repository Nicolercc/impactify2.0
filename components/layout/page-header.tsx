import { cn } from "@/lib/utils";
import { EyebrowBadge } from "@/components/layout/eyebrow-badge";

export function PageHeader({
  eyebrow,
  title,
  lead,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  align?: "left" | "center";
}) {
  const centered = align === "center";

  return (
    <header
      className={cn("mb-[4rem] md:mb-[6rem]", centered && "mx-auto max-w-7xl text-center")}
    >
      <div className="flex flex-col gap-4 md:gap-6">
        {eyebrow ? (
          <div className={cn(centered && "flex justify-center")}>
            <EyebrowBadge>{eyebrow}</EyebrowBadge>
          </div>
        ) : null}
        <h1
          className={cn(
            "font-serif text-heading text-plum-700 md:text-display",
            centered && "mx-auto",
          )}
        >
          {title}
        </h1>
        {lead ? (
          <p
            className={cn(
              "max-w-[52ch] text-[1.25rem] leading-[1.55] text-ink-muted md:text-[1.375rem]",
              centered ? "mx-auto" : "",
            )}
          >
            {lead}
          </p>
        ) : null}
      </div>
    </header>
  );
}
