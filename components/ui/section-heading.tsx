import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  titleClassName?: string;
  descriptionClassName?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  titleClassName,
  descriptionClassName,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        align === "left" && "items-start text-left"
      )}
    >
      {eyebrow && (
        <span className="inline-flex rounded-full bg-chartreuse-500 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-ink">
          {eyebrow}
        </span>
      )}
      <h2
        className={cn(
          "font-serif text-display-sm font-semibold tracking-tight text-plum-700 lg:text-display-md",
          titleClassName
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "max-w-2xl text-body-md text-ink-muted",
            descriptionClassName
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
