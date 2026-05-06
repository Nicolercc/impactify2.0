"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import {
	backgroundParallaxRate,
	communityParallaxRate,
	farBuildingParallaxRate,
	midBuildingParallaxRate,
	nearBuildingParallaxRate,
} from "@/lib/parallax-rates";

export function ParallaxBackground() {
	const [y, setY] = useState(0);
	const [vw, setVw] = useState(1024);
	const [mounted, setMounted] = useState(false);
	const tickingRef = useRef(false);
	const reduceMotion = usePrefersReducedMotion();

	// Mount flag to prevent hydration mismatch
	useEffect(() => {
		setMounted(true);
		setVw(window.innerWidth);

		const onScroll = () => {
			if (tickingRef.current) return;
			tickingRef.current = true;
			requestAnimationFrame(() => {
				setY(window.scrollY);
				tickingRef.current = false;
			});
		};

		const onResize = () => setVw(window.innerWidth);

		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", onResize);
		return () => {
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onResize);
		};
	}, []);

	const bgRate = reduceMotion ? 0 : backgroundParallaxRate(vw);
	const communityRate = reduceMotion ? 0 : communityParallaxRate(vw);
	const farRate = reduceMotion ? 0 : farBuildingParallaxRate(vw);
	const midRate = reduceMotion ? 0 : midBuildingParallaxRate(vw);
	const nearRate = reduceMotion ? 0 : nearBuildingParallaxRate(vw);

	// Only apply scroll transform after mount to avoid hydration mismatch
	const bgTransform = mounted && !reduceMotion
		? `translate3d(0, ${-y * bgRate}px, 0) scale(1.08)`
		: "translate3d(0, 0, 0) scale(1.08)";
	const communityTransform =
		mounted && !reduceMotion
			? `translate3d(0, ${-y * communityRate}px, 0)`
			: "translate3d(0, 0, 0)";

	return (
		<div
			aria-hidden="true"
			style={{
				position: "fixed",
				inset: 0,
				zIndex: 0,
				pointerEvents: "none",
				overflow: "hidden",
				background: "#0E0A14",
			}}
		>
			{/* Full-bleed SVG skyline */}
			<div
				style={{
					position: "absolute",
					inset: "-5%",
					transform: bgTransform,
					transformOrigin: "center center",
					willChange: reduceMotion ? undefined : "transform",
				}}
			>
				<SkylineImage
					y={y}
					mounted={mounted}
					reduceMotion={reduceMotion}
					farRate={farRate}
					midRate={midRate}
					nearRate={nearRate}
				/>
			</div>

			{/* ✅ Warm color wash + sun haze — STATIC (constant opacity) */}
			<div
				style={{
					position: "absolute",
					inset: 0,
					background: `
            radial-gradient(70% 50% at 75% 28%, rgba(224,120,86,0.20) 0%, rgba(224,120,86,0.05) 35%, transparent 70%),
            radial-gradient(60% 50% at 15% 80%, rgba(74,31,79,0.30) 0%, transparent 70%),
            radial-gradient(40% 40% at 90% 60%, rgba(212,242,90,0.06) 0%, transparent 70%)
          `,
					willChange: "opacity",
					opacity: 0.72,
				}}
			/>

			{/* Community foreground (closest layer) — silhouettes only (no signs) */}
			<div
				style={{
					position: "absolute",
					left: 0,
					right: 0,
					bottom: 0,
					height: 200,
					transform: communityTransform,
					opacity: 0.55,
					willChange: reduceMotion ? undefined : "transform",
				}}
			>
				<CommunityRow />
			</div>

			{/* ✅ IMPROVED: Bottom gradient that fades smoothly into page background */}
			{/* Extended gradient to prevent seams */}
			<div
				style={{
					position: "absolute",
					left: 0,
					right: 0,
					bottom: -100, // Extend below viewport to prevent gaps
					height: "calc(100% + 200px)",
					background:
						"linear-gradient(180deg, transparent 0%, transparent 40%, rgba(14,10,20,0.3) 60%, rgba(14,10,20,0.8) 85%, rgba(14,10,20,1) 100%)",
					pointerEvents: "none",
				}}
			/>

			{/* Film grain overlay */}
			<div
				style={{
					position: "absolute",
					inset: 0,
					backgroundImage:
						"radial-gradient(rgba(244,239,227,0.025) 1px, transparent 1px)",
					backgroundSize: "3px 3px",
					opacity: 0.6,
					mixBlendMode: "overlay",
				}}
			/>
		</div>
	);
}

