"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, Plus } from "lucide-react";
import type { NewsCategory } from "@/lib/constants/categories";
import { sortNewsCategoriesForDisplay } from "@/lib/constants/categories";
import { cn } from "@/lib/utils";
import { CategoryDrawer } from "@/components/news/CategoryDrawer";

const STORAGE_KEY = "impactify.news.category";

function isValidCategory(id: string, categories: NewsCategory[]): boolean {
  return categories.some((c) => c.id === id);
}

function pillClass(active: boolean) {
  return cn(
    "group inline-flex h-11 items-center gap-2 rounded-full px-3 text-sm font-medium", // 44px
    "transition-[background-color,color,transform,box-shadow] duration-300 ease-out",
    "active:scale-[0.95]",
    "hover:scale-[1.05] hover:-translate-y-[1px] hover:shadow-[0_10px_22px_rgba(61,38,51,0.12)]",
    active
      ? "bg-[#d4849a] text-white font-bold"
      : "bg-[#e8e8e8] text-ink hover:bg-parchment-100",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4849a] focus-visible:ring-offset-2 focus-visible:ring-offset-parchment",
  );
}

function CategoryPill({
  category,
  active,
  onSelect,
  showTrendingBadge,
}: {
  category: NewsCategory;
  active: boolean;
  onSelect: (id: string) => void;
  showTrendingBadge?: boolean;
}) {
  const Icon = category.icon;
  return (
    <button
      type="button"
      className={pillClass(active)}
      aria-pressed={active}
      title={category.description}
      onClick={() => onSelect(category.id)}
    >
      <span
        className={cn(
          "inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/60 text-ink",
          active && "bg-white/20 text-white",
        )}
        aria-hidden
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="whitespace-nowrap">{category.label}</span>
      {showTrendingBadge ? (
        <span
          className={cn(
            "ml-1 rounded-full px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-[0.12em]",
            active ? "bg-white/20 text-white" : "bg-white/70 text-ink",
          )}
        >
          trending
        </span>
      ) : null}
    </button>
  );
}

export function CategoryPills({
  categories,
  onActiveChange,
  navigate,
  replace,
}: {
  categories: NewsCategory[];
  /** Optional callback for "Showing X in Y" label. */
  onActiveChange?: (activeId: string) => void;
  /** Optional navigation hook so parent can wrap in startTransition() */
  navigate?: (href: string) => void;
  replace?: (href: string) => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sorted = useMemo(() => sortNewsCategoriesForDisplay(categories), [categories]);
  const tier1 = useMemo(() => sorted.filter((c) => c.priority === "tier1"), [sorted]);
  const tier1And2 = useMemo(
    () => sorted.filter((c) => c.priority === "tier1" || c.priority === "tier2"),
    [sorted],
  );

  const activeFromUrl = (searchParams.get("category") ?? "all").trim() || "all";
  const activeId = isValidCategory(activeFromUrl, sorted) ? activeFromUrl : "all";

  useEffect(() => {
    onActiveChange?.(activeId);
  }, [activeId, onActiveChange]);

  // Persist selection -> localStorage; hydrate selection if no URL param.
  useEffect(() => {
    try {
      if (searchParams.has("category")) {
        window.localStorage.setItem(STORAGE_KEY, activeId);
        return;
      }
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && saved !== activeId && isValidCategory(saved, sorted)) {
        const params = new URLSearchParams(searchParams.toString());
        if (saved === "all") params.delete("category");
        else params.set("category", saved);
        const href = params.toString() ? `/news?${params.toString()}` : "/news";
        if (replace) replace(href);
        else router.replace(href);
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setActive(nextId: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextId === "all") params.delete("category");
    else params.set("category", nextId);
    const href = params.toString() ? `/news?${params.toString()}` : "/news";
    if (navigate) navigate(href);
    else router.push(href);
    if (typeof window !== "undefined" && window.scrollY > 300) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, nextId);
    } catch {
      // ignore
    }
  }

  // Desktop: show all 15 in 3 rows (5 per row)
  // Tablet: tier1+tier2 (12 pills, 4 per row)
  // Mobile: tier1+tier2 only (horizontal scroll) + “More categories +” opens bottom sheet
  return (
    <div className="space-y-4">
      {/* Mobile */}
      <div className="flex items-center gap-3 md:hidden">
        <div className="flex-1 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max gap-2">
            {tier1And2.map((c) => (
              <CategoryPill
                key={c.id}
                category={c}
                active={activeId === c.id}
                onSelect={setActive}
                showTrendingBadge={c.id === "trending"}
              />
            ))}
          </div>
        </div>

        <CategoryDrawer
          categories={sorted}
          activeId={activeId}
          onSelect={setActive}
          trigger={
            <button
              type="button"
              className={cn(
                "inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-plum-200 bg-parchment px-3 text-sm font-semibold text-plum-700 shadow-sm hover:bg-plum-50",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4849a] focus-visible:ring-offset-2 focus-visible:ring-offset-parchment",
              )}
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-parchment-100">
                <Plus className="h-4 w-4" aria-hidden />
              </span>
              More
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          }
        />
      </div>

      {/* Tablet */}
      <div className="hidden md:block xl:hidden">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {tier1And2.map((c) => (
            <CategoryPill
              key={c.id}
              category={c}
              active={activeId === c.id}
              onSelect={setActive}
              showTrendingBadge={c.id === "trending"}
            />
          ))}
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden xl:block">
        <div className="grid grid-cols-5 gap-2">
          {sorted.map((c) => (
            <CategoryPill
              key={c.id}
              category={c}
              active={activeId === c.id}
              onSelect={setActive}
              showTrendingBadge={c.id === "trending"}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

