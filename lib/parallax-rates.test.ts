import { describe, expect, it } from "vitest";
import {
	backgroundParallaxRate,
	clampHeroParallaxShift,
	heroForegroundParallaxRate,
} from "./parallax-rates";

describe("backgroundParallaxRate", () => {
	it("uses desktop rate from 1024px", () => {
		expect(backgroundParallaxRate(1200)).toBe(0.525);
	});
	it("uses tablet rate from 768–1023px", () => {
		expect(backgroundParallaxRate(900)).toBe(0.375);
	});
	it("uses mobile rate below 768px", () => {
		expect(backgroundParallaxRate(767)).toBe(0.225);
	});
});

describe("heroForegroundParallaxRate", () => {
	it("matches breakpoint tiers", () => {
		expect(heroForegroundParallaxRate(1100)).toBe(0.35);
		expect(heroForegroundParallaxRate(800)).toBe(0.25);
		expect(heroForegroundParallaxRate(390)).toBe(0.15);
	});
});

describe("clampHeroParallaxShift", () => {
	it("caps shift by scroll and viewport", () => {
		expect(clampHeroParallaxShift(10000, 0.35, 800)).toBeLessThanOrEqual(112);
		expect(clampHeroParallaxShift(100, 0.35, 800)).toBe(35);
	});
});
