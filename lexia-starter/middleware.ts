import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { getAdmin2FACookieName, verifyAdmin2FAToken } from "./lib/admin-2fa";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ehmxjwmwwirvnvdakahx.supabase.co";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_rQ0_cgEKffn_XcmhQ56mpA_411CYGEc";

type AccessContext = { role?: string | null };
type CookieToSet = { name: string; value: string; options?: Parameters<NextResponse["cookies"]["set"]>[2] };

function loginRedirect(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/connexion";
  url.search = `?redirect=${encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)}`;
  return url;
}

function verificationRedirect(request: NextRequest, destination: string) {
  const url = request.nextUrl.clone();
  url.pathname = "/verification-admin";
  url.search = `?redirect=${encodeURIComponent(destination)}`;
  return url;
}

function roleDestination(role: string | null | undefined) {
  if (role === "juriste" || role === "avocat") return "/administration/mes-dossiers";
  if (role === "developpeur") return "/administration/developpement";
  return "/tableau-de-bord";
}

function isRoleAllowed(role: string | null | undefined, pathname: string) {
  if (role === "admin") return true;
  if (role === "juriste" || role === "avocat") return pathname.startsWith("/administration/mes-dossiers") || pathname.startsWith("/administration/mes-messages");
  if (role === "developpeur") return pathname.startsWith("/administration/utilisateurs") || pathname.startsWith("/administration/developpement");
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdministration = pathname.startsWith("/administration");
  const isNewCase = pathname === "/nouveau-dossier";
  if (!isAdministration && !isNewCase) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (isNewCase && (userError || !user)) return response;
  if (userError || !user) return NextResponse.redirect(loginRedirect(request));

  const { data: { session } } = await supabase.auth.getSession();
  if (isNewCase && !session) return response;
  if (!session) return NextResponse.redirect(loginRedirect(request));

  const { data, error } = await supabase.rpc("get_my_access_context").maybeSingle();
  const role = !error ? (data as AccessContext | null)?.role : null;

  if (isNewCase) {
    if (role !== "admin") return response;
    const token = request.cookies.get(getAdmin2FACookieName())?.value;
    const verified = await verifyAdmin2FAToken(token, user.id, session.access_token);
    if (!verified) return NextResponse.redirect(verificationRedirect(request, "/administration/nouveau-dossier"));

    const destination = request.nextUrl.clone();
    destination.pathname = "/administration/nouveau-dossier";
    destination.search = "";
    return NextResponse.redirect(destination);
  }

  if (!isRoleAllowed(role, pathname)) {
    const destination = request.nextUrl.clone();
    destination.pathname = roleDestination(role);
    destination.search = "";
    return NextResponse.redirect(destination);
  }

  if (role === "admin") {
    const token = request.cookies.get(getAdmin2FACookieName())?.value;
    const verified = await verifyAdmin2FAToken(token, user.id, session.access_token);
    if (!verified) {
      const destination = request.nextUrl.pathname + request.nextUrl.search;
      return NextResponse.redirect(verificationRedirect(request, destination));
    }
  }

  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}

export const config = { matcher: ["/administration/:path*", "/nouveau-dossier"] };
