const paths: Record<NonNullable<HandArrowProps["direction"]>, string> = {
  "down-right": "M4 8 Q28 4 52 36 L48 52 L68 48 L72 68 L44 60 L48 44 L32 40 Q12 20 4 8",
  "down-left": "M68 8 Q44 4 20 36 L24 52 L4 48 L0 68 L28 60 L24 44 L40 40 Q60 20 68 8",
  right: "M8 36 Q4 20 24 12 L40 8 L36 28 L56 24 L52 44 L32 40 L20 48 Q8 44 8 36",
};

const stroke: Record<NonNullable<HandArrowProps["color"]>, string> = {
  chartreuse: "var(--chartreuse-500)",
  peach: "var(--peach-400)",
  plum: "var(--plum-700)",
};

export type HandArrowProps = {
  direction?: "down-right" | "down-left" | "right";
  color?: "chartreuse" | "peach" | "plum";
  size?: number;
  className?: string;
};

export function HandArrow({
  direction = "down-right",
  color = "chartreuse",
  size = 72,
  className,
}: HandArrowProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 76 76"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d={paths[direction]}
        stroke={stroke[color]}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
