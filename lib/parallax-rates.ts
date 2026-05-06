/** Match marketing breakpoints: desktop >1024, tablet 768–1024, mobile <768 */
export function backgroundParallaxRate(width: number): number {
	// Tuned for noticeable depth without feeling “floaty”.
	if (width >= 1024) return 0.525;
	if (width >= 768) return 0.375;
	return 0.225;
}

export function communityParallaxRate(width: number): number {
	if (width >= 1024) return 0.5;
	if (width >= 768) return 0.36;
	return 0.21;
}

// Skyline depth layers (far moves slow, near moves fastest)
export function farBuildingParallaxRate(width: number): number {
	if (width >= 1024) return 0.1;
	if (width >= 768) return 0.08;
	return 0.05;
}

export function midBuildingParallaxRate(width: number): number {
	if (width >= 1024) return 0.25;
	if (width >= 768) return 0.18;
	return 0.12;
}

export function nearBuildingParallaxRate(width: number): number {
	if (width >= 1024) return 0.4;
	if (width >= 768) return 0.3;
	return 0.15;
}

/** Hero foreground layer: scales with same breakpoints as global background */
export function heroForegroundParallaxRate(width: number): number {
	if (width >= 1024) return 0.35;
	if (width >= 768) return 0.25;
	return 0.15;
}

/** Cap vertical shift so parallax never feels unbounded (vh-aware) */
export function clampHeroParallaxShift(scrollY: number, rate: number, vh: number): number {
	const raw = scrollY * rate;
	const max = Math.min(120, vh * 0.14);
	return Math.round(Math.min(max, raw) * 100) / 100;
}
