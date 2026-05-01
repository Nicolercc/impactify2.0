export type Article = {
  id: string;
  title: string;
  snippet: string;
  imageUrl: string | null;
  source: string;
  date: string; // ISO
  url: string;
  categories: string[];
  /** Optional engagement signal if available (clicks, saves, etc.). */
  engagement?: number;
};

function safeTime(iso: string): number {
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : 0;
}

export function filterByCategory(articles: Article[], selectedCategory: string): Article[] {
  const cat = (selectedCategory || "all").trim() || "all";

  if (cat === "all") return articles;

  if (cat === "trending") {
    // If engagement exists, weight engagement higher than recency; otherwise recency-only.
    const sorted = [...articles].sort((a, b) => {
      const ea = typeof a.engagement === "number" ? a.engagement : 0;
      const eb = typeof b.engagement === "number" ? b.engagement : 0;
      if (ea !== eb) return eb - ea;
      return safeTime(b.date) - safeTime(a.date);
    });
    return sorted.slice(0, 10);
  }

  return articles.filter((a) => Array.isArray(a.categories) && a.categories.includes(cat));
}

