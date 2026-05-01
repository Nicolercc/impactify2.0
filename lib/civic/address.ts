import { createHash } from "node:crypto";

const ABBREV: Record<string, string> = {
  st: "street",
  "st.": "street",
  ave: "avenue",
  "ave.": "avenue",
  blvd: "boulevard",
  "blvd.": "boulevard",
  rd: "road",
  "rd.": "road",
  dr: "drive",
  "dr.": "drive",
  ln: "lane",
  "ln.": "lane",
  apt: "apartment",
};

/**
 * Trim, lowercase, collapse whitespace, expand a few common street tokens.
 */
export function normalizeAddress(raw: string): string {
  let s = raw.trim().toLowerCase().replace(/\s+/g, " ");
  for (const [k, v] of Object.entries(ABBREV)) {
    const re = new RegExp(`\\b${k.replace(".", "\\.")}\\b`, "g");
    s = s.replace(re, v);
  }
  return s.trim();
}

export function hashAddress(address: string): string {
  const normalized = normalizeAddress(address);
  return createHash("sha256").update(normalized, "utf8").digest("hex");
}
