"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { CurvedTop } from "@/components/decorative/curved-top";
import { EventCard, type EventCardData } from "@/components/events/event-card";
import { useUserLocation } from "@/hooks/useUserLocation";
import { cn } from "@/lib/utils";

const featuredEvents: EventCardData[] = [
	{
		title: "Sunrise March for Climate Justice",
		slug: "prospect-park-cleanup",
		startsAt: "2026-04-19T09:00:00.000Z",
		city: "Portland",
		state: "OR",
		isVirtual: false,
		coverImageUrl:
			"https://images.unsplash.com/photo-1573164713988-8665fc963095?w=1600&q=80",
		category: "rally",
		causes: [{ title: "Climate Action", slug: "climate-action" }],
	},
	{
		title: "Neighborhood Housing Town Hall",
		slug: "tenant-rights-101",
		startsAt: "2026-04-20T18:30:00.000Z",
		city: "Minneapolis",
		state: "MN",
		isVirtual: false,
		coverImageUrl:
			"https://images.unsplash.com/photo-1569025690938-a00729c9e1f9?w=1600&q=80",
		category: "townhall",
		causes: [{ title: "Affordable Housing", slug: "affordable-housing" }],
	},
	{
		title: "Civic Literacy Workshop: Know Your Ballot",
		slug: "virtual-phonebank",
		startsAt: "2026-04-21T17:00:00.000Z",
		city: "Atlanta",
		state: "GA",
		isVirtual: false,
		coverImageUrl:
			"https://images.unsplash.com/photo-1591622180774-04d2b6fc3de6?w=1600&q=80",
		category: "workshop",
		causes: [{ title: "Protect Democracy", slug: "protect-democracy" }],
	},
	{
		title: "Protect the Vote — Early Voting Line Celebration",
		slug: "school-board-forum",
		startsAt: "2026-04-22T12:00:00.000Z",
		city: "Houston",
		state: "TX",
		isVirtual: false,
		coverImageUrl:
			"https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=1600&q=80",
		category: "volunteer",
		causes: [{ title: "Protect Democracy", slug: "protect-democracy" }],
	},
	{
		title: "Speakers Corner: Reproductive Rights Briefing",
		slug: "immigration-clinic",
		startsAt: "2026-04-23T19:00:00.000Z",
		city: "Chicago",
		state: "IL",
		isVirtual: true,
		coverImageUrl:
			"https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1600&q=80",
		category: "townhall",
		causes: [{ title: "Civil Rights", slug: "civil-rights" }],
	},
	{
		title: "City Council Debate Watch Party",
		slug: "democracy-meetup",
		startsAt: "2026-04-24T20:00:00.000Z",
		city: "Philadelphia",
		state: "PA",
		isVirtual: false,
		coverImageUrl:
			"https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=1600&q=80",
		category: "protest",
		causes: [{ title: "Local Economy", slug: "local-economy" }],
	},
];

/** Matches EyebrowBadge chartreuse pill (tone default); `normal-case` for place names. */
const locationPillClass =
	"inline-flex min-h-[1.75rem] min-w-0 max-w-[min(90vw,22rem)] items-center justify-center rounded-full px-3 py-1 font-sans text-eyebrow font-medium normal-case tracking-wide bg-chartreuse-500 text-ink";

function EventsPreviewLocationPill() {
	const { label, loading, error } = useUserLocation();

	if (loading) {
		return (
			<span
				className={cn(
					locationPillClass,
					"min-w-20 cursor-wait bg-chartreuse-500/45 text-transparent select-none",
				)}
				aria-busy="true"
				aria-label="Detecting your area"
			>
				&nbsp;
			</span>
		);
	}

	const text = label && !error ? `📍 ${label}` : "📍 Events Near You";

	return (
		<span className={cn(locationPillClass, "text-center")} title={text}>
			<span className="truncate">{text}</span>
		</span>
	);
}

export function EventsPreview() {
	const scrollRef = useRef<HTMLDivElement>(null);

	function scroll(dir: "left" | "right") {
		const amount = dir === "left" ? -400 : 400;
		scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
	}

	return (
		<CurvedTop
			bg="parchment"
			id="events"
			className="scroll-mt-20"
			overlapInsetPx={29}
		>
			<div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
				<div className="mx-auto max-w-2xl text-center">
					<div className="flex flex-col items-center gap-3 sm:gap-4">
						{/* <div className="flex justify-center">
							<EventsPreviewLocationPill />
						</div> */}

						<h2 className="font-serif text-[32px] font-semibold leading-[1.1] tracking-[-0.025em] text-plum-700 md:text-[40px] lg:text-[52px]">
							Events near you,
							<br />
							<em className="font-serif font-semibold italic text-chartreuse-700">
								causes that matter.
							</em>
						</h2>

						<div className="flex flex-col gap-2">
							<p className="font-dm-sans-stack mx-auto max-w-[38rem] text-[1.0625rem] leading-[1.55] text-ink-muted md:text-[1.125rem]">
								Real actions, real people, this week. Find a march, a town hall, a
								phone bank, a community dinner.
							</p>

							<p className="font-dm-sans-stack mx-auto max-w-[38rem] text-center text-[13px] font-medium leading-snug text-chartreuse-700">
								{/* TODO: wire to real event count + user location */}
								↳ 127 events happening in NYC this week
							</p>
						</div>
					</div>
				</div>

				<div className="relative mt-8 md:mt-10">
					<button
						type="button"
						aria-label="Scroll carousel left"
						onClick={() => scroll("left")}
						className="absolute left-[-24px] top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-plum-100 bg-parchment text-plum-700 shadow-[0_4px_16px_rgba(74,19,71,0.12)] transition-all hover:scale-105 hover:bg-plum-700 hover:text-parchment md:flex"
					>
						<ChevronLeft className="h-5 w-5" />
					</button>
					<button
						type="button"
						aria-label="Scroll carousel right"
						onClick={() => scroll("right")}
						className="absolute right-[-24px] top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-plum-100 bg-parchment text-plum-700 shadow-[0_4px_16px_rgba(74,19,71,0.12)] transition-all hover:scale-105 hover:bg-plum-700 hover:text-parchment md:flex"
					>
						<ChevronRight className="h-5 w-5" />
					</button>
					<div
						ref={scrollRef}
						className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 pt-0 [-ms-overflow-style:none]"
					>
						{featuredEvents.map((event) => (
							<div
								key={event.slug}
								className="w-[min(88vw,320px)] shrink-0 snap-start"
							>
								<EventCard {...event} />
							</div>
						))}
					</div>
				</div>

				<div className="mt-8 flex justify-center md:mt-10">
					<Link
						href="/events"
						className="inline-flex items-center gap-2 border-b border-plum-700 pb-1 font-medium text-plum-700 hover:border-chartreuse-500 hover:text-chartreuse-700"
					>
						Browse all events
						<ArrowRight className="h-4 w-4" />
					</Link>
				</div>
			</div>
		</CurvedTop>
	);
}
