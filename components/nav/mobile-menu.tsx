"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { COMING_SOON_ITEMS, NAV_ITEMS } from "@/lib/constants/nav";
import { cn } from "@/lib/utils";

export function MobileMenu({
	className,
	onNavigate,
}: {
	className?: string;
	onNavigate?: () => void;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const panelId = useId();
	const firstLinkRef = useRef<HTMLAnchorElement | null>(null);

	useEffect(() => {
		if (!isOpen) return;
		firstLinkRef.current?.focus();
	}, [isOpen]);

	return (
		<div className={cn("relative", className)}>
			<button
				type="button"
				onClick={() => setIsOpen((v) => !v)}
				className="inline-flex h-11 w-11 items-center justify-center rounded-md text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a0618] lg:hidden"
				aria-label={isOpen ? "Close menu" : "Open menu"}
				aria-expanded={isOpen}
				aria-controls={panelId}
			>
				{isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
			</button>

			{isOpen ? (
				<div
					id={panelId}
					role="dialog"
					aria-label="Navigation menu"
					className="absolute left-0 right-0 top-full mt-3 rounded-2xl border border-white/10 bg-[#1a0618]/95 p-3 shadow-2xl backdrop-blur lg:hidden"
				>
					<nav className="flex flex-col gap-1">
						{NAV_ITEMS.filter((i) => i.isReady).map((item, idx) => (
							<Link
								key={item.href}
								href={item.href}
								ref={idx === 0 ? firstLinkRef : undefined}
								className="rounded-xl px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a0618]"
								onClick={() => {
									setIsOpen(false);
									onNavigate?.();
								}}
							>
								{item.label}
							</Link>
						))}

						<div className="my-2 border-t border-white/10" />

						<Link
							href="/feedback"
							className="rounded-xl px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a0618]"
							onClick={() => {
								setIsOpen(false);
								onNavigate?.();
							}}
						>
							Feedback
						</Link>
						<Link
							href="/privacy"
							className="rounded-xl px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a0618]"
							onClick={() => {
								setIsOpen(false);
								onNavigate?.();
							}}
						>
							Privacy
						</Link>

						<div className="my-2 border-t border-white/10" />

						<details className="rounded-xl">
							<summary className="cursor-pointer select-none rounded-xl px-3 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white">
								More
							</summary>
							<div className="mt-2 flex flex-col gap-1 border-l border-white/10 pl-3">
								{COMING_SOON_ITEMS.map((item) => (
									<span key={item.href} className="px-2 py-1 text-xs text-white/40">
										{item.label}{" "}
										{item.launchDate ? (
											<span className="ml-1 text-white/25">({item.launchDate})</span>
										) : (
											<span className="ml-1 text-white/25">(coming soon)</span>
										)}
									</span>
								))}
							</div>
						</details>
					</nav>
				</div>
			) : null}
		</div>
	);
}

