"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { COMING_SOON_ITEMS } from "@/lib/constants/nav";
import { cn } from "@/lib/utils";

export function DesktopDropdown({
	align = "center",
	className,
}: {
	align?: "center" | "right";
	className?: string;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const wrapRef = useRef<HTMLDivElement | null>(null);
	const buttonRef = useRef<HTMLButtonElement | null>(null);
	const panelId = useId();

	const items = useMemo(() => COMING_SOON_ITEMS, []);

	useEffect(() => {
		if (!isOpen) return;
		const onDocMouseDown = (e: MouseEvent) => {
			const t = e.target as Node | null;
			if (!t) return;
			if (wrapRef.current?.contains(t)) return;
			setIsOpen(false);
		};
		document.addEventListener("mousedown", onDocMouseDown);
		return () => document.removeEventListener("mousedown", onDocMouseDown);
	}, [isOpen]);

	return (
		<div ref={wrapRef} className={cn("relative hidden lg:block", className)}>
			<button
				ref={buttonRef}
				type="button"
				className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a0618]"
				aria-haspopup="menu"
				aria-expanded={isOpen}
				aria-controls={panelId}
				onClick={() => setIsOpen((v) => !v)}
				onKeyDown={(e) => {
					if (e.key === "Escape") {
						setIsOpen(false);
						buttonRef.current?.focus();
					}
				}}
			>
				More
				<ChevronDown
					className={cn(
						"h-4 w-4 transition-transform",
						isOpen && "rotate-180",
					)}
					aria-hidden
				/>
			</button>

			{isOpen ? (
				<div
					id={panelId}
					role="menu"
					aria-label="More links"
					className={cn(
						"absolute z-50 mt-3 w-76 rounded-2xl border border-white/10 bg-[#1a0618]/95 p-4 shadow-2xl backdrop-blur",
						align === "right" ? "right-0" : "left-1/2 -translate-x-1/2",
					)}
				>
					<p className="text-xs font-semibold uppercase tracking-wide text-white/55">
						Coming soon
					</p>
					<div className="mt-3 space-y-2">
						{items.map((item) => (
							<div
								key={item.href}
								role="none"
								className="rounded-xl border border-white/10 bg-white/5 p-3"
							>
								<p className="text-sm font-semibold text-white">{item.label}</p>
								<p className="mt-1 text-xs leading-relaxed text-white/65">
									{item.description}
								</p>
								<p className="mt-2 text-xs text-white/40">
									{item.launchDate ?? "Coming soon"}
								</p>
							</div>
						))}
					</div>

					<div className="mt-3 border-t border-white/10 pt-3">
						<Link
							href="/news"
							role="menuitem"
							className="inline-flex w-full items-center justify-center rounded-xl bg-chartreuse-500 px-4 py-2 text-sm font-semibold text-plum-700 hover:bg-chartreuse-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a0618]"
							onClick={() => setIsOpen(false)}
						>
							Read Briefing
						</Link>
					</div>
				</div>
			) : null}
		</div>
	);
}