/* ─── Community Foreground Row (silhouettes only) ─── */
function CommunityRow() {
	const people = [
		{ x: 60, h: 130 },
		{ x: 110, h: 145 },
		{ x: 170, h: 125 },
		{ x: 220, h: 138, raised: true },
		{ x: 270, h: 132 },
		{ x: 320, h: 150 },
		{ x: 380, h: 128 },
		{ x: 425, h: 142, raised: true },
		{ x: 475, h: 135 },
		{ x: 530, h: 148 },
		{ x: 590, h: 130 },
		{ x: 640, h: 138 },
		{ x: 695, h: 144, raised: true },
		{ x: 745, h: 130 },
		{ x: 795, h: 152 },
		{ x: 855, h: 128 },
		{ x: 905, h: 140 },
		{ x: 955, h: 135, raised: true },
		{ x: 1005, h: 145 },
		{ x: 1060, h: 130 },
		{ x: 1110, h: 138 },
		{ x: 1160, h: 148 },
		{ x: 1215, h: 132, raised: true },
		{ x: 1265, h: 140 },
		{ x: 1320, h: 128 },
		{ x: 1370, h: 145 },
		{ x: 1420, h: 135 },
		{ x: 1470, h: 142, raised: true },
		{ x: 1525, h: 130 },
		{ x: 1575, h: 138 },
	];

	return (
		<svg
			width="100%"
			height="100%"
			viewBox="0 0 1600 200"
			preserveAspectRatio="xMidYMax slice"
			style={{ position: "absolute", inset: 0, display: "block" }}
		>
			{/* Ground band */}
			<rect x="0" y="170" width="1600" height="30" fill="#04020A" opacity="0.95" />

			{/* People silhouettes */}
			<g fill="#04020A" opacity="0.95">
				{people.map((p, i) => (
					<PersonSilhouette key={i} x={p.x} h={p.h} raised={p.raised} />
				))}
			</g>
		</svg>
	);
}

function PersonSilhouette({
	x,
	h,
	raised,
}: {
	x: number;
	h: number;
	raised?: boolean;
}) {
	const baseY = 200;
	const bodyTop = baseY - h;
	return (
		<g>
			<circle cx={x} cy={bodyTop + 8} r="6" />
			<path
				d={`M${x - 9} ${bodyTop + 14} Q${x} ${bodyTop + 18} ${x + 9} ${bodyTop + 14} L${x + 7} ${baseY} L${x - 7} ${baseY} Z`}
			/>
			{raised ? (
				<path
					d={`M${x - 4} ${bodyTop + 18} L${x - 16} ${bodyTop - 6} L${x - 12} ${bodyTop - 8} L${x} ${bodyTop + 16} Z`}
				/>
			) : null}
		</g>
	);
}

