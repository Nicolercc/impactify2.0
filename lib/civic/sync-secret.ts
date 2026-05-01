import { timingSafeEqual } from "node:crypto";

export function verifySyncSecret(
  headerValue: string | null | undefined,
  expectedSecret: string | undefined,
): boolean {
  if (!expectedSecret || !headerValue) return false;
  const a = Buffer.from(headerValue.trim(), "utf8");
  const b = Buffer.from(expectedSecret.trim(), "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
