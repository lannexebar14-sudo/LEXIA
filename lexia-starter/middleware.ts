import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ehmxjwmwwirvnvdakahx.supabase.co";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_rQ0_cgEKffn_XcmhQ56mpA_411CYGEc";

function isAllowedDuringMaintenance(pathname: string) {
  return pathname.startsWith("/administration")
    || pathname.startsWith("/connexion")
    || pathname.startsWith("/maintenance")
    || pathname.startsWith("/api")
    || pathname.startsWith("/_next")
    || pathname === "/sw.js"
    || pathname === "/manifest.webmanifest"
    || pathname.startsWith("/icon")
    || pathname.startsWith("/apple-icon")
    || pathname.includes(".");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isAllowedDuringMaintenance(pathname)) return NextResponse.next();

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/platform_settings?id=eq.main&select=maintenance_mode`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) return NextResponse.next();

    const rows = await response.json() as Array<{ maintenance_mode?: boolean }>;
    if (!rows[0]?.maintenance_mode) return NextResponse.next();

    const maintenanceUrl = request.nextUrl.clone();
    maintenanceUrl.pathname = "/maintenance";
    maintenanceUrl.search = "";
    return NextResponse.rewrite(maintenanceUrl);
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
