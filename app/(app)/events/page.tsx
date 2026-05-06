import { GrainOverlay } from "@/components/decorative/grain-overlay";
import { EventsDiscovery } from "@/components/events/events-discovery";
import { fetchPublishedUpcomingEvents } from "@/lib/events/queries";

export default async function EventsPage() {
  const events = await fetchPublishedUpcomingEvents();

  return (
    <>
      <section className="relative overflow-hidden bg-plum-900 py-14 md:py-20">
        <GrainOverlay />
        <div className="relative mx-auto max-w-[1152px] px-6 md:px-12 lg:px-16">
          <p className="font-sans text-eyebrow uppercase tracking-[0.12em] text-parchment/50 font-medium">
            Events
          </p>

          <h1 className="mt-5 max-w-2xl font-serif text-[2.5rem] leading-[1.05] tracking-[-0.025em] text-parchment md:text-[3.25rem]">
            This week in{" "}
            <em className="font-serif italic text-chartreuse-300">civic action</em>.
          </h1>

          <p className="mt-4 max-w-xl text-[1.0625rem] leading-[1.65] text-parchment/75">
            Every rally, town hall, and teach-in in your region. Organized. Filtered. Attendable.
          </p>

          <p className="mt-6 font-sans text-sm font-medium text-parchment/50 tracking-wide">
            Civic events across New York — updated daily
          </p>
        </div>
      </section>

      <div className="relative z-10 -mt-6 rounded-t-[2.5rem] bg-parchment pb-16 pt-8">
        <div className="border-t border-parchment/10" />
        <EventsDiscovery events={events} />
      </div>
    </>
  );
}
