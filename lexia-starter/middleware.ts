import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ehmxjwmwwirvnvdakahx.supabase.co";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_rQ0_cgEKffn_XcmhQ56mpA_411CYGEc";

type AccessContext = { role?: string | null };

function loginRedirect(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/connexion";
  url.search = `?redirect=${encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)}`;
  return url;
}

function roleDestination(role: string | null | undefined) {
  if (role === "juriste" || role === "avocat") return "/administration/mes-dossiers";
  if (role === "developpeur") return "/administration/developpement";
  return "/tableau-de-bord";
}

function isRoleAllowed(role: string | null | undefined, pathname: string) {
  if (role === "admin") return true;

  if (role === "juriste" || role === "avocat") {
    return pathname.startsWith("/administration/mes-dossiers")
      || pathname.startsWith("/administration/mes-messages");
  }

  if (role === "developpeur") {
    return pathname.startsWith("/administration/utilisateurs")
      || pathname.startsWith("/administration/developpement");
  }

  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // LEXIA est ouverte au public : aucune maintenance globale ne bloque les clients.
  if (!pathname.startsWith("/administration")) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return NextResponse.redirect(loginRedirect(request));

  const { data, error } = await supabase.rpc("get_my_access_context").maybeSingle();
  const role = !error ? (data as AccessContext | null)?.role : null;

  if (!isRoleAllowed(role, pathname)) {
    const destination = request.nextUrl.clone();
    destination.pathname = roleDestination(role);
    destination.search = "";
    return NextResponse.redirect(destination);
  }

  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}

export const config = {
  matcher: ["/administration/:path*"],
};
