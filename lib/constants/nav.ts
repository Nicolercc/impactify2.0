export interface NavItem {
  label: string;
  href: string;
  description?: string;
}

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
        heading: "Events",
        links: [
          {
            label: "Browse all events",
            href: "/events",
            description: "Rallies, town halls, workshops near you",
          },
          {
            label: "Start an event",
            href: "/events/new",
            description: "Organize a rally, workshop, or meetup",
          },
        ],
      },
      {
        heading: "News",
        links: [
          {
            label: "The Briefing",
            href: "/news",
            description: "AI-contextualized civic news",
          },
        ],
      },
      {
        heading: "Civic Intelligence",
        links: [
          {
            label: "Your reps",
            href: "/reps",
            description: "Find and follow your representatives",
            disabled: true,
          },
          {
            label: "Voting info",
            href: "/voting",
            description: "Registration, ballots, polling places",
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
      eyebrow: "This week",
      title: "127 events near you",
      href: "/events",
      tint: "chartreuse" as const,
    },
  },
] as const satisfies readonly PrimaryNavItem[];

export type PrimaryNavMenuItemFromConst = Extract<(typeof PRIMARY_NAV)[number], { type: "menu" }>;

/** Flat top-level links for legacy consumers */
export const NAV_ITEMS: NavItem[] = (() => {
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

export const mainNavItems = NAV_ITEMS;

export const footerNavItems = {
  explore: [
    { label: "Feed", href: "/feed" },
    { label: "Events", href: "/events" },
    { label: "News", href: "/news" },
    { label: "Causes", href: "/causes" },
  ],
  act: [
    { label: "Create Event", href: "/events/new" },
    { label: "Find Reps", href: "/reps" },
    { label: "Vote", href: "/voting" },
    { label: "Donate", href: "/donate" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
    { label: "Careers", href: "/careers" },
  ],
  legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
};

export const socialLinks = [
  { label: "Twitter", href: "https://twitter.com/impactify", icon: "twitter" },
  { label: "Instagram", href: "https://instagram.com/impactify", icon: "instagram" },
  { label: "LinkedIn", href: "https://linkedin.com/company/impactify", icon: "linkedin" },
];
