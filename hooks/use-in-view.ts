"use client";

import { useEffect, useRef, useState } from "react";

export function useInView<T extends HTMLElement = HTMLElement>() {
	const ref = useRef<T | null>(null);
	const [inView, setInView] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		const obs = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting) setInView(true);
			},
			{ threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
		);
		obs.observe(el);
		return () => obs.disconnect();
	}, []);

	return [ref, inView] as const;
}
