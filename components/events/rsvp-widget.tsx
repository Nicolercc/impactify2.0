"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";
import { ChevronDown, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { cancelRsvp, rsvpToEvent } from "@/app/actions/events";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type RsvpStatus = "going" | "interested" | "waitlist" | "cancelled";

type RsvpWidgetProps = {
  eventId: string;
  eventTitle: string;
  initialStatus: RsvpStatus | null;
  isSignedIn: boolean;
};

export function RsvpWidget({
  eventId,
  eventTitle,
  initialStatus,
  isSignedIn,
}: RsvpWidgetProps) {
  const router = useRouter();
  const [status, setStatus] = useState<RsvpStatus | null>(initialStatus);
  const [isPending, startTransition] = useTransition();

  const active = status && status !== "cancelled" ? status : null;

  async function apply(next: RsvpStatus | "clear") {
    const previous = status;
    if (next === "clear") {
      setStatus(null);
      startTransition(async () => {
        const { error } = await cancelRsvp(eventId);
        if (error) {
          setStatus(previous);
          toast.error(error.message);
          return;
        }
        toast.success("RSVP removed.");
        router.refresh();
      });
      return;
    }

    setStatus(next);
    startTransition(async () => {
      const { error } = await rsvpToEvent(eventId, next);
      if (error) {
        setStatus(previous);
        toast.error(error.message);
        return;
      }
      toast.success(
        next === "going"
          ? "You’re going!"
          : next === "interested"
            ? "Saved as interested."
            : next === "waitlist"
              ? "You’re on the waitlist."
              : "RSVP updated.",
      );
      router.refresh();
    });
  }

  if (!isSignedIn) {
    return (
      <Button
        asChild
        className="h-11 w-full bg-plum-700 font-medium text-parchment hover:bg-plum-500"
      >
        <Link href="/auth/sign-in">Sign in to RSVP</Link>
      </Button>
    );
  }

  return (
    <div className="space-y-3">
      {!active ? (
        <>
          <Button
            type="button"
            disabled={isPending}
            onClick={() => void apply("going")}
            className="h-11 w-full bg-chartreuse-500 font-medium text-ink hover:bg-chartreuse-700"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Users className="size-4" aria-hidden />
            )}
            Going
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => void apply("interested")}
            className="h-11 w-full border-plum-700 text-plum-700 hover:bg-plum-50"
          >
            Interested
          </Button>
        </>
      ) : (
        <div className="space-y-2">
          <div
            className={cn(
              "rounded-lg border border-plum-100 bg-plum-50 px-3 py-2 text-center text-sm font-medium text-plum-700",
            )}
          >
            You&apos;re{" "}
            {active === "going"
              ? "going"
              : active === "interested"
                ? "interested"
                : "on the waitlist"}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                className="h-10 w-full justify-between border-plum-100 text-ink"
              >
                Change RSVP
                <ChevronDown className="size-4 opacity-70" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[12rem]">
              <DropdownMenuItem
                disabled={isPending || active === "going"}
                onSelect={() => void apply("going")}
              >
                Going
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={isPending || active === "interested"}
                onSelect={() => void apply("interested")}
              >
                Interested
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={isPending || active === "waitlist"}
                onSelect={() => void apply("waitlist")}
              >
                Waitlist
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={isPending}
                className="text-peach-600 focus:text-peach-600"
                onSelect={() => void apply("clear")}
              >
                Cancel RSVP
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        RSVP for {eventTitle}
      </p>
    </div>
  );
}
