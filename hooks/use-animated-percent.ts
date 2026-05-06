"use client";

import { useEffect, useState } from "react";

function easeOutCubic(t: number) {
	return 1 - (1 - t) ** 3;
}

/**
 * Counts from 0 toward `target` over `durationMs` (fancy alignment % display).
 */
export function useAnimatedPercent(target: number, durationMs: number, reducedMotion: boolean) {
	const [value, setValue] = useState(reducedMotion ? target : 0);

	useEffect(() => {
		if (reducedMotion) {
			setValue(target);
			return;
		}

		setValue(0);
		let start: number | null = null;
		let frame = 0;

		const step = (now: number) => {
			if (start === null) start = now;
			const elapsed = now - start;
			const p = Math.min(1, elapsed / durationMs);
			setValue(Math.round(target * easeOutCubic(p)));
			if (p < 1) frame = requestAnimationFrame(step);
		};

		frame = requestAnimationFrame(step);
		return () => cancelAnimationFrame(frame);
	}, [target, durationMs, reducedMotion]);

	return value;
}
