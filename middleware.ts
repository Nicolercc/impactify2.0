import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Exclude:
     * - static files, image optimization, favicon
     * - API routes that do not need cookie refresh (extend list as the app grows)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/briefings|api/sync|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
