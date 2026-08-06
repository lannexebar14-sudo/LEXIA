"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { createClient } from "../../lib/supabase/client";

type RegistrationResult = {
  success?: boolean;
  message?: string;
  error?: string;
};

async function functionErrorMessage(error: unknown, fallback: string) {
  const candidate = error as { message?: string; context?: Response };
  if (candidate?.context) {
    try {
      const body = await candidate.context.clone().json() as { error?: string };
      if (body.error) return body.error;
    } catch {
      // Certaines réponses techniques ne sont pas lisibles en JSON.
    }
  }
  return candidate?.message && !candidate.message.includes("non-2xx") ? candidate.message : fallback;
}

export default function InscriptionPage() {
  const supabase = useMemo(() => createClient(), []);
  const [accountType, setAccountType] = useState<"particulier" | "professionnel">("particulier");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    const formElement = event.currentTarget;
    setLoading(true);
    setMessage("");
    setError("");

    const form = new FormData(formElement);
    const email = String(form.get("email") || "").trim().toLowerCase();
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

    try {
      const { data, error: registrationError } = await supabase.functions.invoke<RegistrationResult>("register-client", {
        body: {
          email,
          password,
          fullName,
          accountType,
          companyName: accountType === "professionnel" ? companyName : "",
          siret: accountType === "professionnel" ? siret : "",
        },
      });

      if (registrationError) {
        throw new Error(await functionErrorMessage(registrationError, "L’inscription n’a pas pu être finalisée."));
      }
      if (!data?.success) throw new Error(data?.error || "L’inscription n’a pas pu être finalisée.");

      setMessage(data.message || "Votre compte est créé. Consultez votre boîte e-mail pour confirmer votre adresse.");
      formElement.reset();
      setAccountType("particulier");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "L’inscription est momentanément indisponible.");
    }

    setLoading(false);
  }

  return (
    <main className="signup-shell">
      <section className="signup-showcase">
        <div className="signup-showcase-top">
          <Link href="/" className="signup-logo">LEXIA<span>.</span></Link>
          <Link href="/" className="signup-back">← Retour au site</Link>
        </div>

        <div className="signup-showcase-content">
          <span className="signup-badge">ASSISTANCE JURIDIQUE EN LIGNE</span>
          <h1>Votre dossier mérite une réponse claire.</h1>
          <p>Créez votre espace confidentiel, transmettez vos documents et échangez directement avec notre équipe.</p>

          <div className="signup-points">
            <div><strong>01</strong><span>Dépôt simple de votre situation</span></div>
            <div><strong>02</strong><span>Documents centralisés et sécurisés</span></div>
            <div><strong>03</strong><span>Échanges privés avec un conseiller</span></div>
          </div>
        </div>

        <div className="signup-trust-card">
          <span className="signup-trust-icon">⚖</span>
          <div>
            <strong>Un accompagnement humain</strong>
            <p>Et une orientation vers un avocat proche de chez vous lorsque la situation l’exige.</p>
          </div>
        </div>
      </section>

      <section className="signup-form-side">
        <div className="signup-form-card">
          <div className="signup-form-heading">
            <span>BIENVENUE CHEZ LEXIA</span>
            <h2>Créer votre compte</h2>
            <p>Sélectionnez votre profil avant de commencer.</p>
          </div>

          <div className="signup-account-types">
            <button type="button" className={accountType === "particulier" ? "selected" : ""} onClick={() => setAccountType("particulier")} disabled={loading}>
              <span className="signup-type-icon">👤</span>
              <span><strong>Particulier</strong><small>Ouverture de dossier : 13 €</small></span>
            </button>
            <button type="button" className={accountType === "professionnel" ? "selected" : ""} onClick={() => setAccountType("professionnel")} disabled={loading}>
              <span className="signup-type-icon">🏢</span>
              <span><strong>Professionnel</strong><small>Ouverture de dossier : 29 €</small></span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="signup-form">
            <label>
              <span>Nom et prénom</span>
              <input name="fullName" type="text" required placeholder="Votre identité complète" disabled={loading} />
            </label>

            {accountType === "professionnel" && (
              <div className="signup-two-columns">
                <label>
                  <span>Nom de l’entreprise</span>
                  <input name="companyName" type="text" required placeholder="Raison sociale" disabled={loading} />
                </label>
                <label>
                  <span>Numéro SIRET</span>
                  <input name="siret" type="text" inputMode="numeric" required maxLength={14} placeholder="14 chiffres" disabled={loading} />
                </label>
              </div>
            )}

            <label>
              <span>Adresse e-mail</span>
              <input name="email" type="email" required autoComplete="email" placeholder="nom@exemple.fr" disabled={loading} />
            </label>

            <label>
              <span>Mot de passe</span>
              <input name="password" type="password" required minLength={8} autoComplete="new-password" placeholder="8 caractères minimum" disabled={loading} />
            </label>

            <label className="signup-consent">
              <input type="checkbox" required disabled={loading} />
              <span>J’accepte les conditions d’utilisation et la politique de confidentialité.</span>
            </label>

            {error && <div className="signup-alert signup-error" role="alert">{error}</div>}
            {message && <div className="signup-alert signup-success" role="status">{message}</div>}

            <button className="signup-submit" disabled={loading}>
              {loading ? "Envoi du lien sécurisé…" : "Créer mon espace sécurisé"}
            </button>
          </form>

          <div className="signup-login-link">
            Déjà inscrit ? <Link href="/connexion">Se connecter</Link>
          </div>

          <div className="signup-security-note">🔒 Vos informations sont protégées et confidentielles.</div>
        </div>
      </section>
    </main>
  );
}
