export type IssuePalette = {
  /** Background chip / card tint. */
  bg: string;
  /** Primary bar / accent color. */
  light: string;
  /** Dark text color on bg. */
  dark: string;
};

/**
 * Human-friendly labels for issue keys used throughout the reps UI.
 * Keep keys stable (they may appear in URLs / analytics).
 */
export const ISSUE_LABELS: Record<string, string> = {
  "affordable-housing": "Housing",
  "climate-action": "Climate",
  "voting-rights": "Voting",
  "labor-rights": "Labor",
  immigration: "Immigration",
  healthcare: "Healthcare",
  education: "Education",
  "gun-safety": "Gun Safety",
  "criminal-justice": "Justice",
};

const DEFAULT: IssuePalette = {
  bg: "rgba(74, 19, 71, 0.08)", // plum tint
  light: "#4A1347",
  dark: "#2A1A2A",
};

const PALETTES: Record<string, IssuePalette> = {
  "affordable-housing": { bg: "rgba(212, 242, 90, 0.18)", light: "#D4F25A", dark: "#0E0A14" },
  "climate-action": { bg: "rgba(52, 211, 153, 0.18)", light: "#34D399", dark: "#064E3B" },
  "voting-rights": { bg: "rgba(96, 165, 250, 0.18)", light: "#60A5FA", dark: "#1E3A8A" },
  "labor-rights": { bg: "rgba(245, 158, 11, 0.16)", light: "#F59E0B", dark: "#78350F" },
  immigration: { bg: "rgba(167, 139, 250, 0.16)", light: "#A78BFA", dark: "#4C1D95" },
};

export function getIssuePalette(issueKey: string): IssuePalette {
  return PALETTES[issueKey] ?? DEFAULT;
}

