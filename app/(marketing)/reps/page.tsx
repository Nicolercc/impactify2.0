import type { Metadata } from "next";
import { buildCaliforniaLandingReps } from "@/lib/reps/build-landing-reps";
import { MOCK_REPS } from "@/lib/reps/mock-data";
import type { Rep } from "@/lib/reps/types";
import { RepsDirectory } from "@/components/reps/reps-directory";

export const metadata: Metadata = {
	title: "Find your representatives | Impactify",
	description:
		"Browse federal representatives, voting records, and alignment with the issues you care about.",
};

export default async function RepsDirectoryPage({
	searchParams,
}: {
	searchParams: Promise<{ zip?: string }>;
}) {
	const sp = await searchParams;
	const zip = sp.zip?.trim();
	const key = process.env.PROPUBLICA_API_KEY?.trim();

	let reps: Rep[] = MOCK_REPS;
	let isExample = true;
	let dataNote: string | undefined =
		"(Example dataset — set PROPUBLICA_API_KEY for live members and votes.)";

	if (key) {
		try {
			reps = await buildCaliforniaLandingReps(key);
			isExample = false;
			dataNote = undefined;
		} catch {
			reps = MOCK_REPS;
			isExample = true;
			dataNote = "Live data unavailable; showing an example dataset.";
		}
	}

	return (
		<RepsDirectory
			initialZip={zip ?? null}
			reps={reps}
			isExample={isExample}
			dataNote={dataNote}
		/>
	);
}
