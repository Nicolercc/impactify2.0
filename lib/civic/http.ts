export type CivicApiErrorKind = "rate_limit" | "timeout" | "not_found" | "unknown";

export type CivicApiError = { kind: CivicApiErrorKind; message: string; status?: number };

const DEFAULT_TIMEOUT_MS = 10_000;

function classifyResponse(status: number, statusText: string): CivicApiError {
  if (status === 404) {
    return { kind: "not_found", message: statusText || "Not found", status };
  }
  if (status === 429) {
    return { kind: "rate_limit", message: statusText || "Too many requests", status };
  }
  return { kind: "unknown", message: `${status} ${statusText}`.trim(), status };
}

function isRetryableHttpStatus(status: number): boolean {
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

function isRetryableError(err: CivicApiError): boolean {
  if (err.kind === "rate_limit" || err.kind === "timeout") return true;
  if (err.status !== undefined && isRetryableHttpStatus(err.status)) return true;
  return false;
}

async function fetchOnce(
  url: string,
  init: Omit<RequestInit, "signal"> & { signal: AbortSignal },
): Promise<Response | CivicApiError> {
  try {
    return await fetch(url, { ...init, signal: init.signal });
  } catch (e) {
    const name = e instanceof Error ? e.name : "";
    const message = e instanceof Error ? e.message : String(e);
    if (name === "AbortError") {
      return { kind: "timeout", message: "Request timed out" };
    }
    return { kind: "unknown", message };
  }
}

/**
 * JSON GET/POST with 10s timeout and one retry on transient failures.
 */
export async function civicFetchJson<T>(options: {
  url: string;
  init?: Omit<RequestInit, "signal">;
  timeoutMs?: number;
  parse: (data: unknown) => T;
}): Promise<{ ok: true; data: T } | { ok: false; error: CivicApiError }> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const headers = new Headers(options.init?.headers);

  const run = async (): Promise<{ ok: true; data: T } | { ok: false; error: CivicApiError }> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetchOnce(options.url, {
        ...options.init,
        headers,
        signal: controller.signal,
      });
      if ("kind" in res) {
        return { ok: false, error: res };
      }
      if (!res.ok) {
        return { ok: false, error: classifyResponse(res.status, res.statusText) };
      }
      let raw: unknown;
      try {
        raw = await res.json();
      } catch {
        return { ok: false, error: { kind: "unknown", message: "Invalid JSON body" } };
      }
      try {
        return { ok: true, data: options.parse(raw) };
      } catch (e) {
        const message = e instanceof Error ? e.message : "Parse failed";
        return { ok: false, error: { kind: "unknown", message } };
      }
    } finally {
      clearTimeout(timer);
    }
  };

  const first = await run();
  if (first.ok) return first;
  if (isRetryableError(first.error)) {
    return run();
  }
  return first;
}
