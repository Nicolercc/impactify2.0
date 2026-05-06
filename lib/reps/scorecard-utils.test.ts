import { describe, expect, it } from "vitest";
import { overallAlignment, topAlignedCauses } from "./scorecard-utils";
import type { CauseKey, Rep } from "./types";

const baseRep: Rep = {
	id: "t",
	name: "Sen. Test",
	state: "California",
	party: "Democrat",
	chamber: "U.S. SENATE",
	initials: "TT",
	accent: "#000",
	aligned: {
		climate: 80,
		housing: 60,
		democracy: 100,
		labor: 0,
		health: 50,
	},
	votes: [],
};

describe("topAlignedCauses", () => {
	it("returns top scores among active causes", () => {
		const active = new Set<CauseKey>(["climate", "housing", "democracy"]);
		const got = topAlignedCauses(baseRep, active, 2);
		expect(got).toEqual([
			{ key: "democracy", value: 100 },
			{ key: "climate", value: 80 },
		]);
	});
});

describe("overallAlignment", () => {
	it("returns 0 when no causes are active", () => {
		expect(overallAlignment(baseRep, new Set())).toBe(0);
	});

	it("returns the mean of active cause scores (rounded)", () => {
		const active = new Set<CauseKey>(["climate", "housing"]);
		// (80 + 60) / 2 = 70
		expect(overallAlignment(baseRep, active)).toBe(70);
	});

	it("clamps to 0–100", () => {
		const rep: Rep = {
			...baseRep,
			aligned: { ...baseRep.aligned, labor: 999 },
		};
		const active = new Set<CauseKey>(["labor"]);
		expect(overallAlignment(rep, active)).toBe(100);
	});
});
