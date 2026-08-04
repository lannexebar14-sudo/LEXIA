import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);

    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();
      return NextResponse.redirect(`${origin}${profile?.role === "admin" ? "/administration" : "/tableau-de-bord"}`);
    }
  }

  return NextResponse.redirect(`${origin}/connexion?erreur=${encodeURIComponent("Lien de connexion invalide ou expiré")}`);
}
