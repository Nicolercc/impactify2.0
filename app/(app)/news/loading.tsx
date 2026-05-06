import { SkeletonCard } from "@/components/news/SkeletonCard";

export default function NewsLoading() {
	return (
		<div className="min-h-screen bg-parchment font-sans text-ink">
			<div className="mx-auto max-w-7xl px-4 pb-16 pt-12 md:px-6 lg:px-8">
				<div className="animate-pulse space-y-4 text-center">
					<div className="mx-auto h-10 max-w-md rounded-lg bg-plum-100" />
					<div className="mx-auto h-5 max-w-2xl rounded bg-plum-50" />
					<div className="mx-auto h-5 max-w-xl rounded bg-plum-50" />
				</div>
				<div className="mt-10 flex flex-wrap gap-4">
					{Array.from({ length: 8 }).map((_, i) => (
						<div
							key={i}
							className="h-10 w-24 rounded-full bg-plum-50"
							aria-hidden
						/>
					))}
				</div>
				<div
					className="mt-10 grid grid-cols-1 gap-3 pt-10 md:grid-cols-2 md:gap-4 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4"
					aria-busy
				>
					<div className="lg:col-span-2">
						<SkeletonCard featured />
					</div>
					{Array.from({ length: 5 }).map((_, i) => (
						<SkeletonCard key={i} />
					))}
				</div>
			</div>
		</div>
	);
}
