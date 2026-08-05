"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../../lib/supabase/client";

type GmailStatus = {
  configured: boolean;
  sender: string;
};

export default function GmailSmtpSetup() {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(false);
  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState("lannexebar14@gmail.com");
  const [appPassword, setAppPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadStatus() {
      const { data } = await supabase.rpc("gmail_smtp_status").maybeSingle();
      if (!active) return;
      const status = data as GmailStatus | null;
      setConfigured(Boolean(status?.configured));
      if (status?.sender) setEmail(status.sender);
      setLoading(false);
    }

    void loadStatus();
    return () => { active = false; };
  }, [supabase]);

  async function activate() {
    const cleanPassword = appPassword.replace(/\s+/g, "");
    setMessage("");

    if (!email.includes("@")) {
      setMessage("Saisissez une adresse Gmail valide.");
      return;
    }
    if (cleanPassword.length !== 16) {
      setMessage("Le mot de passe d’application Google doit contenir exactement 16 caractères.");
      return;
    }

    setSaving(true);
    const { error } = await supabase.rpc("set_gmail_smtp_credentials", {
      p_email: email.trim(),
      p_app_password: cleanPassword,
    });

    if (error) {
      setMessage(error.message || "Les identifiants Gmail n’ont pas pu être enregistrés.");
      setSaving(false);
      return;
    }

    setAppPassword("");
    setConfigured(true);
    setEditing(false);
    setMessage("Envoi Gmail activé. Vous pouvez maintenant écrire à tous les clients.");
    setSaving(false);
  }

  if (loading) {
    return <section className="resend-test-setup loading">Vérification de l’envoi Gmail…</section>;
  }

  if (configured && !editing) {
    return (
      <section className="resend-test-setup active">
        <div className="resend-test-icon">✓</div>
        <div className="resend-test-copy">
          <small>ENVOI GMAIL SÉCURISÉ</small>
          <b>Envoi aux clients activé</b>
          <p>Les e-mails Lexia partent depuis <strong>LEXIA &lt;{email}&gt;</strong>, avec le design de la plateforme.</p>
          {message && <span>{message}</span>}
          <button className="gmail-edit-button" type="button" onClick={() => { setEditing(true); setMessage(""); }}>
            Modifier la connexion Gmail
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="resend-test-setup pending">
      <div className="resend-test-icon">✉</div>
      <div className="resend-test-copy">
        <small>ACTIVATION UNIQUE</small>
        <b>Connecter Gmail à Lexia</b>
        <p>Utilisez un mot de passe d’application Google de 16 caractères. Il sera chiffré dans Supabase et ne sera jamais réaffiché.</p>

        <ol className="gmail-setup-steps">
          <li>Activez la validation en deux étapes sur le compte Google.</li>
          <li>Ouvrez <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer">Mots de passe des applications Google</a>.</li>
          <li>Créez un mot de passe nommé <strong>LEXIA</strong>, puis collez-le ci-dessous.</li>
        </ol>

        <div className="resend-test-form gmail-form">
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Adresse Gmail d’envoi"
          />
          <input
            type="password"
            inputMode="text"
            autoComplete="new-password"
            value={appPassword}
            onChange={(event) => setAppPassword(event.target.value)}
            placeholder="Mot de passe d’application à 16 caractères"
          />
          <button type="button" onClick={activate} disabled={saving}>
            {saving ? "Connexion…" : "Activer Gmail"}
          </button>
        </div>

        {message && <span className="resend-test-error">{message}</span>}
        {editing && <button className="gmail-cancel-button" type="button" onClick={() => { setEditing(false); setMessage(""); setAppPassword(""); }}>Annuler</button>}
      </div>
    </section>
  );
}
