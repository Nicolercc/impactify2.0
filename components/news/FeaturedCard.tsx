"use client";

import { ArticleCard, type ArticleCardProps } from "@/components/news/ArticleCard";

export function FeaturedCard(props: Omit<ArticleCardProps, "featured">) {
  return <ArticleCard {...props} featured />;
}

