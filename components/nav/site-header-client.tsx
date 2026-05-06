"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";
import type { User } from "@supabase/supabase-js";
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
	const [isExploreOpen, setIsExploreOpen] = useState(false);
	const closeExploreTimeoutRef = useRef<number | null>(null);

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

	const allowPill = pathname === "/";

	/** Reps: sticky bar sits in document flow so hero can sit 32px below with no fixed-header gap. */
	const stickyMarketingReps =
		variant === "marketing" && pathname.startsWith("/reps");

	const showPill =
		allowPill && mounted && variant === "marketing" && !isScrolled && !isMobile;

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

	const initialState =
		variant === "marketing" && allowPill ? pillState : barState;

	const radar = (
		<span className="relative inline-flex h-2.5 w-2.5" aria-hidden="true">
			<span
				className={cn(
					"absolute inline-flex h-full w-full rounded-full bg-[#D4F25A]/60",
					!prefersReducedMotion && "animate-ping",
				)}
			/>
			<span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#D4F25A]" />
		</span>
	);

	const logoInner = (
		<>
			{radar}
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

	const navLinkClassName = (active: boolean) =>
		cn(
			"text-sm font-medium transition-colors",
			isDarkNav ? "text-white/80 hover:text-white" : "text-ink-muted hover:text-plum-700",
			active && (isDarkNav ? "text-white" : "text-plum-700"),
		);

	const menuContentClassName = cn(
		"w-[min(92vw,420px)] rounded-2xl p-2 shadow-2xl backdrop-blur",
		isDark ? "border-white/10 bg-[#1a0618]/95 text-white" : "border-plum-100 bg-white",
	);

	function clearExploreCloseTimer() {
		if (closeExploreTimeoutRef.current) window.clearTimeout(closeExploreTimeoutRef.current);
		closeExploreTimeoutRef.current = null;
	}

	function scheduleExploreClose() {
		clearExploreCloseTimer();
		// Small delay prevents flicker moving trigger -> menu.
		closeExploreTimeoutRef.current = window.setTimeout(() => {
			setIsExploreOpen(false);
		}, 120);
	}

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
					position: stickyMarketingReps ? "sticky" : "fixed",
					top: stickyMarketingReps ? 0 : undefined,
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

				{/* Desktop (1024+): News (left) | Logo (center) | Actions (right) */}
				<div className="hidden w-full items-center gap-6 lg:flex">
					<div className="flex min-w-0 flex-1 items-center">
						<div className="flex items-center gap-2">
							<Link
								href="#"
								aria-label="Search (demo)"
								className={cn(
									"inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors",
									isDarkNav
										? "text-white/80 hover:bg-white/8 hover:text-white"
										: "text-ink-muted hover:bg-plum-50 hover:text-plum-700",
									"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500 focus-visible:ring-offset-2",
									isDarkNav
										? "focus-visible:ring-offset-[#1a0618]"
										: "focus-visible:ring-offset-parchment",
								)}
							>
								<Search className="h-4.5 w-4.5" aria-hidden="true" />
							</Link>

							<DropdownMenu
								open={isExploreOpen}
								onOpenChange={(next) => {
									clearExploreCloseTimer();
									setIsExploreOpen(next);
								}}
							>
								<DropdownMenuTrigger asChild>
									<button
										type="button"
										onMouseEnter={() => {
											clearExploreCloseTimer();
											setIsExploreOpen(true);
										}}
										onMouseLeave={() => {
											scheduleExploreClose();
										}}
										className={cn(
											"inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors",
											isDarkNav
												? "text-white/80 hover:bg-white/8 hover:text-white"
												: "text-ink-muted hover:bg-plum-50 hover:text-plum-700",
											"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500 focus-visible:ring-offset-2",
											isDarkNav
												? "focus-visible:ring-offset-[#1a0618]"
												: "focus-visible:ring-offset-parchment",
										)}
										aria-label="Explore"
									>
										Explore <ChevronDown className="h-4 w-4" aria-hidden="true" />
									</button>
								</DropdownMenuTrigger>

								<DropdownMenuContent
									align="start"
									className={menuContentClassName}
									onMouseEnter={() => {
										clearExploreCloseTimer();
										setIsExploreOpen(true);
									}}
									onMouseLeave={() => {
										scheduleExploreClose();
									}}
								>
									<DropdownMenuLabel
										className={cn(
											"px-3 py-2 text-xs font-semibold tracking-wide",
											isDark ? "text-white/70" : "text-ink-muted",
										)}
									>
										Live
									</DropdownMenuLabel>
									<DropdownMenuItem asChild>
										<Link
											href="/news"
											aria-current={pathname.startsWith("/news") ? "page" : undefined}
											className={cn("flex w-full flex-col items-start gap-0.5 px-3 py-2")}
										>
											<span className={navLinkClassName(pathname.startsWith("/news"))}>
												News briefing
											</span>
											<span className={cn("text-xs", isDark ? "text-white/50" : "text-ink-muted")}>
												AI-contextualized civic news
											</span>
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link
											href="/reps"
											aria-current={pathname.startsWith("/reps") ? "page" : undefined}
											className={cn("flex w-full flex-col items-start gap-0.5 px-3 py-2")}
										>
											<span className={navLinkClassName(pathname.startsWith("/reps"))}>
												Reps
											</span>
											<span className={cn("text-xs", isDark ? "text-white/50" : "text-ink-muted")}>
												Your representatives and scorecards
											</span>
										</Link>
									</DropdownMenuItem>

									<DropdownMenuSeparator className={cn(isDark ? "bg-white/10" : "bg-plum-100")} />

									<DropdownMenuLabel
										className={cn(
											"px-3 py-2 text-xs font-semibold tracking-wide",
											isDark ? "text-white/70" : "text-ink-muted",
										)}
									>
										Coming soon
									</DropdownMenuLabel>

									{[
										{
											label: "Event RSVP",
											description: "Save events and get reminders",
										},
										{
											label: "Create an event",
											description: "Host town halls and meetups",
										},
										{
											label: "Donations",
											description: "Support causes with receipts",
										},
										{
											label: "Vote",
											description: "Election-day checklists and guidance",
										},
										{
											label: "Register to vote",
											description: "Registration and status checks",
										},
									].map((item) => (
										<DropdownMenuItem
											key={item.label}
											disabled
											className={cn("px-3 py-2")}
										>
											<div className="flex w-full flex-col items-start gap-0.5">
												<div className="flex w-full items-center justify-between gap-3">
													<span className={cn("text-sm font-medium", isDark ? "text-white/75" : "text-ink")}>
														{item.label}
													</span>
													<span
														className={cn(
															"shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide",
															isDark
																? "bg-white/10 text-white/60"
																: "bg-plum-50 text-ink-muted",
														)}
													>
														SOON
													</span>
												</div>
												<span className={cn("text-xs", isDark ? "text-white/45" : "text-ink-muted")}>
													{item.description}
												</span>
											</div>
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>

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

					<div className="flex min-w-0 flex-1 items-center justify-end gap-3">
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
