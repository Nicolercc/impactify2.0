import {
  Newspaper,
  Calendar,
  Plus,
  HeartHandshake,
  Compass,
  Vote,
  Leaf,
  Home,
  HeartPulse,
  Plane,
  GraduationCap,
  Scale,
  Landmark,
  Flame,
  ShieldCheck,
  Gavel,
  Handshake,
  LockKeyhole,
  BriefcaseBusiness,
  TrendingUp,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ActionCategory {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
}

export const actionCategories: ActionCategory[] = [
  {
    id: "news",
    title: "Read News",
    description: "Stay informed with AI-powered briefings on global issues.",
    icon: Newspaper,
    href: "/news",
  },
  {
    id: "events",
    title: "Attend Events",
    description: "Discover local gatherings and community actions near you.",
    icon: Calendar,
    href: "/events",
  },
  {
    id: "create",
    title: "Create Event",
    description: "Organize your own rally, workshop, or community meetup.",
    icon: Plus,
    href: "/events/create",
  },
  {
    id: "donate",
    title: "Donate",
    description: "Support verified nonprofits making real change.",
    icon: HeartHandshake,
    href: "/donate",
  },
  {
    id: "causes",
    title: "Discover Causes",
    description: "Find movements aligned with your values and passions.",
    icon: Compass,
    href: "/causes",
  },
  {
    id: "vote",
    title: "Vote & Register",
    description: "Check your registration and find your polling place.",
    icon: Vote,
    href: "/vote",
  },
];

export const eventCategories = [
  { id: "rally", label: "Rally", color: "plum" },
  { id: "workshop", label: "Workshop", color: "sage-400" },
  { id: "fundraiser", label: "Fundraiser", color: "peach-600" },
  { id: "volunteer", label: "Volunteer", color: "chartreuse" },
  { id: "townhall", label: "Town Hall", color: "plum" },
  { id: "protest", label: "Protest", color: "peach-600" },
];

/** Onboarding “what causes do you care about?” — ids align with profile interests / cause slugs. */
export interface OnboardingCauseChip {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const onboardingCauseChips: OnboardingCauseChip[] = [
  { id: "climate", label: "Climate Action", icon: Leaf },
  { id: "housing", label: "Affordable Housing", icon: Home },
  { id: "healthcare", label: "Healthcare Access", icon: HeartPulse },
  { id: "immigration", label: "Immigration Support", icon: Plane },
  { id: "education", label: "Public Education", icon: GraduationCap },
  { id: "civil_rights", label: "Civil Rights", icon: Scale },
  { id: "democracy", label: "Protect Democracy", icon: Vote },
  { id: "economy", label: "Local Economy", icon: Landmark },
];

/** Seeded cause UUIDs (local seed) — used for event create cause tags until dynamic cause fetch exists. */
export const CAUSES = [
  {
    id: "10000000-0000-0000-0000-000000000001",
    slug: "climate-action",
    title: "Climate Action",
    icon: "Leaf",
    category: "climate",
  },
  {
    id: "10000000-0000-0000-0000-000000000002",
    slug: "affordable-housing",
    title: "Affordable Housing",
    icon: "Home",
    category: "housing",
  },
  {
    id: "10000000-0000-0000-0000-000000000003",
    slug: "healthcare-access",
    title: "Healthcare Access",
    icon: "Heart",
    category: "healthcare",
  },
  {
    id: "10000000-0000-0000-0000-000000000004",
    slug: "immigration-support",
    title: "Immigration Support",
    icon: "Globe",
    category: "immigration",
  },
  {
    id: "10000000-0000-0000-0000-000000000005",
    slug: "public-education",
    title: "Public Education",
    icon: "BookOpen",
    category: "education",
  },
  {
    id: "10000000-0000-0000-0000-000000000006",
    slug: "civil-rights",
    title: "Civil Rights",
    icon: "Shield",
    category: "civil_rights",
  },
  {
    id: "10000000-0000-0000-0000-000000000007",
    slug: "protect-democracy",
    title: "Protect Democracy",
    icon: "Vote",
    category: "democracy",
  },
  {
    id: "10000000-0000-0000-0000-000000000008",
    slug: "local-economy",
    title: "Local Economy",
    icon: "TrendingUp",
    category: "economy",
  },
] as const;

export type CategoryPriority = "tier1" | "tier2" | "tier3";

export type NewsCategory = {
  id: string; // kebab-case
  label: string;
  color: string; // hex
  icon: LucideIcon;
  description: string;
  priority: CategoryPriority;
};

const DEFAULT_COLOR = "#e8e8e8";

export const NEWS_CATEGORIES: NewsCategory[] = [
  {
    id: "all",
    label: "All",
    color: DEFAULT_COLOR,
    icon: Newspaper,
    description: "All stories across Impactify’s coverage.",
    priority: "tier1",
  },
  {
    id: "trending",
    label: "Trending",
    color: DEFAULT_COLOR,
    icon: Flame,
    description: "The most discussed stories right now.",
    priority: "tier1",
  },
  {
    id: "climate-action",
    label: "Climate Action",
    color: "#7ba428",
    icon: Leaf,
    description: "Climate, energy, resilience, environmental policy.",
    priority: "tier1",
  },
  {
    id: "reproductive-rights",
    label: "Reproductive Rights",
    color: "#e8a0c4",
    icon: ShieldCheck,
    description: "Abortion access, reproductive healthcare, autonomy.",
    priority: "tier1",
  },
  {
    id: "voting-rights",
    label: "Voting Rights",
    color: "#6b3b5c",
    icon: Vote,
    description: "Elections, democracy, access, voting policy.",
    priority: "tier1",
  },
  {
    id: "racial-justice",
    label: "Racial Justice",
    color: "#8b4c6b",
    icon: Users,
    description: "Civil rights, equity, discrimination, justice reform.",
    priority: "tier1",
  },
  {
    id: "affordable-housing",
    label: "Affordable Housing",
    color: DEFAULT_COLOR,
    icon: Home,
    description: "Rent, housing supply, homelessness, tenant rights.",
    priority: "tier1",
  },
  // Tier 2
  {
    id: "immigration",
    label: "Immigration",
    color: "#6b8e23",
    icon: Plane,
    description: "Immigration policy, asylum, border, migration.",
    priority: "tier2",
  },
  {
    id: "criminal-justice",
    label: "Criminal Justice",
    color: "#3d2633",
    icon: Gavel,
    description: "Courts, policing, incarceration, public safety policy.",
    priority: "tier2",
  },
  {
    id: "elite-accountability",
    label: "Elite Accountability",
    color: "#d4849a",
    icon: Scale,
    description: "Corruption, transparency, ethics, power & oversight.",
    priority: "tier2",
  },
  {
    id: "healthcare-access",
    label: "Healthcare Access",
    color: DEFAULT_COLOR,
    icon: HeartPulse,
    description: "Coverage, affordability, public health, care delivery.",
    priority: "tier2",
  },
  {
    id: "labor-rights",
    label: "Labor Rights",
    color: "#8b6f47",
    icon: Handshake,
    description: "Workplace rights, unions, wages, worker protections.",
    priority: "tier2",
  },
  {
    id: "tech-privacy",
    label: "Tech & Privacy",
    color: "#c9a8d4",
    icon: LockKeyhole,
    description: "Surveillance, platforms, AI, data rights, cybersecurity.",
    priority: "tier2",
  },
  {
    id: "local-economy",
    label: "Local Economy",
    color: DEFAULT_COLOR,
    icon: BriefcaseBusiness,
    description: "Jobs, inflation, small business, regional economics.",
    priority: "tier2",
  },
  // Tier 3
  {
    id: "public-education",
    label: "Public Education",
    color: DEFAULT_COLOR,
    icon: GraduationCap,
    description: "Schools, funding, curriculum, student outcomes.",
    priority: "tier3",
  },
] as const;

export const NEWS_CATEGORY_BY_ID: Record<string, NewsCategory> = Object.fromEntries(
  NEWS_CATEGORIES.map((c) => [c.id, c]),
);

export function sortNewsCategoriesForDisplay(categories: NewsCategory[]): NewsCategory[] {
  const tierRank: Record<CategoryPriority, number> = { tier1: 0, tier2: 1, tier3: 2 };
  const sorted = [...categories].sort((a, b) => {
    const tr = tierRank[a.priority] - tierRank[b.priority];
    if (tr !== 0) return tr;
    // Tier 1: All, Trending, then alphabetical
    if (a.priority === "tier1" && b.priority === "tier1") {
      const tier1Order = (id: string) => (id === "all" ? 0 : id === "trending" ? 1 : 2);
      const o = tier1Order(a.id) - tier1Order(b.id);
      if (o !== 0) return o;
    }
    return a.label.localeCompare(b.label);
  });
  return sorted;
}
