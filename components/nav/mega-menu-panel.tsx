"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { PrimaryNavMenuItemFromConst } from "@/lib/constants/nav";
import { cn } from "@/lib/utils";

export type MegaMenuPanelProps = {
	item: PrimaryNavMenuItemFromConst;
	panelId: string;
	isOpen: boolean;
	wrapperRef: React.RefObject<HTMLDivElement | null>;
	triggerRef: React.RefObject<HTMLButtonElement | null>;
	onClose: () => void;
	user: User | null;
	/** When true, focus first enabled menuitem on open. */
	focusFirstItem?: boolean;
	isDark?: boolean;
};

function FeaturedStrip({
	eyebrow,
	title,
	href,
	tint,
	ctaLabel,
	onClose,
	isDark,
}: PrimaryNavMenuItemFromConst["featured"] & {
	onClose: () => void;
	isDark: boolean;
}) {
	const ctaText = ctaLabel ?? "Explore";
	const tintClass =
		tint === "chartreuse"
			? "bg-chartreuse-500 text-primary-foreground"
			: tint === "peach"
				? "bg-peach-200 text-ink dark:bg-peach-200 dark:text-ink"
				: cn(
						"bg-plum-100 text-plum-700",
						isDark && "bg-white/5 text-parchment",
					);

	return (
		<div
			className={cn(
				"flex items-center justify-between gap-4 rounded-xl px-5 py-4",
				tintClass,
			)}
		>
			<div className="min-w-0">
				<div className="font-sans text-eyebrow font-semibold uppercase tracking-widest">
					{eyebrow}
				</div>
				<div className="mt-1 truncate font-serif text-lg font-medium">
					{title}
				</div>
			</div>
			<Link
				href={href}
				className={cn(
					"inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 font-sans text-sm font-semibold",
					isDark
						? "bg-[#F4EFE3] text-[#0E0A14] hover:bg-[#ede6d8]"
						: "bg-plum-700 text-parchment hover:bg-plum-500",
					"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500 focus-visible:ring-offset-2",
					isDark
						? "focus-visible:ring-offset-[#1a0618]"
						: "focus-visible:ring-offset-parchment",
				)}
				onClick={onClose}
			>
				{ctaText}
				<ArrowRight className="h-4 w-4" aria-hidden />
			</Link>
		</div>
	);
}

