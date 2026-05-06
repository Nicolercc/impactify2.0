import { SiteFooter } from "@/components/nav/site-footer";
import { SiteHeader } from "@/components/nav/site-header";
import { NAV_HEIGHT_PX } from "@/lib/constants/layout";

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-parchment">
      <SiteHeader variant="app" />
      <main
        id="main-content"
        className="flex flex-1 flex-col"
        style={{ paddingTop: `${NAV_HEIGHT_PX}px` }}
      >
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
