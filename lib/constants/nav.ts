export interface NavItem {
  label: string;
  href: string;
  description?: string;
}

export type NavConfigItem = {
  label: string;
  href: string;
  description: string;
  isReady: boolean;
  launchDate?: string;
};

/**
 * Single source of truth for site navigation.
 * - Components should filter by `isReady` for production nav.
 * - Non-ready items must route to real pages (no 404s).
 */
export const NAV_ITEMS = [
  {
    label: "News",
    href: "/news",
    description: "Civic briefings & news",
    isReady: true,
  },
  {
    label: "Reps",
    href: "/reps",
    description: "Your representatives",
    isReady: true,
  },
] as const satisfies readonly NavConfigItem[];

export const COMING_SOON_ITEMS = [
  {
    label: "Event RSVP",
    href: "#cs-event-rsvp",
    description: "RSVP and get reminders for local civic events",
    isReady: false,
    launchDate: "Q3 2026",
  },
  {
    label: "Create an event",
    href: "#cs-event-create",
    description: "Host town halls, meetups, and rallies",
    isReady: false,
    launchDate: "Q3 2026",
  },
  {
    label: "Donations",
    href: "#cs-donations",
    description: "Support aligned causes with transparent receipts",
    isReady: false,
    launchDate: "Q4 2026",
  },
  {
    label: "Vote",
    href: "#cs-vote",
    description: "Ballot guidance and election-day checklists",
    isReady: false,
    launchDate: "Q2 2026",
  },
  {
    label: "Register to vote",
    href: "#cs-register",
    description: "Registration flows and status checks",
    isReady: false,
    launchDate: "Q2 2026",
  },
] as const satisfies readonly NavConfigItem[];

export const FOOTER_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Contact", href: "/contact" },
  { label: "Feedback", href: "/feedback" },
] as const satisfies readonly { label: string; href: string }[];

export type MegaNavLink = {
  label: string;
  href: string;
  description?: string;
  disabled?: boolean;
};

export type MegaNavGroup = {
  heading: string;
  links: readonly MegaNavLink[];
};

export type MegaNavFeatured = {
  eyebrow: string;
  title: string;
  href: string;
  tint: "chartreuse" | "peach" | "plum";
  /** Primary CTA label on the featured strip (defaults to “Explore” in the panel). */
  ctaLabel?: string;
};

export type PrimaryNavMenuItem = {
  label: string;
  type: "menu";
  groups: readonly MegaNavGroup[];
  featured: MegaNavFeatured;
};

export type PrimaryNavLinkItem = {
  label: string;
  href: string;
  type: "link";
  disabled?: boolean;
};

export type PrimaryNavItem = PrimaryNavLinkItem | PrimaryNavMenuItem;

export const PRIMARY_NAV = [
  {
    label: "Explore",
    type: "menu" as const,
    groups: [
      {
        heading: "News & briefing",
        links: [
          {
            label: "The Briefing",
            href: "/news",
            description: "AI-contextualized civic news and clarity reports",
          },
        ],
      },
      {
        heading: "Civic intelligence",
        links: [
          {
            label: "Voting info",
            href: "#cs-voting",
            description: "Registration, ballots, and polling — launching soon",
            disabled: true,
          },
        ],
      },
      {
        heading: "Coming soon",
        links: [
          {
            label: "Host community events",
            href: "#cs-host-events",
            description: "Create rallies, town halls, and meetups in your area",
            disabled: true,
          },
          {
            label: "Discover local actions",
            href: "#cs-local-actions",
            description: "A map of civic events near you",
            disabled: true,
          },
        ],
      },
      {
        heading: "Causes",
        links: [
          {
            label: "Climate Action",
            href: "/causes/climate-action",
            disabled: true,
          },
          {
            label: "Affordable Housing",
            href: "/causes/affordable-housing",
            disabled: true,
          },
          {
            label: "Protect Democracy",
            href: "/causes/protect-democracy",
            disabled: true,
          },
          {
            label: "Civil Rights",
            href: "/causes/civil-rights",
            disabled: true,
          },
          {
            label: "Public Education",
            href: "/causes/public-education",
            disabled: true,
          },
          {
            label: "Healthcare Access",
            href: "/causes/healthcare-access",
            disabled: true,
          },
          {
            label: "Immigration Support",
            href: "/causes/immigration-support",
            disabled: true,
          },
          {
            label: "Local Economy",
            href: "/causes/local-economy",
            disabled: true,
          },
        ],
      },
    ],
    featured: {
      eyebrow: "MVP",
      title: "Live news, AI briefing, and your reps in one place",
      href: "/news",
      tint: "chartreuse" as const,
      ctaLabel: "Read briefing",
    },
  },
] as const satisfies readonly PrimaryNavItem[];

export type PrimaryNavMenuItemFromConst = Extract<(typeof PRIMARY_NAV)[number], { type: "menu" }>;

/** Flat top-level links for legacy consumers */
export const LEGACY_NAV_ITEMS: NavItem[] = (() => {
  const first = PRIMARY_NAV[0];
  if (!first) return [];
  if (first.type !== "menu") return [];

  return first.groups.flatMap((g) =>
    g.links.flatMap((l) =>
      "disabled" in l && l.disabled
        ? []
        : [
            {
              label: l.label,
              href: l.href,
              description: "description" in l ? l.description : undefined,
            },
          ],
    ),
  );
})();

export const mainNavItems = LEGACY_NAV_ITEMS;

export const footerNavItems = {
  explore: [
    { label: "Feed", href: "/feed" },
    { label: "Events", href: "/events" },
    { label: "News", href: "/news" },
    { label: "Representatives", href: "/reps" },
  ],
  act: [
    { label: "Create event", href: "/events/new" },
    { label: "Find my reps", href: "/reps" },
    { label: "Vote tracker", href: "/vote-tracker" },
    { label: "Volunteer", href: "/volunteer" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy", href: "/privacy" },
  ],
  legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Cookies", href: "/cookies" },
  ],
};

export const socialLinks = [
  { label: "Twitter", href: "https://twitter.com/impactify", icon: "twitter" },
  { label: "GitHub", href: "https://github.com/impactify", icon: "github" },
  { label: "Email", href: "mailto:hello@impactify.example", icon: "email" },
];
