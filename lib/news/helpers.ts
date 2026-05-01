import type { ArticleCauseRow } from "@/lib/news/queries";

export type FlatCause = { id: string; slug: string; title: string };

export function flattenArticleCauses(rows: ArticleCauseRow[] | null): FlatCause[] {
  return (rows ?? []).flatMap((row) => {
    const c = row.causes;
    if (!c) return [];
    return Array.isArray(c) ? c : [c];
  });
}
