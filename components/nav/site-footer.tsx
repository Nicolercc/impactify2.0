import Link from "next/link";
import { X, Camera, Globe, Code2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { footerNavItems, socialLinks } from "@/lib/constants/nav";

export function SiteFooter() {
	return (
		<footer
			id="site-footer"
			role="contentinfo"
			className="bg-[rgba(247,242,232,1)] text-ink dark:bg-bg-2 dark:text-[#F4EFE3]"
		>
			<div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
				<div className="grid gap-8 lg:grid-cols-5 lg:gap-12">
					<div className="lg:col-span-2">
						<Link
							href="/"
							className="font-serif text-2xl font-semibold tracking-tight text-plum-700 dark:text-foreground"
						>
							Impactify
						</Link>
						<p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-muted dark:text-[#d4c9bc]">
							Your voice, organized. Find local events, global issues, and your
							representatives — all in one civic action hub.
						</p>

						<div className="mt-6 flex gap-4">
							{socialLinks.map((link) => (
								<a
									key={link.label}
									href={link.href}
									target="_blank"
									rel="noopener noreferrer"
									className="flex h-10 w-10 items-center justify-center rounded-full bg-white/60 text-plum-700 transition-colors duration-200 ease-out-expo hover:bg-chartreuse-500 hover:text-[#0E0A14] dark:bg-white/5 dark:text-[#d4c9bc] dark:hover:bg-white/10 dark:hover:text-[#F4EFE3]"
									aria-label={link.label}
								>
									{link.icon === "twitter" && <X className="h-5 w-5" />}
									{link.icon === "instagram" && <Camera className="h-5 w-5" />}
									{link.icon === "linkedin" && <Globe className="h-5 w-5" />}
								</a>
							))}
						</div>

						{/* Social / external links */}
						<div className="mt-8 flex items-center gap-3 border-t border-plum-200 pt-6 dark:border-[rgba(244,239,227,0.08)]">
							<span className="text-xs font-semibold uppercase tracking-widest text-ink-muted dark:text-[#9d8f7f]">
								Connect
							</span>
							<a
								href="https://github.com/Nicolercc"
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/60 text-plum-700 transition-colors duration-200 ease-out-expo hover:bg-chartreuse-500 hover:text-[#0E0A14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(247,242,232,1)] dark:bg-white/5 dark:text-[#d4c9bc] dark:hover:bg-white/10 dark:hover:text-[#F4EFE3] dark:focus-visible:ring-offset-[#1a0618]"
								aria-label="GitHub"
								title="GitHub"
							>
								<Code2 className="h-5 w-5" aria-hidden />
							</a>
							<a
								href="https://nicolerodriguez.dev"
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/60 text-plum-700 transition-colors duration-200 ease-out-expo hover:bg-chartreuse-500 hover:text-[#0E0A14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(247,242,232,1)] dark:bg-white/5 dark:text-[#d4c9bc] dark:hover:bg-white/10 dark:hover:text-[#F4EFE3] dark:focus-visible:ring-offset-[#1a0618]"
								aria-label="Portfolio"
								title="Portfolio"
							>
								<ExternalLink className="h-5 w-5" aria-hidden />
							</a>
						</div>

						<div className="mt-8">
							<h3 className="font-sans text-eyebrow uppercase tracking-widest text-ink-muted dark:text-[#9d8f7f]">
								Stay informed
							</h3>
							<form className="mt-3 flex gap-2">
								<Input
									type="email"
									placeholder="Enter your email"
									className="h-11 border-plum-200 bg-white/70 text-ink placeholder:text-ink-muted focus-visible:ring-chartreuse-500 dark:bg-[#2b1a35] dark:border-[rgba(244,239,227,0.12)] dark:text-[#F4EFE3] dark:placeholder:text-[#9d8f7f]"
									aria-label="Email address for newsletter"
								/>
								<Button
									type="submit"
									className="h-11 bg-chartreuse-500 px-4 font-medium text-[#0E0A14] hover:bg-chartreuse-700"
								>
									Subscribe
								</Button>
							</form>
						</div>
					</div>

					<div>
						<h3 className="font-sans text-eyebrow uppercase tracking-widest text-ink-muted dark:text-[#9d8f7f]">
							Explore
						</h3>
						<ul className="mt-4 flex flex-col gap-3">
							{footerNavItems.explore.map((item) => (
								<li key={item.href}>
									<Link
										href={item.href}
										className="text-sm text-ink transition-colors duration-200 ease-out-expo hover:text-plum-700 dark:text-[#d4c9bc] dark:hover:text-[#F4EFE3]"
									>
										{item.label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					<div>
						<h3 className="font-sans text-eyebrow uppercase tracking-widest text-ink-muted dark:text-[#9d8f7f]">
							Act
						</h3>
						<ul className="mt-4 flex flex-col gap-3">
							{footerNavItems.act.map((item) => (
								<li key={item.href}>
									<Link
										href={item.href}
										className="text-sm text-ink transition-colors duration-200 ease-out-expo hover:text-plum-700 dark:text-[#d4c9bc] dark:hover:text-[#F4EFE3]"
									>
										{item.label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					<div>
						<h3 className="font-sans text-eyebrow uppercase tracking-widest text-ink-muted dark:text-[#9d8f7f]">
							Company
						</h3>
						<ul className="mt-4 flex flex-col gap-3">
							{footerNavItems.company.map((item) => (
								<li key={item.href}>
									<Link
										href={item.href}
										className="text-sm text-ink transition-colors duration-200 ease-out-expo hover:text-plum-700 dark:text-[#d4c9bc] dark:hover:text-[#F4EFE3]"
									>
										{item.label}
									</Link>
								</li>
							))}
						</ul>
					</div>
				</div>

				<div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-plum-200 pt-8 lg:flex-row dark:border-[rgba(244,239,227,0.08)]">
					<p className="text-sm text-ink-muted dark:text-[#9d8f7f]">
						&copy; {new Date().getFullYear()} Impactify. All rights reserved.
					</p>

					<div className="flex flex-wrap items-center justify-center gap-4 text-sm text-ink-muted lg:gap-6 dark:text-[#d4c9bc]">
						{footerNavItems.legal.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								className="transition-colors duration-200 ease-out-expo hover:text-plum-700 dark:text-[#d4c9bc] dark:hover:text-[#F4EFE3]"
							>
								{item.label}
							</Link>
						))}
					</div>

					<p className="text-sm text-ink-muted dark:text-[#9d8f7f]">
						Built with <span className="text-peach-400">&#9829;</span> for civic
						action
					</p>
				</div>
			</div>
		</footer>
	);
}
