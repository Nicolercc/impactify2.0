"use client";

import { useId, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
const ReadingProgress = dynamic(
  () => import("@/components/news/reading-progress").then((m) => m.ReadingProgress),
  { ssr: false },
);

export type NewsMobileMode = "article" | "context" | "timeline" | "stakes";

export function ArticleBriefingToggleLayout({
	article,
	briefingContext,
	briefingTimeline,
	briefingStakes,
	className,
	defaultMode = "article",
}: {
	article: React.ReactNode;
	briefingContext: React.ReactNode;
	briefingTimeline: React.ReactNode;
	briefingStakes: React.ReactNode;
	className?: string;
	defaultMode?: NewsMobileMode;
}) {
	const [mode, setMode] = useState<NewsMobileMode>(defaultMode);
	const baseId = useId();
	const articleId = `${baseId}-article`;
	const briefingId = `${baseId}-briefing`;
	const articleRef = useRef<HTMLDivElement>(null);

	const buttons = useMemo(
		() => [
			{ key: "article" as const, label: "Article", controls: articleId },
			{ key: "context" as const, label: "Context", controls: briefingId },
			{ key: "timeline" as const, label: "Timeline", controls: briefingId },
			{ key: "stakes" as const, label: "Stakes", controls: briefingId },
		],
		[articleId, briefingId],
	);

	const showArticle = mode === "article";
	const activeBriefing =
		mode === "timeline"
			? briefingTimeline
			: mode === "stakes"
				? briefingStakes
				: briefingContext;

	return (
		<div
			className={cn(
				"grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]",
				className,
			)}
		>
			<ReadingProgress targetRef={articleRef} />

			{/* Mobile toggle */}
			<div className="sticky top-0 z-20 -mx-5 border-b border-plum-100 bg-parchment/90 px-5 py-3 backdrop-blur md:-mx-10 md:px-10 lg:hidden">
				<div
					role="tablist"
					aria-label="Toggle article or briefing"
					className="mx-auto grid max-w-[720px] grid-cols-4 rounded-full border border-plum-200 bg-parchment p-1 shadow-sm"
				>
					{buttons.map((b) => {
						const selected = mode === b.key;
						return (
							<button
								key={b.key}
								type="button"
								role="tab"
								aria-selected={selected}
								aria-controls={b.controls}
								tabIndex={selected ? 0 : -1}
								onClick={() => setMode(b.key)}
								className={cn(
									"inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition-colors",
									selected
										? "bg-plum-700 text-parchment"
										: "text-plum-700 hover:bg-plum-50",
								)}
							>
								{b.label}
							</button>
						);
					})}
				</div>
			</div>

			{/* Article column */}
			<div
				id={articleId}
				ref={articleRef}
				className={cn("min-w-0", !showArticle && "hidden lg:block")}
			>
				{article}
			</div>

			{/* Briefing column */}
			<aside
				id={briefingId}
				className={cn(
					"lg:sticky lg:top-24 lg:self-start",
					showArticle && "hidden lg:block",
				)}
			>
				<div className="lg:max-h-[calc(100vh-7rem)] lg:overflow-auto lg:pr-1">
					{activeBriefing}
				</div>
			</aside>
		</div>
	);
}
