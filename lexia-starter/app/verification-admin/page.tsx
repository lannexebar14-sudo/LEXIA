import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import {
  createAdmin2FAToken,
  getAdmin2FACookieName,
  getAdmin2FATtlSeconds,
  isExpectedAdminCode,
} from "../../lib/admin-2fa";

function safeAdminDestination(value: FormDataEntryValue | string | undefined | null) {
  const destination = String(value || "/administration");
  return destination.startsWith("/administration") ? destination : "/administration";
}

async function verifyCode(formData: FormData) {
  "use server";

  const destination = safeAdminDestination(formData.get("redirect"));
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) redirect(`/connexion?redirect=${encodeURIComponent(destination)}`);

  const { data, error } = await supabase.rpc("get_my_access_context").maybeSingle();
  const role = !error ? (data as { role?: string | null } | null)?.role : null;
  if (role !== "admin") redirect("/tableau-de-bord");

  const code = String(formData.get("code") || "").replace(/\D/g, "").slice(0, 6);
  if (!isExpectedAdminCode(code)) {
    redirect(`/verification-admin?erreur=1&redirect=${encodeURIComponent(destination)}`);
  }

  const token = await createAdmin2FAToken(session.user.id, session.access_token);
  cookies().set(getAdmin2FACookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/administration",
    maxAge: getAdmin2FATtlSeconds(),
  });

  redirect(destination);
}

export default async function VerificationAdminPage({ searchParams }: { searchParams?: { erreur?: string; redirect?: string } }) {
  const destination = safeAdminDestination(searchParams?.redirect);
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/connexion?redirect=${encodeURIComponent(destination)}`);

  const { data, error } = await supabase.rpc("get_my_access_context").maybeSingle();
  const role = !error ? (data as { role?: string | null } | null)?.role : null;
  if (role !== "admin") redirect("/tableau-de-bord");

  return (
    <main className="signup-shell">
      <section className="signup-showcase">
        <div className="signup-showcase-top"><a className="signup-logo" href="/">LEXIA<span>.</span></a></div>
        <div className="signup-showcase-content">
          <span className="signup-badge">SÉCURITÉ ADMINISTRATEUR</span>
          <h1>Double authentification requise.</h1>
          <p>Après votre e-mail et votre mot de passe, saisissez le code administrateur à six chiffres.</p>
        </div>
      </section>
      <section className="signup-form-side">
        <div className="signup-form-card login-card">
          <div className="signup-form-heading">
            <span>VÉRIFICATION EN DEUX ÉTAPES</span>
            <h2>Code administrateur</h2>
            <p>Le code est demandé à chaque nouvelle connexion administrateur.</p>
          </div>
          <form action={verifyCode} className="signup-form login-form">
            <input type="hidden" name="redirect" value={destination} />
            <label>
              <span>Code à 6 chiffres</span>
              <input type="password" name="code" inputMode="numeric" pattern="[0-9]{6}" minLength={6} maxLength={6} autoComplete="one-time-code" placeholder="••••••" required autoFocus />
            </label>
            {searchParams?.erreur === "1" ? <p style={{ color: "#b42318", fontWeight: 700 }}>Code incorrect. Vérifiez puis réessayez.</p> : null}
            <button className="signup-submit">Continuer</button>
          </form>
          <p className="signup-security-note">🔒 La validation est liée à cette connexion et devient invalide après déconnexion.</p>
        </div>
      </section>
    </main>
  );
}
