import Link from "next/link";
import { Newspaper, CalendarDays, Users } from "lucide-react";

const QUICK_LINKS = [
  {
    href: "/news",
    icon: Newspaper,
    label: "Read the news",
    description: "Civic briefings on the stories that matter",
  },
  {
    href: "/events",
    icon: CalendarDays,
    label: "Find events",
    description: "Local and virtual ways to take action",
  },
  {
    href: "/reps",
    icon: Users,
    label: "Your representatives",
    description: "Who speaks for you and their voting record",
  },
];

export default function FeedPage() {
  return (
    <div className="min-h-screen bg-parchment px-4 py-12 font-sans text-ink">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-serif text-4xl font-medium text-plum-700">Your Feed</h1>
        <p className="mt-3 text-base leading-relaxed text-ink-muted">
          Follow causes and topics to see personalized updates here. In the meantime, explore what&rsquo;s happening.
        </p>

        <ul className="mt-10 flex flex-col gap-4">
          {QUICK_LINKS.map(({ href, icon: Icon, label, description }) => (
            <li key={href}>
              <Link
                href={href}
                className="group flex items-center gap-5 rounded-2xl border border-plum-100 bg-card px-6 py-5 transition-shadow hover:shadow-md"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-plum-50 text-plum-600 transition-colors group-hover:bg-chartreuse-500 group-hover:text-ink">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="font-medium text-ink">{label}</span>
                  <span className="text-sm text-ink-muted">{description}</span>
                </span>
                <span className="ml-auto text-ink-muted transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
