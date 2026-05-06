export const CAUSE_TO_GUARDIAN: Record<
  string,
  {
    section?: string;
    tag?: string;
    q?: string;
  }
> = {
  "climate-action": { section: "environment", tag: "environment/climate-change" },
  "affordable-housing": { section: "society", q: "affordable housing" },
  "healthcare-access": { section: "society", q: "healthcare access" },
  "immigration-support": { section: "world", q: "immigration policy" },
  "public-education": { section: "education" },
  "civil-rights": { section: "law", q: "civil rights" },
  "protect-democracy": { section: "us-news", q: "democracy voting rights" },
  "local-economy": { section: "business", q: "local economy workers" },
};

export const DEFAULT_GUARDIAN_SECTION = "us-news";

