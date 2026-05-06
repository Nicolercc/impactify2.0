import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Mono, Fraunces, Inter, Syne } from "next/font/google";
import { VercelAnalytics } from "@/components/vercel-analytics";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";
import Script from "next/script";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
	display: "swap",
});

const fraunces = Fraunces({
	subsets: ["latin"],
	variable: "--font-fraunces",
	display: "swap",
	style: ["normal", "italic"],
	weight: ["400", "600", "700"],
});

const cormorantGaramond = Cormorant_Garamond({
	subsets: ["latin"],
	variable: "--font-cormorant",
	display: "swap",
	weight: ["400", "600"],
});

const syne = Syne({
	subsets: ["latin"],
	variable: "--font-syne",
	display: "swap",
	weight: ["400", "500", "600", "700"],
});

const dmMono = DM_Mono({
	subsets: ["latin"],
	variable: "--font-dm-mono",
	display: "swap",
	weight: ["400", "500"],
});

export const metadata: Metadata = {
	metadataBase: new URL(
		process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
	),
	title: {
		default: "Impactify | Your Voice, Organized",
		template: "%s | Impactify",
	},
	description:
		"Find local events, global issues, and your representatives — all in one civic action hub. Discover, engage, and make an impact.",
	keywords: [
		"civic engagement",
		"local events",
		"political action",
		"community organizing",
		"representatives",
		"voting",
		"activism",
	],
	authors: [{ name: "Impactify" }],
	creator: "Impactify",
	openGraph: {
		type: "website",
		locale: "en_US",
		url: "https://impactify.app",
		title: "Impactify | Your Voice, Organized",
		description:
			"Find local events, global issues, and your representatives — all in one civic action hub.",
		siteName: "Impactify",
		images: [
			{
				url: "/og-image.jpg",
				width: 1200,
				height: 630,
				alt: "Impactify - Your Voice, Organized",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Impactify | Your Voice, Organized",
		description:
			"Find local events, global issues, and your representatives — all in one civic action hub.",
		images: ["/og-image.jpg"],
	},
	robots: {
		index: true,
		follow: true,
	},
};

export const viewport: Viewport = {
	themeColor: "#4A1347",
	width: "device-width",
	initialScale: 1,
	maximumScale: 5,
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`${inter.variable} ${fraunces.variable} ${cormorantGaramond.variable} ${syne.variable} ${dmMono.variable} bg-background`}
			suppressHydrationWarning
		>
			<head>
				<link rel="preconnect" href="https://content.guardianapis.com" />
				<link rel="preconnect" href="https://nuhenwpzkygidadpmxgz.supabase.co" />
				<Script
					id="impactify-theme-init"
					strategy="beforeInteractive"
					dangerouslySetInnerHTML={{
						__html: `
(function(){
  try {
    var key = 'impactify-theme';
    var stored = localStorage.getItem(key);
    var systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = (stored === 'dark' || stored === 'light') ? stored : (systemDark ? 'dark' : 'light');
    var root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  } catch (e) {}
})();`.trim(),
					}}
				/>
			</head>
			<body className="min-h-screen overflow-x-hidden font-sans antialiased">
				<a
					href="#main-content"
					className="fixed left-4 top-4 z-100 -translate-y-24 rounded-md bg-plum-700 px-4 py-2 text-sm font-medium text-parchment transition-transform duration-200 focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-chartreuse-500 focus:ring-offset-2"
				>
					Skip to main content
				</a>
				<ThemeProvider>{children}</ThemeProvider>
				<Toaster />
				<VercelAnalytics />
			</body>
		</html>
	);
}
