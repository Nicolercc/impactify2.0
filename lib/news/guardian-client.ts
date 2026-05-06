"use server";

const BASE_URL = "https://content.guardianapis.com";

export type GuardianArticle = {
  id: string;
  webTitle: string;
  webUrl: string;
  webPublicationDate: string;
  sectionId: string;
  sectionName: string;
  fields: {
    trailText?: string;
    byline?: string;
    thumbnail?: string;
    bodyText?: string;
  };
};

export type GuardianSearchParams = {
  section?: string;
  q?: string;
  tag?: string;
  page?: number;
  pageSize?: number;
};

type GuardianSearchResponse = {
  response?: {
    status?: string;
    results?: GuardianArticle[];
  };
};

type GuardianContentResponse = {
  response?: {
    status?: string;
    content?: GuardianArticle;
  };
};

function getApiKey(): string | null {
  const key = process.env.GUARDIAN_API_KEY;
  if (!key) return null;
  const trimmed = key.trim();
  return trimmed.length ? trimmed : null;
}

function makeUrl(pathname: string, params: Record<string, string>) {
  const url = new URL(pathname, BASE_URL);
  for (const [k, v] of Object.entries(params)) {
    if (v) url.searchParams.set(k, v);
  }
  return url;
}

function getDefaultFields() {
  return "thumbnail,trailText,byline,bodyText";
}

function normalizePath(path: string) {
  const trimmed = path.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("/") ? trimmed.slice(1) : trimmed;
}

export async function fetchGuardianArticles(params: GuardianSearchParams): Promise<GuardianArticle[]> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("GUARDIAN_API_KEY not set");
    return [];
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    const pageSize = String(params.pageSize ?? 20);
    const url = makeUrl("/search", {
      "api-key": apiKey,
      "show-fields": getDefaultFields(),
      "page-size": pageSize,
      "order-by": "newest",
      section: params.section ?? "",
      q: params.q ?? "",
      tag: params.tag ?? "",
      page: params.page ? String(params.page) : "",
    });

    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      next: { revalidate: 3600 },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.error("[guardian] /search non-200", res.status);
      return [];
    }

    const json = (await res.json()) as GuardianSearchResponse;
    return json.response?.results ?? [];
  } catch (err) {
    console.error("[guardian] /search error", err);
    return [];
  }
}

export async function fetchGuardianArticleByPath(path: string): Promise<GuardianArticle | null> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("GUARDIAN_API_KEY not set");
    return null;
  }

  const normalized = normalizePath(path);
  if (!normalized) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    const url = makeUrl(`/${normalized}`, {
      "api-key": apiKey,
      "show-fields": getDefaultFields(),
    });

    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      next: { revalidate: 3600 },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.error("[guardian] content non-200", res.status);
      return null;
    }

    const json = (await res.json()) as GuardianContentResponse;
    return json.response?.content ?? null;
  } catch (err) {
    console.error("[guardian] content error", err);
    return null;
  }
}

