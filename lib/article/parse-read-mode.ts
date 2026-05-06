export type ArticleReadMode = "tldr" | "clarity" | "full";

export function parseArticleReadMode(raw: string | null | undefined): ArticleReadMode {
  const v = (raw ?? "").trim().toLowerCase();
  if (v === "tldr" || v === "tl-dr" || v === "short") return "tldr";
  if (v === "full" || v === "long") return "full";
  return "clarity";
}
