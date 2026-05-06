"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { User } from "@supabase/supabase-js";
import { NAV_ITEMS } from "@/lib/constants/nav";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";
import { MobileMenu } from "@/components/nav/mobile-menu";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type HeaderMotionState = {
	top: number;
	left: number | string;
	x: number | string;
	width: number | string;
	borderRadius: number;
	backgroundColor: string;
	paddingTop: number;
	paddingBottom: number;
	paddingLeft: number;
	paddingRight: number;
	boxShadow: string;
};

function userLabel(user: User) {
	const meta = user.user_metadata as { full_name?: string } | undefined;
	if (meta?.full_name) return meta.full_name as string;
	if (user.email) return user.email;
	return "Account";
}

function userInitials(user: User) {
	const label = userLabel(user);
	const parts = label.split(/\s+/).filter(Boolean);
	if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
	return label.slice(0, 2).toUpperCase();
}

export type SiteHeaderClientProps = {
	variant?: "marketing" | "app";
	user: User | null;
};

export function SiteHeaderClient({
	variant = "app",
	user,
}: SiteHeaderClientProps) {
	const pathname = usePathname();
	const prefersReducedMotion = useReducedMotion();
	const { theme } = useTheme();
	const isDark = theme === "dark";
	const [isMobile, setIsMobile] = useState(false);
	const [mounted, setMounted] = useState(false);
	const [isScrolled, setIsScrolled] = useState(false);

	useEffect(() => {
		const check = () => setIsMobile(window.innerWidth < 1024);
		check();
		setMounted(true);
		window.addEventListener("resize", check, { passive: true });
		return () => window.removeEventListener("resize", check);
	}, []);

	useEffect(() => {
		if (variant !== "marketing") return;
		const onScroll = () => setIsScrolled(window.scrollY > 40);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, [variant]);

	useEffect(() => {
		// no-op: reserved for future header state resets
	}, [pathname]);

	const showPill =
		mounted && variant === "marketing" && !isScrolled && !isMobile;

	// In dark mode, nav is always dark-styled (pill and bar).
	// In light mode, the marketing pill stays dark to match the hero.
	const isDarkNav = isDark;

	const pillState = useMemo<HeaderMotionState>(() => {
		return {
			top: 20,
			left: "50%",
			x: "-50%",
			width: "min(85vw, 900px)",
			borderRadius: 50,
			backgroundColor: isDark
				? "rgba(26, 6, 24, 0.65)"
				: "rgba(247, 242, 232, 0.92)",
			paddingTop: 10,
			paddingBottom: 10,
			paddingLeft: 24,
			paddingRight: 24,
			boxShadow: isDark
				? "0 8px 32px rgba(0, 0, 0, 0.45), 0 1px 0 rgba(255,255,255,0.04) inset"
				: "0 8px 32px rgba(0, 0, 0, 0.45), 0 1px 0 rgba(255,255,255,0.04) inset",
		};
	}, [isDark]);

	const barState = useMemo<HeaderMotionState>(() => {
		return {
			top: 0,
			left: 0,
			x: 0,
			width: "100%",
			borderRadius: 0,
			backgroundColor: isDark
				? "rgba(26, 6, 24, 0.88)"
				: "rgba(247, 242, 232, 0.95)",
			paddingTop: 14,
			paddingBottom: 14,
			paddingLeft: 32,
			paddingRight: 32,
			boxShadow: isDark
				? "0 1px 0 rgba(244, 239, 227, 0.06)"
				: "0 1px 0 rgba(26, 15, 26, 0.08)",
		};
	}, [isDark]);

	const spring = prefersReducedMotion
		? { duration: 0 }
		: { type: "spring" as const, stiffness: 280, damping: 30, mass: 0.8 };

	const initialState = variant === "marketing" ? pillState : barState;

	const logoInner = (
		<>
			<span
				aria-hidden="true"
				className="h-2 w-2 rounded-sm bg-chartreuse-500"
			/>
			<span
				className={cn(
					"font-serif text-lg font-medium tracking-tight transition-colors duration-200",
					isDarkNav ? "text-white" : "text-plum-700",
				)}
			>
				Impactify
			</span>
		</>
	);

	return (
		<>
			{user ? (
				<form
					id="impactify-sign-out"
					action="/auth/sign-out"
					method="POST"
					hidden
					aria-hidden
				/>
			) : null}
			<motion.header
				role="banner"
				initial={initialState}
				animate={showPill ? pillState : barState}
				transition={spring}
				style={{
					position: "fixed",
					zIndex: 50,
					backdropFilter: "blur(14px)",
					WebkitBackdropFilter: "blur(14px)",
					border: showPill ? "1px solid rgba(244, 239, 227, 0.10)" : "none",
					borderBottom: showPill
						? "1px solid rgba(244, 239, 227, 0.15)"
						: isDark
							? "0.5px solid rgba(244, 239, 227, 0.08)"
							: "0.5px solid rgba(26, 15, 26, 0.08)",
				}}
				className="w-full overflow-visible"
			>
				{/* Mobile (<1024): hamburger | logo | sign in */}
				<div className="flex w-full items-center justify-between gap-3 lg:hidden">
					<MobileMenu />
					<Link
						href="/"
						className={cn(
							"flex shrink-0 items-center gap-2 rounded-sm",
							"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500 focus-visible:ring-offset-2",
							isDarkNav
								? "focus-visible:ring-offset-[#1a0618]"
								: "focus-visible:ring-offset-parchment",
						)}
						aria-label="Impactify — home"
					>
						{logoInner}
					</Link>
					<Button
						variant="ghost"
						asChild
						className={cn(
							"transition-colors duration-200",
							isDarkNav
								? "text-white hover:bg-transparent hover:text-white"
								: "text-ink-muted hover:bg-transparent hover:text-plum-700",
						)}
					>
						<Link href="/auth/sign-in">Sign in</Link>
					</Button>
				</div>

				{/* Desktop (1024+): logo | nav | actions (simple) */}
				<div className="hidden w-full items-center justify-between gap-8 lg:flex">
					<Link
						href="/"
						className={cn(
							"flex shrink-0 items-center gap-2 rounded-sm",
							"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500 focus-visible:ring-offset-2",
							isDarkNav
								? "focus-visible:ring-offset-[#1a0618]"
								: "focus-visible:ring-offset-parchment",
						)}
						aria-label="Impactify — home"
					>
						{logoInner}
					</Link>

					<nav aria-label="Primary" className="flex items-center gap-8">
						{NAV_ITEMS.filter((i) => i.isReady).map((item) => {
							const active = pathname.startsWith(item.href);
							return (
								<Link
									key={item.href}
									href={item.href}
									aria-current={active ? "page" : undefined}
									className={cn(
										"text-sm font-medium transition-colors",
										isDarkNav
											? "text-white/80 hover:text-white"
											: "text-ink-muted hover:text-plum-700",
										active && (isDarkNav ? "text-white" : "text-plum-700"),
									)}
								>
									{item.label}
								</Link>
							);
						})}
					</nav>

					<div className="flex items-center justify-end gap-3">
						{user ? (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className={cn(
											"rounded-full transition-colors duration-200",
											isDarkNav
												? "text-white hover:bg-white/5 hover:text-white"
												: "text-ink-muted hover:bg-plum-50 hover:text-plum-700",
										)}
										aria-label="Account menu"
									>
										<Avatar
											className={cn(
												"size-9 border",
												isDarkNav ? "border-white/10" : "border-plum-100",
											)}
										>
											<AvatarFallback
												className={cn(
													"font-sans text-xs font-medium",
													isDarkNav
														? "bg-white/5 text-white"
														: "bg-plum-50 text-plum-700",
												)}
											>
												{userInitials(user)}
											</AvatarFallback>
										</Avatar>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									align="end"
									className={cn(
										"min-w-48",
										isDark
											? "border-white/10 bg-[#1a0618] text-white"
											: undefined,
									)}
								>
									<DropdownMenuLabel
										className={cn(
											"font-normal",
											isDark ? "text-white" : "text-ink-muted",
										)}
									>
										{userLabel(user)}
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem asChild>
										<button
											type="submit"
											form="impactify-sign-out"
											className={cn(
												"w-full cursor-pointer px-2 py-1.5 text-left text-sm",
												isDark
													? "text-white hover:bg-white/5"
													: "text-ink hover:bg-plum-50",
											)}
										>
											Sign out
										</button>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						) : (
							<Button
								variant="ghost"
								asChild
								className={cn(
									"transition-colors duration-200",
									isDarkNav
										? "text-white hover:bg-transparent hover:text-white"
										: "text-ink-muted hover:bg-transparent hover:text-plum-700",
								)}
							>
								<Link href="/auth/sign-in">Sign in</Link>
							</Button>
						)}
						<Button
							asChild
							className="rounded-full bg-chartreuse-500 px-5 font-medium text-plum-700 hover:bg-chartreuse-700"
						>
							<Link href="/news">Read Briefing</Link>
						</Button>
					</div>
				</div>
			</motion.header>
		</>
	);
}
