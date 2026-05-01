"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { User } from "@supabase/supabase-js";
import { Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { MobileNavSheet } from "@/components/nav/mobile-nav-sheet";
import { PRIMARY_NAV } from "@/lib/constants/nav";
import { cn } from "@/lib/utils";
import { NavTrigger } from "@/components/nav/nav-trigger";
import { MegaMenuPanel } from "@/components/nav/mega-menu-panel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const pillState = {
  top: 20,
  left: "50%",
  x: "-50%",
  width: "min(85vw, 900px)",
  borderRadius: 50,
  backgroundColor: "rgba(247, 242, 232, 0.92)",
  paddingTop: 10,
  paddingBottom: 10,
  paddingLeft: 24,
  paddingRight: 24,
  boxShadow: "0 8px 32px rgba(74, 19, 71, 0.12)",
};

const barState = {
  top: 0,
  left: 0,
  x: 0,
  width: "100%",
  borderRadius: 0,
  backgroundColor: "rgba(247, 242, 232, 0.95)",
  paddingTop: 14,
  paddingBottom: 14,
  paddingLeft: 32,
  paddingRight: 32,
  boxShadow: "0 1px 0 rgba(26, 15, 26, 0.08)",
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

export function SiteHeaderClient({ variant = "app", user }: SiteHeaderClientProps) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [focusFirstItemOnOpen, setFocusFirstItemOnOpen] = useState(false);

  const exploreWrapRef = useRef<HTMLDivElement>(null);
  const exploreTriggerRef = useRef<HTMLButtonElement>(null);
  const openTimers = useRef<Record<string, number>>({});
  const closeTimers = useRef<Record<string, number>>({});

  // Note: we map PRIMARY_NAV directly for rendering.

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 780);
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
    setOpenMenu(null);
  }, [pathname]);

  useEffect(() => {
    if (!openMenu) return;
    const onScroll = () => setOpenMenu(null);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [openMenu]);

  function clearNavTimers() {
    for (const id of Object.values(openTimers.current)) window.clearTimeout(id);
    for (const id of Object.values(closeTimers.current)) window.clearTimeout(id);
    openTimers.current = {};
    closeTimers.current = {};
  }

  function scheduleMenuOpen(label: string) {
    clearNavTimers();
    openTimers.current[label] = window.setTimeout(() => setOpenMenu(label), 100);
  }

  function scheduleMenuClose(label: string) {
    clearNavTimers();
    closeTimers.current[label] = window.setTimeout(() => {
      setOpenMenu((cur) => (cur === label ? null : cur));
    }, 150);
  }

  function onWrapperBlur(e: React.FocusEvent<HTMLDivElement>) {
    const next = e.relatedTarget as HTMLElement | null;
    if (!next) return;
    if (e.currentTarget.contains(next)) return;
    setOpenMenu(null);
  }

  const showPill =
    mounted && variant === "marketing" && !isScrolled && !isMobile;

  const spring = prefersReducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 280, damping: 30, mass: 0.8 };

  const initialState = variant === "marketing" ? pillState : barState;

  const hamburgerColor = "text-plum-700";

  const searchButtonClass =
    "h-10 w-10 shrink-0 text-plum-700 hover:bg-plum-50 hover:text-plum-700";

  const logoInner = (
    <>
      <span aria-hidden="true" className="h-2 w-2 rounded-sm bg-chartreuse-500" />
      <span className="font-serif text-lg font-medium tracking-tight text-plum-700">
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
          border: showPill
            ? "1px solid rgba(255, 255, 255, 0.5)"
            : "none",
          borderBottom: showPill
            ? "1px solid rgba(255, 255, 255, 0.5)"
            : "0.5px solid rgba(26, 15, 26, 0.08)",
        }}
        className="w-full overflow-visible"
      >
        {/* Mobile: search | logo | hamburger */}
        <div className="flex w-full items-center justify-between gap-3 md:hidden">
          <Button variant="ghost" size="icon" aria-label="Search" className={searchButtonClass}>
            <Search className="h-5 w-5" />
          </Button>
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500 focus-visible:ring-offset-2 focus-visible:ring-offset-parchment"
            aria-label="Impactify — home"
          >
            {logoInner}
          </Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open menu"
                className={cn("h-11 w-11 shrink-0", hamburgerColor)}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <MobileNavSheet user={user} />
          </Sheet>
        </div>

        {/* Desktop: three-column grid */}
        <div className="hidden w-full grid-cols-[1fr_auto_1fr] items-center gap-8 md:grid">
          <div className="flex min-w-0 items-center justify-start gap-6">
            <Button variant="ghost" size="icon" aria-label="Search" className={searchButtonClass}>
              <Search className="h-5 w-5" />
            </Button>
            <nav aria-label="Primary" className="relative flex shrink-0 items-center gap-6">
              {PRIMARY_NAV.map((item) => {
                if (item.type !== "menu") return null;
                const isOpen = openMenu === item.label;
                const panelId = `primary-menu-${item.label.toLowerCase()}`;
                const isActive = pathname.startsWith("/events") || pathname.startsWith("/news");

                return (
                  <div
                    key={item.label}
                    ref={exploreWrapRef}
                    className="relative"
                    onMouseEnter={() => scheduleMenuOpen(item.label)}
                    onMouseLeave={() => scheduleMenuClose(item.label)}
                    onBlur={onWrapperBlur}
                  >
                    <NavTrigger
                      label={item.label}
                      panelId={panelId}
                      isOpen={isOpen}
                      isActive={isActive}
                      triggerRef={exploreTriggerRef}
                      onOpenChange={(open, meta) => {
                        clearNavTimers();
                        setFocusFirstItemOnOpen(Boolean(meta?.fromArrowDown));
                        setOpenMenu(open ? item.label : null);
                      }}
                    />
                    <MegaMenuPanel
                      item={item}
                      panelId={panelId}
                      isOpen={isOpen}
                      wrapperRef={exploreWrapRef}
                      triggerRef={exploreTriggerRef}
                      onClose={() => setOpenMenu(null)}
                      user={user}
                      focusFirstItem={focusFirstItemOnOpen}
                    />
                  </div>
                );
              })}
            </nav>
          </div>

          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 justify-self-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500 focus-visible:ring-offset-2 focus-visible:ring-offset-parchment"
            aria-label="Impactify — home"
          >
            {logoInner}
          </Link>

          <div className="flex items-center justify-end gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-ink-muted hover:bg-plum-50 hover:text-plum-700"
                    aria-label="Account menu"
                  >
                    <Avatar className="size-9 border border-plum-100">
                      <AvatarFallback className="bg-plum-50 font-sans text-xs font-medium text-plum-700">
                        {userInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[12rem]">
                  <DropdownMenuLabel className="font-normal text-ink-muted">
                    {userLabel(user)}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <button
                      type="submit"
                      form="impactify-sign-out"
                      className="w-full cursor-pointer px-2 py-1.5 text-left text-sm text-ink hover:bg-plum-50"
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
                className="text-ink-muted hover:bg-transparent hover:text-plum-700"
              >
                <Link href="/auth/sign-in">Sign in</Link>
              </Button>
            )}
            <Button
              asChild
              className="rounded-full bg-chartreuse-500 px-5 font-medium text-ink hover:bg-chartreuse-700"
            >
              <Link href="/events/new">Start Event</Link>
            </Button>
          </div>
        </div>
      </motion.header>
    </>
  );
}
