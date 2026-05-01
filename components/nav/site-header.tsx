import { getSession } from "@/lib/supabase/get-session";
import { SiteHeaderClient } from "@/components/nav/site-header-client";

export async function SiteHeader({
  variant = "app",
}: {
  variant?: "marketing" | "app";
}) {
  const user = await getSession();
  return <SiteHeaderClient variant={variant} user={user} />;
}
