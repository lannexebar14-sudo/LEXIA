"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function InscriptionPage() {
  const supabase = createClient();
  const [accountType, setAccountType] = useState<"particulier" | "professionnel">("particulier");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    const fullName = String(form.get("fullName") || "").trim();
    const companyName = String(form.get("companyName") || "").trim();
    const siret = String(form.get("siret") || "").replace(/\s/g, "");

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      setLoading(false);
      return;
    }

    if (accountType === "professionnel" && siret.length !== 14) {
      setError("Le numéro SIRET doit contenir 14 chiffres.");
      setLoading(false);
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/connexion?confirmation=ok`,
        data: {
          full_name: fullName,
          account_type: accountType,
          company_name: accountType === "professionnel" ? companyName : "",
          siret: accountType === "professionnel" ? siret : "",
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
    } else {
      setMessage("Compte créé. Consultez votre boîte e-mail pour confirmer votre inscription.");
      event.currentTarget.reset();
    }

    setLoading(false);
  }

  return (
    <main className="auth-page">
      <section className="auth-panel auth-intro">
        <Link href="/" className="logo">LEXIA<span>.</span></Link>
        <div>
          <span className="eyebrow">Espace sécurisé</span>
          <h1>Créez votre espace juridique.</h1>
          <p className="lead">Déposez vos documents, expliquez votre situation et échangez avec notre équipe depuis un seul espace.</p>
          <div className="auth-benefits">
            <span>✓ Dossier confidentiel</span>
            <span>✓ Messagerie sécurisée</span>
            <span>✓ Orientation vers un avocat si nécessaire</span>
          </div>
        </div>
      </section>

      <section className="auth-panel auth-form-wrap">
        <div className="auth-card">
          <h2>Créer un compte</h2>
          <p className="auth-muted">Choisissez votre profil puis complétez le formulaire.</p>

          <div className="account-switch">
            <button type="button" className={accountType === "particulier" ? "active" : ""} onClick={() => setAccountType("particulier")}>Particulier · 13 €</button>
            <button type="button" className={accountType === "professionnel" ? "active" : ""} onClick={() => setAccountType("professionnel")}>Professionnel · 29 €</button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <label>Nom et prénom<input name="fullName" type="text" required placeholder="Valentin Thiery" /></label>
            {accountType === "professionnel" && (
              <div className="form-grid">
                <label>Entreprise<input name="companyName" type="text" required placeholder="Nom de la société" /></label>
                <label>SIRET<input name="siret" type="text" inputMode="numeric" required maxLength={14} placeholder="14 chiffres" /></label>
              </div>
            )}
            <label>Adresse e-mail<input name="email" type="email" required autoComplete="email" placeholder="vous@exemple.fr" /></label>
            <label>Mot de passe<input name="password" type="password" required minLength={8} autoComplete="new-password" placeholder="8 caractères minimum" /></label>

            {error && <div className="auth-alert error">{error}</div>}
            {message && <div className="auth-alert success">{message}</div>}

            <button className="btn btn-primary auth-submit" disabled={loading}>{loading ? "Création..." : "Créer mon compte"}</button>
          </form>

          <p className="auth-bottom">Déjà inscrit ? <Link href="/connexion">Se connecter</Link></p>
        </div>
      </section>
    </main>
  );
}
