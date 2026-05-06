"use client";

import { useCallback, useMemo, useState } from "react";
import "./reps-motion.css";
import { REPS_DATA, SOFIA_ISSUES } from "@/lib/demo-data";
import { BentoRepCard } from "@/components/reps/bento-rep-card";
import { RepDetailView } from "@/components/RepDetailView";
import { cn } from "@/lib/utils";

const INITIAL_ZIP: keyof typeof REPS_DATA = "11201";

function defaultRepIdForZip(z: keyof typeof REPS_DATA): string {
	const b = REPS_DATA[z];
	return b.senators[0]?.id ?? b.representative.id;
}

function SectionDivider() {
	return (
		<div
			className="mx-auto h-[2px] w-full max-w-[1400px] px-10"
			aria-hidden
			style={{
				background:
					"linear-gradient(90deg, transparent, rgba(212, 242, 90, 0.85), transparent)",
			}}
		/>
	);
}

export default function RepsPageComplete() {
	const [activeZip, setActiveZip] =
		useState<keyof typeof REPS_DATA>(INITIAL_ZIP);
	const [zipDraft, setZipDraft] = useState<string>(INITIAL_ZIP);
	const [selectedRepId, setSelectedRepId] = useState<string>(() =>
		defaultRepIdForZip(INITIAL_ZIP),
	);

	const repsForZip = REPS_DATA[activeZip];

	const handleZipInputChange = useCallback((raw: string) => {
		const d = raw.replace(/\D/g, "").slice(0, 5);
		setZipDraft(d);
		if (d.length === 5 && d in REPS_DATA) {
			const next = d as keyof typeof REPS_DATA;
			setActiveZip(next);
			setSelectedRepId(defaultRepIdForZip(next));
		}
	}, []);

	const handleZipBlur = useCallback(() => {
		const incomplete = zipDraft.length < 5;
		const unknownFiveDigit =
			zipDraft.length === 5 && !(zipDraft in REPS_DATA);
		if (incomplete || unknownFiveDigit) {
			setZipDraft(activeZip);
		}
	}, [zipDraft, activeZip]);

	const allReps = useMemo(() => {
		return [...repsForZip.senators, repsForZip.representative];
	}, [repsForZip]);

	const validSelection = allReps.some((r) => r.id === selectedRepId);

	const featuredRep =
		validSelection && repsForZip
			? (allReps.find((r) => r.id === selectedRepId) ?? allReps[0])
			: null;

	const orderedReps = useMemo(() => {
		if (!repsForZip || !validSelection || !featuredRep) return allReps;
		return [featuredRep, ...allReps.filter((r) => r.id !== featuredRep.id)];
	}, [allReps, validSelection, featuredRep, repsForZip]);

	const selectedRep = [...repsForZip.senators, repsForZip.representative].find(
		(rep) => rep.id === selectedRepId,
	);

	const shell = "mx-auto w-full max-w-[1400px] px-10";

	return (
		<div className="reps-motion-root">
			<main className="w-full bg-[#F7F2E8]">
				<section className="w-full border-b border-[#E5DDD3] bg-white">
					<div className={`${shell} pt-[60px] pb-12`}>
						<h1
							style={{
								fontSize: "clamp(28px, 6vw, 40px)",
								fontWeight: 700,
								marginBottom: "12px",
								fontFamily: "var(--font-serif), serif",
								color: "#4A1347",
							}}
						>
							Your representatives, with receipts.
						</h1>
						<p
							style={{
								fontSize: "clamp(16px, 4vw, 17px)",
								color: "#5B4A56",
								marginBottom: "32px",
								lineHeight: 1.5,
								maxWidth: "720px",
							}}
						>
							Search by ZIP to focus the view, then compare votes and issue
							alignment.
						</p>

						<div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
							<input
								type="text"
								inputMode="numeric"
								autoComplete="postal-code"
								placeholder="e.g., 11201"
								aria-label="ZIP code"
								value={zipDraft}
								onChange={(e) => handleZipInputChange(e.target.value)}
								onBlur={handleZipBlur}
								style={{
									flex: "1 1 240px",
									padding: "12px 16px",
									border: "1px solid #D4C4B8",
									borderRadius: "8px",
									fontSize: "16px",
									fontFamily: "monospace",
									minHeight: "48px",
								}}
							/>
							<button
								type="button"
								className="reps-btn-primary"
								onClick={() => {
									document
										.getElementById("results")
										?.scrollIntoView({ behavior: "smooth" });
								}}
								style={{
									padding: "12px 24px",
									background: "#D4F25A",
									color: "#000",
									border: "none",
									borderRadius: "8px",
									fontWeight: 600,
									cursor: "pointer",
									minHeight: "48px",
									fontSize: "16px",
								}}
							>
								Review reps →
							</button>
						</div>
						<p
							className="mt-3 text-sm text-[#7D5C6D]"
							style={{ maxWidth: "640px" }}
						>
							You can edit freely—partial ZIPs keep the previous district until
							you enter a supported 5-digit code.
						</p>
					</div>
				</section>

				<div
					className="w-full bg-[#F7F2E8]"
					style={{ paddingTop: "40px", paddingBottom: "40px" }}
				>
					<SectionDivider />
				</div>

				<section id="results" className="w-full py-20">
					<div className={shell}>
						<h2 className="mb-3 font-serif text-[clamp(22px,5vw,28px)] font-semibold text-[#4A1347]">
							Compare at a glance
						</h2>
						<p className="mb-10 max-w-2xl text-[15px] leading-relaxed text-[#5B4A56]">
							Alignment reflects tracked issues in your profile. Select a card to
							open voting record and contact tools.
						</p>

						<div
							className={cn(
								"grid w-full gap-6",
								validSelection &&
									"grid-cols-1 md:grid-cols-2 xl:grid-cols-3 xl:grid-rows-2",
							)}
							style={
								validSelection
									? undefined
									: {
											gridTemplateColumns:
												"repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
										}
							}
						>
							{orderedReps.map((rep, cardIdx) => {
								const isFeatured = Boolean(
									validSelection && featuredRep && rep.id === featuredRep.id,
								);
								const compactIndex =
									validSelection && featuredRep && !isFeatured
										? orderedReps
												.filter((r) => r.id !== featuredRep!.id)
												.indexOf(rep)
										: -1;

								return (
									<div
										key={rep.id}
										className={cn(
											"min-h-0 min-w-0",
											validSelection &&
												isFeatured &&
												"md:col-span-2 xl:col-span-2 xl:row-span-2",
											validSelection &&
												compactIndex === 0 &&
												"md:col-span-1 xl:col-start-3 xl:row-start-1",
											validSelection &&
												compactIndex === 1 &&
												"md:col-span-1 xl:col-start-3 xl:row-start-2",
										)}
									>
										<BentoRepCard
											rep={rep}
											staggerIndex={cardIdx}
											layoutVariant={isFeatured ? "featured" : "compact"}
											isSelected={rep.id === selectedRepId}
											onClick={() => {
												setSelectedRepId(rep.id);
												requestAnimationFrame(() => {
													document
														.getElementById("detail")
														?.scrollIntoView({ behavior: "smooth" });
												});
											}}
										/>
									</div>
								);
							})}
						</div>
					</div>
				</section>

				{selectedRep ? (
					<>
						<div
							className="w-full bg-[#F7F2E8]"
							style={{ paddingTop: "40px", paddingBottom: "40px" }}
						>
							<SectionDivider />
						</div>
						<section
							id="detail"
							className="w-full bg-white py-20"
							style={{ scrollMarginTop: "96px" }}
						>
							<RepDetailView rep={selectedRep} userIssues={SOFIA_ISSUES} />
						</section>
					</>
				) : null}
			</main>
		</div>
	);
}
