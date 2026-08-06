import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  createAdmin2FAToken,
  getAdmin2FACookieName,
  getExpectedAdminCode,
} from "@/lib/admin-2fa";

async function verifyCode(formData: FormData) {
  "use server";

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion?redirect=/administration");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/tableau-de-bord");

  const code = String(formData.get("code") || "").trim();
  if (code !== getExpectedAdminCode()) redirect("/verification-admin?erreur=1");

  cookies().set(getAdmin2FACookieName(), createAdmin2FAToken(user.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  redirect("/administration");
}

export default async function VerificationAdminPage({
  searchParams,
}: {
  searchParams?: { erreur?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion?redirect=/administration");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/tableau-de-bord");

  return (
    <main className="signup-shell">
      <section className="signup-showcase">
        <div className="signup-showcase-top">
          <a className="signup-logo" href="/">LEXIA<span>.</span></a>
        </div>
        <div className="signup-showcase-content">
          <span className="signup-badge">SÉCURITÉ ADMINISTRATEUR</span>
          <h1>Double authentification requise.</h1>
          <p>Saisissez votre code de sécurité pour accéder au back-office LEXIA.</p>
        </div>
      </section>
      <section className="signup-form-side">
        <div className="signup-form-card login-card">
          <div className="signup-form-heading">
            <span>VÉRIFICATION EN DEUX ÉTAPES</span>
            <h2>Code administrateur</h2>
            <p>Cette vérification protège les dossiers, les clients et les paiements.</p>
          </div>
          <form action={verifyCode} className="signup-form login-form">
            <label>
              <span>Code à 6 chiffres</span>
              <input
                type="password"
                name="code"
                inputMode="numeric"
                pattern="[0-9]{6}"
                minLength={6}
                maxLength={6}
                autoComplete="one-time-code"
                placeholder="••••••"
                required
                autoFocus
              />
            </label>
            {searchParams?.erreur === "1" ? (
              <p style={{ color: "#b42318", fontWeight: 700 }}>Code incorrect. Vérifiez puis réessayez.</p>
            ) : null}
            <button className="signup-submit">Accéder à l’administration</button>
          </form>
          <p className="signup-security-note">🔒 Session administrateur sécurisée pendant 8 heures.</p>
        </div>
      </section>
    </main>
  );
}
