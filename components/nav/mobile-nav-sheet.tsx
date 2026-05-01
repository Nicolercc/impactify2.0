"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PRIMARY_NAV } from "@/lib/constants/nav";
import { cn } from "@/lib/utils";

export function MobileNavSheet({ user }: { user: User | null }) {
  const pathname = usePathname();

  return (
    <SheetContent
      side="right"
      className="flex w-[85vw] flex-col border-l border-plum-100 bg-parchment p-0 sm:max-w-sm"
    >
      <SheetHeader className="border-b border-plum-100 px-6 pb-4 pt-6">
        <SheetTitle className="flex items-center gap-2 text-left">
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-sm bg-chartreuse-500"
          />
          <span className="font-serif text-lg font-medium text-plum-700">
            Impactify
          </span>
        </SheetTitle>
      </SheetHeader>

      <nav
        aria-label="Mobile primary"
        className="flex flex-1 flex-col overflow-y-auto px-4 py-4"
      >
        <Accordion type="single" collapsible className="w-full">
          {PRIMARY_NAV.map((entry) => {
            if (entry.type !== "menu") return null;
            return (
              <AccordionItem key={entry.label} value={entry.label} className="border-0">
                <AccordionTrigger className="px-2 py-3 text-base font-medium text-plum-700 hover:no-underline">
                  {entry.label}
                </AccordionTrigger>
                <AccordionContent className="pb-2">
                  <div className="space-y-6 px-2">
                    {entry.groups.map((group) => (
                      <div key={group.heading}>
                        <div className="font-sans text-eyebrow font-semibold uppercase tracking-widest text-ink-muted">
                          {group.heading}
                        </div>
                        <div className="mt-2 space-y-1">
                          {group.links.map((link) => {
                            if ("disabled" in link && link.disabled) {
                              return (
                                <span
                                  key={link.href}
                                  aria-disabled="true"
                                  className="block cursor-not-allowed px-3 py-2 text-base font-medium text-ink-muted/40 select-none"
                                >
                                  {link.label}
                                </span>
                              );
                            }

                            const isActive =
                              pathname === link.href || pathname.startsWith(`${link.href}/`);

                            return (
                              <SheetClose key={link.href} asChild>
                                <Link
                                  href={link.href}
                                  aria-current={isActive ? "page" : undefined}
                                  className="block rounded-lg p-3 -mx-1 transition-colors hover:bg-plum-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500"
                                >
                                  <span className="font-medium text-plum-700">{link.label}</span>
                                  {"description" in link && link.description ? (
                                    <span className="mt-0.5 block text-caption text-ink-muted">
                                      {link.description}
                                    </span>
                                  ) : null}
                                </Link>
                              </SheetClose>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </nav>

      <Separator className="bg-plum-100" />

      <div className="flex flex-col gap-3 px-6 py-5">
        {user ? (
          <SheetClose asChild>
            <Button
              type="submit"
              form="impactify-sign-out"
              variant="outline"
              className="w-full border-plum-700 text-plum-700 hover:bg-plum-50"
            >
              Sign out
            </Button>
          </SheetClose>
        ) : (
          <SheetClose asChild>
            <Button
              variant="outline"
              asChild
              className="w-full border-plum-700 text-plum-700 hover:bg-plum-50"
            >
              <Link href="/auth/sign-in">Sign in</Link>
            </Button>
          </SheetClose>
        )}
        <SheetClose asChild>
          <Button
            asChild
            className="w-full bg-chartreuse-500 font-medium text-ink hover:bg-chartreuse-700"
          >
            <Link href="/events/new">Start Event</Link>
          </Button>
        </SheetClose>
      </div>
    </SheetContent>
  );
}
