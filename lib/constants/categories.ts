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