/* ─── NYC Dusk Skyline (SVG) ─── */
function SkylineImage({
	y,
	mounted,
	reduceMotion,
	farRate,
	midRate,
	nearRate,
}: {
	y: number;
	mounted: boolean;
	reduceMotion: boolean;
	farRate: number;
	midRate: number;
	nearRate: number;
}) {
	// Procedural skyline (dense) + landmark silhouettes.
	// The markup stays small; complexity comes from deterministic generation.
	function mulberry32(seed: number) {
		let t = seed;
		return () => {
			t += 0x6d2b79f5;
			let r = Math.imul(t ^ (t >>> 15), 1 | t);
			r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
			return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
		};
	}

	function clamp(n: number, min: number, max: number) {
		return Math.max(min, Math.min(max, n));
	}

	function buildingPath(x: number, baseY: number, w: number, h: number, rng: () => number) {
		// Simple “NYC-ish” setbacks: 1–3 tiers + optional antenna.
		const tiers = 1 + Math.floor(rng() * 3);
		const inset1 = Math.round(w * (0.06 + rng() * 0.08));
		const inset2 = Math.round(w * (0.08 + rng() * 0.12));
		const tier1H = Math.round(h * (0.16 + rng() * 0.18));
		const tier2H = Math.round(h * (0.12 + rng() * 0.14));
		const topH = h - tier1H - (tiers > 1 ? tier2H : 0);

		const x0 = Math.round(x);
		const x1 = Math.round(x + w);
		const y0 = Math.round(baseY);
		const yTop = Math.round(baseY - h);

		let d = `M${x0} ${y0} V${yTop + topH} H${x1} V${y0} Z`;

		// Tier 1
		const t1y = yTop + topH;
		d += ` M${x0 + inset1} ${t1y} V${yTop + topH - tier1H} H${x1 - inset1} V${t1y} Z`;

		// Tier 2 (optional)
		if (tiers > 1) {
			const t2y = yTop + topH - tier1H;
			d += ` M${x0 + inset2} ${t2y} V${yTop} H${x1 - inset2} V${t2y} Z`;
		}

		// Antenna (optional)
		if (rng() < 0.28) {
			const ax = Math.round(x0 + w * (0.35 + rng() * 0.3));
			const aTop = Math.round(yTop - (12 + rng() * 26));
			d += ` M${ax} ${yTop} V${aTop}`;
		}

		return d;
	}

	function generateLayer(opts: {
		seed: number;
		count: number;
		baseY: number;
		minW: number;
		maxW: number;
		minH: number;
		maxH: number;
		gap: number;
		startX?: number;
		endX?: number;
	}) {
		const rng = mulberry32(opts.seed);
		const buildings: { d: string; x: number; w: number; h: number }[] = [];
		const startX = opts.startX ?? 0;
		const endX = opts.endX ?? 1600;
		let x = startX;
		let i = 0;

		while (x < endX && i < opts.count) {
			const w = Math.round(opts.minW + rng() * (opts.maxW - opts.minW));
			const h = Math.round(opts.minH + rng() * (opts.maxH - opts.minH));
			const d = buildingPath(x, opts.baseY, w, h, rng);
			buildings.push({ d, x, w, h });
			x += w + opts.gap + Math.round(rng() * opts.gap);
			i += 1;
		}

		return buildings;
	}

	// 60+ buildings across layers (density reads NYC).
	const far = generateLayer({
		seed: 1207,
		count: 28,
		baseY: 790,
		minW: 34,
		maxW: 78,
		minH: 90,
		maxH: 210,
		gap: 10,
	});

	const mid = generateLayer({
		seed: 9817,
		count: 26,
		baseY: 860,
		minW: 40,
		maxW: 90,
		minH: 140,
		maxH: 310,
		gap: 10,
	});

	const near = generateLayer({
		seed: 4223,
		count: 22,
		baseY: 1000,
		minW: 58,
		maxW: 120,
		minH: 190,
		maxH: 460,
		gap: 12,
		startX: 420,
		endX: 1600,
	});

	// Landmark silhouettes (subtle, not cartoon-y)
	// Empire State (tiered crown + spire). Kept geometric so it reads at a glance.
	// Beacon is anchored to the spire tip coordinates below.
	const empire = {
		base: "M740 860 V560 H804 V860 Z",
		crown1: "M748 560 V520 H796 V560 Z",
		crown2: "M756 520 V485 H788 V520 Z",
		crown3: "M764 485 V450 H780 V485 Z",
		antenna: "M770 420 V410 H774 V420 Z",
		spire: "M772 450 V410",
		beacon: { cx: 772, cy: 410 },
	} as const;
	const chrysler =
		"M300 860 V600 C305 590 315 586 320 576 C325 586 335 590 340 600 V860 Z M320 576 V520";
	const oneWtc = "M1185 860 V560 L1200 540 L1215 560 V860 Z M1200 540 V480";
	// Flatiron (triangular top hint)
	const flatiron = "M905 1000 V820 L950 790 L995 820 V1000 Z";

	const bridgeCables = Array.from({ length: 28 }, (_, i) => {
		const x = 40 + i * 15;
		const t = (x - 40) / (460 - 40);
		const arc = 884 - 80 * Math.sin(t * Math.PI);
		return { x, arc, key: `cb-${i}` };
	});

	return (
		<svg
			width="100%"
			height="100%"
			viewBox="0 0 1600 1000"
			preserveAspectRatio="xMidYMid slice"
			style={{ position: "absolute", inset: 0, display: "block" }}
		>
			<defs>
				{/* Aircraft light glow (kept subtle; the light itself carries the punch). */}
				<filter id="aircraft-glow" x="-60%" y="-60%" width="220%" height="220%">
					<feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
					<feColorMatrix
						in="blur"
						type="matrix"
						values="1 0 0 0 0  0 0.35 0 0 0  0 0 0.35 0 0  0 0 0 1 0"
						result="coloredBlur"
					/>
					<feMerge>
						<feMergeNode in="coloredBlur" />
						<feMergeNode in="SourceGraphic" />
					</feMerge>
				</filter>

				<linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
					<stop offset="0%" stopColor="#1a0d28">
						{!reduceMotion ? (
							<animate
								attributeName="stop-color"
								values="#1a0d28;#2d1538;#1a0d28"
								dur="8s"
								repeatCount="indefinite"
							/>
						) : null}
					</stop>
					<stop offset="35%" stopColor="#2d1538">
						{!reduceMotion ? (
							<animate
								attributeName="stop-color"
								values="#2d1538;#3a1842;#2d1538"
								dur="10s"
								repeatCount="indefinite"
							/>
						) : null}
					</stop>
					<stop offset="65%" stopColor="#5a2840" />
					<stop offset="85%" stopColor="#8a3e3a" />
					<stop offset="100%" stopColor="#c47845">
						{!reduceMotion ? (
							<animate
								attributeName="stop-color"
								values="#c47845;#d4956a;#c47845"
								dur="12s"
								repeatCount="indefinite"
							/>
						) : null}
					</stop>
				</linearGradient>
				<linearGradient id="far-bldg" x1="0" x2="0" y1="0" y2="1">
					<stop offset="0%" stopColor="#5a3a5e" stopOpacity="0.9" />
					<stop offset="100%" stopColor="#3a1f3e" />
				</linearGradient>
				<linearGradient id="mid-bldg" x1="0" x2="0" y1="0" y2="1">
					<stop offset="0%" stopColor="#3a2a3e" />
					<stop offset="100%" stopColor="#1f1026" />
				</linearGradient>
				<linearGradient id="near-bldg" x1="0" x2="0" y1="0" y2="1">
					<stop offset="0%" stopColor="#2a1a2e" />
					<stop offset="100%" stopColor="#1a0d1e" />
				</linearGradient>
				<radialGradient id="sun-glow" cx="0.72" cy="0.32" r="0.32">
					<stop offset="0%" stopColor="#f8c870" stopOpacity="0.55" />
					<stop offset="40%" stopColor="#e07856" stopOpacity="0.18" />
					<stop offset="100%" stopColor="#e07856" stopOpacity="0" />
				</radialGradient>

				<radialGradient id="building-glow" cx="50%" cy="50%" r="60%">
					<stop offset="0%" stopColor="#ffb450" stopOpacity="0.15" />
					<stop offset="100%" stopColor="#ffb450" stopOpacity="0" />
				</radialGradient>

				{/* Window patterns (cheap “detail”; avoids hundreds of rects) */}
				<pattern id="mid-windows" width="18" height="18" patternUnits="userSpaceOnUse">
					<rect x="2" y="2" width="3" height="4" fill="#ffd47a" opacity="0.35" />
					<rect x="8" y="2" width="3" height="4" fill="#ffd47a" opacity="0.25" />
					<rect x="14" y="2" width="3" height="4" fill="#ffd47a" opacity="0.2" />
					<rect x="2" y="10" width="3" height="4" fill="#ffd47a" opacity="0.3" />
					<rect x="8" y="10" width="3" height="4" fill="#ffd47a" opacity="0.25" />
					<rect x="14" y="10" width="3" height="4" fill="#ffd47a" opacity="0.2" />
				</pattern>
				<pattern id="near-windows" width="16" height="16" patternUnits="userSpaceOnUse">
					<rect x="1" y="1" width="3" height="5" fill="#ffd47a" opacity="0.35">
						{!reduceMotion ? (
							<animate
								attributeName="opacity"
								values="0.2;0.52;0.3;0.62;0.2"
								dur="3s"
								begin="0.1s"
								repeatCount="indefinite"
							/>
						) : null}
						{!reduceMotion ? (
							<animate
								attributeName="fill"
								values="#ffd47a;#ffeb3b;#ffd47a"
								dur="4s"
								begin="0.2s"
								repeatCount="indefinite"
							/>
						) : null}
					</rect>
					<rect x="7" y="1" width="3" height="5" fill="#ffd47a" opacity="0.28">
						{!reduceMotion ? (
							<animate
								attributeName="opacity"
								values="0.18;0.46;0.26;0.55;0.18"
								dur="3.3s"
								begin="0.8s"
								repeatCount="indefinite"
							/>
						) : null}
						{!reduceMotion ? (
							<animate
								attributeName="fill"
								values="#ffd47a;#ffe082;#ffd47a"
								dur="4.4s"
								begin="0.9s"
								repeatCount="indefinite"
							/>
						) : null}
					</rect>
					<rect x="1" y="9" width="3" height="5" fill="#ffd47a" opacity="0.32">
						{!reduceMotion ? (
							<animate
								attributeName="opacity"
								values="0.16;0.5;0.24;0.58;0.16"
								dur="2.8s"
								begin="1.4s"
								repeatCount="indefinite"
							/>
						) : null}
						{!reduceMotion ? (
							<animate
								attributeName="fill"
								values="#ffd47a;#ffef9e;#ffd47a"
								dur="3.9s"
								begin="1.2s"
								repeatCount="indefinite"
							/>
						) : null}
					</rect>
					<rect x="7" y="9" width="3" height="5" fill="#ffd47a" opacity="0.22">
						{!reduceMotion ? (
							<animate
								attributeName="opacity"
								values="0.14;0.42;0.22;0.5;0.14"
								dur="3.6s"
								begin="2.1s"
								repeatCount="indefinite"
							/>
						) : null}
						{!reduceMotion ? (
							<animate
								attributeName="fill"
								values="#ffd47a;#ffe8a6;#ffd47a"
								dur="4.8s"
								begin="2.2s"
								repeatCount="indefinite"
							/>
						) : null}
					</rect>
				</pattern>
			</defs>

			<rect width="1600" height="1000" fill="url(#sky)" />
			{/* Warm glow beneath buildings (streetlight reflection) */}
			{[200, 650, 1050, 1350].map((cx) => (
				<circle
					key={`glow-${cx}`}
					cx={cx}
					cy="900"
					r="150"
					fill="url(#building-glow)"
					opacity="0.6"
				/>
			))}
			<rect width="1600" height="1000" fill="url(#sun-glow)" />

			<ellipse
				cx="240"
				cy="180"
				rx="180"
				ry="14"
				fill="#0E0A14"
				opacity="0.25"
			/>
			<ellipse
				cx="900"
				cy="120"
				rx="220"
				ry="10"
				fill="#0E0A14"
				opacity="0.18"
			/>
			<ellipse
				cx="1320"
				cy="220"
				rx="160"
				ry="12"
				fill="#0E0A14"
				opacity="0.22"
			/>

			{/* FAR skyline layer */}
			<g
				id="far-buildings"
				fill="url(#far-bldg)"
				style={{
					transform:
						mounted && !reduceMotion
							? `translate3d(0, ${-y * farRate}px, 0)`
							: undefined,
					willChange: mounted && !reduceMotion ? ("transform" as const) : undefined,
				}}
			>
				{far.map((b, idx) => (
					<path key={`f-${idx}`} d={b.d} opacity="0.92" />
				))}
				{/* Landmarks (subtle silhouettes) */}
				<path d={chrysler} fill="#6a5a6e" opacity="0.95" />
				<g fill="#6a5a6e" opacity="0.96">
					<path d={empire.base} />
					<path d={empire.crown1} />
					<path d={empire.crown2} />
					<path d={empire.crown3} />
					<path d={empire.antenna} />
					<path d={empire.spire} stroke="#6a5a6e" strokeWidth="2" fill="none" />
					{/* Aircraft warning beacon — anchored to Empire spire tip */}
					<circle
						cx={empire.beacon.cx}
						cy={empire.beacon.cy}
						r="8"
						fill="#ff5a4a"
						opacity={reduceMotion ? 0.22 : 0.12}
						filter="url(#aircraft-glow)"
					>
						{!reduceMotion ? (
							<animate
								attributeName="opacity"
								values="0.08;0.35;0.08"
								dur="1.5s"
								repeatCount="indefinite"
							/>
						) : null}
					</circle>
					<circle
						cx={empire.beacon.cx}
						cy={empire.beacon.cy}
						r="5"
						fill="#ff5a4a"
						opacity={reduceMotion ? 0.75 : 0.3}
						filter="url(#aircraft-glow)"
					>
						{!reduceMotion ? (
							<animate
								attributeName="opacity"
								values="0.18;1;0.18"
								dur="1.5s"
								repeatCount="indefinite"
							/>
						) : null}
					</circle>
					<circle
						cx={empire.beacon.cx}
						cy={empire.beacon.cy}
						r="2"
						fill="#ffffff"
						opacity={reduceMotion ? 0.55 : 0}
					>
						{!reduceMotion ? (
							<animate
								attributeName="opacity"
								values="0;1;0"
								dur="1.5s"
								repeatCount="indefinite"
							/>
						) : null}
					</circle>
				</g>
				<path d={oneWtc} fill="#6a5a6e" opacity="0.95" />
			</g>

			{/* MID skyline layer */}
			<g
				id="mid-buildings"
				style={{
					transform:
						mounted && !reduceMotion
							? `translate3d(0, ${-y * midRate}px, 0)`
							: undefined,
					willChange: mounted && !reduceMotion ? ("transform" as const) : undefined,
				}}
			>
				<g fill="url(#mid-bldg)" opacity="0.98">
					{mid.map((b, idx) => (
						<path key={`m-${idx}`} d={b.d} />
					))}
				</g>
				{/* Window texture on mid */}
				<g opacity="0.72">
					{mid.map((b, idx) => (
						<path key={`mw-${idx}`} d={b.d} fill="url(#mid-windows)" />
					))}
				</g>
			</g>

			<g>
				<path
					fill="url(#near-bldg)"
					d="M0 1000V880l60 4v-130h22v-100h12v-12h6v12h12v100h22v130l40-2v110l-40 4v-12L0 890Z"
				/>
				<path
					d="M40 884 Q 250 800 460 884"
					stroke="rgba(244,239,227,0.22)"
					strokeWidth="0.9"
					fill="none"
				/>
				<path
					d="M40 884 Q 250 824 460 884"
					stroke="rgba(244,239,227,0.14)"
					strokeWidth="0.7"
					fill="none"
				/>
				<path
					d="M40 884 Q 250 850 460 884"
					stroke="rgba(244,239,227,0.08)"
					strokeWidth="0.5"
					fill="none"
				/>
				{bridgeCables.map((cb) => (
					<line
						key={cb.key}
						x1={cb.x}
						y1="884"
						x2={cb.x}
						y2={cb.arc}
						stroke="rgba(244,239,227,0.12)"
						strokeWidth="0.45"
					/>
				))}

				<path
					fill="url(#near-bldg)"
					d="M460 1000V820l40 4v-30l30 6 14-50 16 50 22-12v34l32 8v-44l30 16 18-12v40l38 8v-30l30 14 18-50 14 50 24-10v36l36 8v-44l30 18 18-12v40l40 8v-30l30 14 16-30v36l40 8v-26l36 14 18-26v32l32 8v-44l40 18 14-22v40l38 8v-30l32 16 18-12v34l36 8v-44l30 16 18-30v40l36 8v-26l36 14 16-22v32l36 8v-44l30 16 14-22v40l34 8v-30l34 16 18-12V1000Z"
				/>

				{/* Near buildings (dense, detailed) */}
				<g
					id="near-buildings"
					style={{
						transform:
							mounted && !reduceMotion
								? `translate3d(0, ${-y * nearRate}px, 0)`
								: undefined,
						willChange: mounted && !reduceMotion ? ("transform" as const) : undefined,
					}}
				>
					<g opacity="0.98">
						{near.map((b, idx) => (
							<path key={`n-${idx}`} d={b.d} fill="url(#near-bldg)" />
						))}
						<path d={flatiron} fill="#5a4a5e" opacity="1" />
					</g>
					<g opacity="0.8">
						{near.map((b, idx) => (
							<path key={`nw-${idx}`} d={b.d} fill="url(#near-windows)" />
						))}
					</g>
				</g>

				<g transform="translate(880 870)">
					<rect x="-14" y="-2" width="28" height="22" fill="#04020a" />
					<rect x="-16" y="-4" width="32" height="4" fill="#04020a" />
					<line
						x1="-12"
						y1="-4"
						x2="-12"
						y2="-12"
						stroke="#04020a"
						strokeWidth="2"
					/>
					<line
						x1="12"
						y1="-4"
						x2="12"
						y2="-12"
						stroke="#04020a"
						strokeWidth="2"
					/>
					<path d="M-16 -4 L0 -18 L16 -4 Z" fill="#04020a" />
				</g>

			</g>

			<g opacity="0.3">
				{Array.from({ length: 40 }, (_, i) => (
					<line
						key={`rp-${i}`}
						x1={i * 40}
						y1={970 + (i % 3) * 4}
						x2={i * 40 + 30}
						y2={970 + (i % 3) * 4}
						stroke="#e07856"
						strokeWidth="0.4"
						opacity="0.3"
					/>
				))}
			</g>
		</svg>
	);
}

