import { SiteHeader } from "@/components/nav/site-header";
import { SiteFooter } from "@/components/nav/site-footer";
import { ParallaxBackground } from "@/components/sections/parallax-background";

export default function MarketingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<ParallaxBackground />
			<SiteHeader variant="marketing" />
			<div style={{ position: "relative", zIndex: 1 }}>
				{children}
				<SiteFooter />
			</div>
		</>
	);
}
