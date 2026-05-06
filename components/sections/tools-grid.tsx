"use client";

import Link from "next/link";
import { actionCategories } from "@/lib/constants/categories";
import { Section } from "@/components/layout/section";
import { EyebrowBadge } from "@/components/layout/eyebrow-badge";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { cn } from "@/lib/utils";

function hrefForTool(id: string, href: string) {
	if (id === "create") return "/events/new";
	return href;
}

const toolsTitle =
	"font-serif text-2xl text-plum-700 dark:text-foreground md:text-4xl md:leading-tight";

export function ToolsGrid() {
	return (
		<Section
			tone="parchment"
			aria-labelledby="tools-heading"
			className="dark:bg-[#0E0A14]"
		>
			<header className="mb-12 text-center md:mb-16">
				<div className="flex flex-col items-center gap-3 md:gap-4">
					<div className="flex justify-center">
						<EyebrowBadge className="dark:bg-transparent dark:text-chartreuse-500 dark:ring-1 dark:ring-chartreuse-500/20">
							Everything in one place
						</EyebrowBadge>
					</div>
					<h2 id="tools-heading" className={toolsTitle}>
						Six ways to take action.
					</h2>
					<p className="mx-auto max-w-[52ch] text-center text-[1.125rem] leading-[1.55] text-ink-muted dark:text-[#d4c9bc] md:text-[1.25rem]">
						Browse. Attend. Create. Donate. Discover. Vote. The civic stack,
						unified.
					</p>
				</div>
			</header>

			<div className="grid grid-cols-2 gap-4 md:grid-cols-3">
				{actionCategories.map((tool, index) => (
					<ScrollReveal key={tool.id} delay={index * 0.06}>
						<Link
							href={hrefForTool(tool.id, tool.href)}
							className={cn(
								"group block rounded-2xl border-l-4 border-l-chartreuse-500 bg-parchment-100 transition-all duration-300",
								"hover:translate-x-1 hover:border-l-[6px] hover:bg-parchment",
								"dark:border dark:border-chartreuse-500/20 dark:bg-[#2b1a35]",
								"dark:hover:border-chartreuse-500/40 dark:hover:bg-[#3d2845]",
							)}
						>
							<div className="flex h-full flex-col p-6">
								<div className="flex h-12 w-12 items-center justify-center rounded-full bg-chartreuse-300 dark:bg-chartreuse-500/15">
									<tool.icon
										className="h-6 w-6 text-plum-700 dark:text-chartreuse-500"
										aria-hidden
									/>
								</div>
								<div className="mt-4 flex items-start justify-between gap-3">
									<h3 className="font-serif text-title text-plum-700 dark:text-chartreuse-500">
										{tool.title}
									</h3>
									{tool.href.startsWith("/donate") ||
									tool.href.startsWith("/causes") ||
									tool.href.startsWith("/vote") ? (
										<span className="shrink-0 rounded-full bg-plum-50 px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.16em] text-plum-700 dark:bg-[#3d2845] dark:text-[#9d8f7f]">
											COMING SOON
										</span>
									) : null}
								</div>
								<p className="mt-2 font-sans text-caption leading-relaxed text-ink-muted dark:text-[#d4c9bc]">
									{tool.description}
								</p>
							</div>
						</Link>
					</ScrollReveal>
				))}
			</div>
		</Section>
	);
}