export function MegaMenuPanel({
	item,
	panelId,
	isOpen,
	wrapperRef,
	triggerRef,
	onClose,
	focusFirstItem,
	isDark: isDarkProp,
}: MegaMenuPanelProps) {
	const prefersReducedMotion = useReducedMotion();
	const isDark = isDarkProp ?? false;
	const firstItemRef = React.useRef<HTMLAnchorElement | null>(null);

	React.useEffect(() => {
		if (!isOpen) return;
		if (!focusFirstItem) return;
		window.requestAnimationFrame(() => {
			firstItemRef.current?.focus();
		});
	}, [isOpen, focusFirstItem]);

	function onKeyDown(e: React.KeyboardEvent) {
		if (e.key === "Escape") {
			e.preventDefault();
			onClose();
			window.requestAnimationFrame(() => triggerRef.current?.focus());
			return;
		}

		if (e.key === "Tab") {
			const panel = document.getElementById(panelId);
			const first = firstItemRef.current;
			if (!panel || !first) return;

			const active = document.activeElement as HTMLElement | null;
			if (e.shiftKey && active === first) {
				e.preventDefault();
				onClose();
				window.requestAnimationFrame(() => triggerRef.current?.focus());
			}
		}
	}

	const motionProps = prefersReducedMotion
		? { initial: false, animate: { opacity: 1 }, exit: { opacity: 0 } }
		: {
				initial: { opacity: 0, y: 6, scale: 0.98 },
				animate: { opacity: 1, y: 0, scale: 1 },
				exit: { opacity: 0, y: 6, scale: 0.98 },
				transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] as const },
			};

	// Causes column renders labels only (no descriptions).
	const isCausesGroup = (heading: string) =>
		heading.trim().toLowerCase() === "causes";

	return (
		<AnimatePresence>
			{isOpen ? (
				<motion.div
					id={panelId}
					role="menu"
					aria-label={`${item.label} menu`}
					{...motionProps}
					onKeyDown={onKeyDown}
					className={cn(
						"absolute z-50 w-[min(94vw,900px)] origin-top rounded-2xl border p-6 shadow-xl",
						isDark
							? "border-[rgba(244,239,227,0.1)] bg-[#0E0A14]/92 text-parchment backdrop-blur-xl"
							: "border-plum-100 bg-[rgba(247,242,232,0.95)] text-ink backdrop-blur-xl",
					)}
					style={{
						top: "calc(100% + 12px)",
						left: "50%",
						transform: "translateX(-50%)",
					}}
				>
					{/* Speech-bubble caret */}
					<div
						aria-hidden="true"
						className={cn(
							"absolute -top-2 h-4 w-4 rotate-45 border-l border-t",
							isDark
								? "border-[rgba(244,239,227,0.1)] bg-[#0E0A14]/92"
								: "border-plum-100 bg-[rgba(247,242,232,0.95)]",
						)}
						style={{ left: 48 }}
					/>

					<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
						{item.groups.map((group) => (
							<div key={group.heading} className="min-w-0">
								<div
									className={cn(
										"font-sans text-eyebrow font-semibold uppercase tracking-widest",
										isDark ? "text-[#c4b8a8]" : "text-plum-800",
									)}
								>
									{group.heading}
								</div>
								<div className="mt-3 space-y-1">
									{group.links.map((link, idx) => {
										const causesMode = isCausesGroup(group.heading);
										const common = causesMode
											? "block rounded-md py-1.5 text-sm"
											: "block rounded-lg p-3 -mx-3";

										if ("disabled" in link && link.disabled) {
											return (
												<span
													key={link.href}
													role="menuitem"
													aria-disabled="true"
													tabIndex={-1}
													className={cn(
														common,
														"cursor-not-allowed select-none border border-transparent",
														causesMode
															? isDark
																? "text-[#b5a89a]"
																: "text-plum-800/85"
															: isDark
																? "border-[rgba(244,239,227,0.08)] bg-[rgba(244,239,227,0.04)]"
																: "border-plum-100 bg-plum-50/60",
													)}
												>
													<span
														className={cn(
															causesMode
																? "font-sans font-medium"
																: "font-medium",
															isDark ? "text-[#e8dfd4]" : "text-plum-900",
														)}
													>
														{link.label}
														<span className="sr-only"> (coming soon)</span>
													</span>
													{!causesMode &&
													"description" in link &&
													link.description ? (
														<span
															className={cn(
																"mt-1 block font-sans text-caption leading-snug",
																isDark ? "text-[#b5a89a]" : "text-plum-800/90",
															)}
														>
															{link.description}
														</span>
													) : null}
												</span>
											);
										}

										const setFirstRef = (node: HTMLAnchorElement | null) => {
											if (!node) return;
											if (firstItemRef.current) return;
											firstItemRef.current = node;
										};

										return (
											<Link
												key={link.href}
												href={link.href}
												role="menuitem"
												ref={idx === 0 ? setFirstRef : undefined}
												className={cn(
													common,
													causesMode
														? isDark
															? "text-[#F4EFE3] hover:text-white hover:underline"
															: "text-plum-800 hover:text-plum-900 hover:underline"
														: cn(
																"transition-colors",
																isDark
																	? "hover:bg-white/5"
																	: "hover:bg-plum-50",
															),
												)}
												onClick={() => onClose()}
											>
												<span
													className={cn(
														causesMode
															? cn(
																	"font-sans font-medium",
																	isDark ? "text-[#F4EFE3]" : "text-plum-900",
																)
															: cn(
																	"font-medium",
																	isDark ? "text-[#F4EFE3]" : "text-plum-900",
																),
													)}
												>
													{link.label}
												</span>
												{!causesMode &&
												"description" in link &&
												link.description ? (
													<span
														className={cn(
															"mt-0.5 block font-sans text-caption leading-snug",
															isDark ? "text-[#c4b8a8]" : "text-plum-800/85",
														)}
													>
														{link.description}
													</span>
												) : null}
											</Link>
										);
									})}
								</div>
							</div>
						))}
					</div>

					<div className="mt-6">
						<FeaturedStrip
							{...item.featured}
							onClose={onClose}
							isDark={isDark}
						/>
					</div>
				</motion.div>
			) : null}
		</AnimatePresence>
	);
}
