"use client";

import dynamic from "next/dynamic";

/**
 * Vercel Web Analytics — loaded only in production so `next dev` never has to
 * resolve `@vercel/analytics/next` (avoids 500s when the package is missing or
 * Turbopack mis-resolves the subpath in the server layout graph).
 */
const Analytics = dynamic(
	() => import("@vercel/analytics/next").then((m) => m.Analytics),
	{ ssr: false },
);

export function VercelAnalytics() {
	if (process.env.NODE_ENV !== "production") return null;
	return <Analytics />;
}
