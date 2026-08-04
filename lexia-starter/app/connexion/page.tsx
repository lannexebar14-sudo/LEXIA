"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

export default function ConnexionPage() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(
    searchParams.get("confirmation") === "ok"
      ? "Votre adresse e-mail est confirmée. Vous pouvez maintenant vous connecter."
      : ""
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError || !data.user) {
      setError("Adresse e-mail ou mot de passe incorrect.");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      setError("Connexion réussie, mais votre profil n'a pas pu être chargé.");
      setLoading(false);
      return;
    }

    router.push(profile?.role === "admin" ? "/administration" : "/tableau-de-bord");
    router.refresh();
  }

  async function handleResetPassword() {
    const emailInput = document.querySelector<HTMLInputElement>('input[name="email"]');
    const email = emailInput?.value.trim() || "";
    setError("");
    setMessage("");

    if (!email) {
      setError("Renseignez votre adresse e-mail avant de demander un nouveau mot de passe.");
      return;
    }

    setResetLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/connexion`,
    });

    if (resetError) setError("Impossible d'envoyer l'e-mail de réinitialisation.");
    else setMessage("Un lien de réinitialisation vient de vous être envoyé.");

    setResetLoading(false);
  }

  return (
    <main className="signup-shell">
      <section className="signup-showcase">
        <div className="signup-showcase-top">
          <Link href="/" className="signup-logo">LEXIA<span>.</span></Link>
          <Link href="/" className="signup-back">← Retour à l'accueil</Link>
        </div>

        <div className="signup-showcase-content">
          <span className="signup-badge">ESPACE CLIENT SÉCURISÉ</span>
          <h1>Votre dossier juridique, toujours à portée de main.</h1>
          <p>Connectez-vous pour suivre l'avancement de vos demandes, envoyer des documents et échanger avec votre conseiller.</p>

          <div className="signup-points">
            <div><strong>01</strong><span>Consultez vos dossiers en cours</span></div>
            <div><strong>02</strong><span>Retrouvez tous vos messages et documents</span></div>
            <div><strong>03</strong><span>Suivez vos prestations et paiements</span></div>
          </div>
        </div>

        <div className="signup-trust-card">
          <div className="signup-trust-icon">✓</div>
          <div>
            <strong>Connexion confidentielle</strong>
            <p>Vos informations et vos documents restent protégés dans votre espace personnel.</p>
          </div>
        </div>
      </section>

      <section className="signup-form-side">
        <div className="signup-form-card login-card">
          <div className="signup-form-heading">
            <span>ESPACE PERSONNEL</span>
            <h2>Connexion</h2>
            <p>Accédez à votre espace client ou administrateur.</p>
          </div>

          <form onSubmit={handleSubmit} className="signup-form login-form">
            <label>
              <span>Adresse e-mail</span>
              <input name="email" type="email" required autoComplete="email" placeholder="vous@exemple.fr" />
            </label>

            <label>
              <span>Mot de passe</span>
              <input name="password" type="password" required autoComplete="current-password" placeholder="Votre mot de passe" />
            </label>

            <div className="login-options">
              <label className="login-remember">
                <input type="checkbox" name="remember" />
                <span>Rester connecté</span>
              </label>
              <button type="button" className="login-reset" onClick={handleResetPassword} disabled={resetLoading}>
                {resetLoading ? "Envoi..." : "Mot de passe oublié ?"}
              </button>
            </div>

            {error && <div className="signup-alert signup-error">{error}</div>}
            {message && <div className="signup-alert signup-success">{message}</div>}

            <button className="signup-submit" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <div className="login-divider"><span>ou</span></div>
          <Link href="/inscription" className="login-create-account">Créer un compte LEXIA</Link>
          <p className="signup-security-note">Connexion sécurisée · Données confidentielles</p>
        </div>
      </section>
    </main>
  );
}
