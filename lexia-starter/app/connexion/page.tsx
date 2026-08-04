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

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

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

    if (resetError) {
      setError("Impossible d'envoyer l'e-mail de réinitialisation.");
    } else {
      setMessage("Un lien de réinitialisation a été envoyé à votre adresse e-mail.");
    }
    setResetLoading(false);
  }

  return (
    <main className="auth-page">
      <section className="auth-panel auth-intro">
        <Link href="/" className="logo">LEXIA<span>.</span></Link>
        <div>
          <span className="eyebrow">Bienvenue sur LEXIA</span>
          <h1>Retrouvez votre dossier et vos échanges.</h1>
          <p className="lead">
            Connectez-vous pour suivre vos demandes, transmettre de nouveaux documents et échanger avec votre conseiller.
          </p>
          <div className="auth-benefits">
            <span>✓ Accès sécurisé à vos dossiers</span>
            <span>✓ Messages et documents centralisés</span>
            <span>✓ Suivi de vos prestations et paiements</span>
          </div>
        </div>
      </section>

      <section className="auth-panel auth-form-wrap">
        <div className="auth-card auth-card-login">
          <div className="auth-card-heading">
            <span className="auth-kicker">Espace personnel</span>
            <h2>Connexion</h2>
            <p className="auth-muted">Accédez à votre espace client ou administrateur.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <label>
              Adresse e-mail
              <input name="email" type="email" required autoComplete="email" placeholder="vous@exemple.fr" />
            </label>

            <label>
              Mot de passe
              <input name="password" type="password" required autoComplete="current-password" placeholder="Votre mot de passe" />
            </label>

            <div className="login-options">
              <label className="remember-row">
                <input type="checkbox" name="remember" />
                <span>Rester connecté</span>
              </label>
              <button type="button" className="link-button" onClick={handleResetPassword} disabled={resetLoading}>
                {resetLoading ? "Envoi..." : "Mot de passe oublié ?"}
              </button>
            </div>

            {error && <div className="auth-alert error">{error}</div>}
            {message && <div className="auth-alert success">{message}</div>}

            <button className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <div className="auth-separator"><span>ou</span></div>

          <Link href="/inscription" className="btn btn-outline auth-create-link">
            Créer un compte LEXIA
          </Link>

          <p className="auth-bottom auth-security-note">Connexion protégée et données confidentielles.</p>
        </div>
      </section>
    </main>
  );
}
