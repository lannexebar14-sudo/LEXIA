"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../../lib/supabase/client";

type TestModeStatus = {
  configured: boolean;
  sender: string;
};

export default function ResendTestSetup() {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadStatus() {
      const { data } = await supabase.rpc("resend_test_mode_status").maybeSingle();
      if (!active) return;
      const status = data as TestModeStatus | null;
      setConfigured(Boolean(status?.configured));
      setLoading(false);
    }

    void loadStatus();
    return () => { active = false; };
  }, [supabase]);

  async function activate() {
    const key = apiKey.trim();
    setMessage("");
    if (!key.startsWith("re_") || key.length < 20) {
      setMessage("Collez une clé Resend valide commençant par re_.");
      return;
    }

    setSaving(true);
    const { error } = await supabase.rpc("set_resend_test_api_key", { p_key: key });
    if (error) {
      setMessage(error.message || "La clé n’a pas pu être enregistrée.");
      setSaving(false);
      return;
    }

    setApiKey("");
    setConfigured(true);
    setMessage("Mode test Resend activé. Vous pouvez maintenant envoyer un e-mail de test.");
    setSaving(false);
  }

  if (loading) {
    return <section className="resend-test-setup loading">Vérification du mode d’envoi…</section>;
  }

  if (configured) {
    return (
      <section className="resend-test-setup active">
        <div className="resend-test-icon">✓</div>
        <div>
          <small>MODE TEST RESEND</small>
          <b>Envoi temporaire activé</b>
          <p>Les e-mails partent depuis <strong>LEXIA &lt;onboarding@resend.dev&gt;</strong>.</p>
          {message && <span>{message}</span>}
        </div>
      </section>
    );
  }

  return (
    <section className="resend-test-setup pending">
      <div className="resend-test-icon">↗</div>
      <div className="resend-test-copy">
        <small>ACTIVATION UNIQUE</small>
        <b>Activer l’envoi temporaire Resend</b>
        <p>Collez la clé temporaire une seule fois. Elle sera chiffrée dans Supabase et ne sera jamais affichée ensuite.</p>
        <div className="resend-test-form">
          <input
            type="password"
            autoComplete="off"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder="Clé Resend re_…"
          />
          <button type="button" onClick={activate} disabled={saving}>
            {saving ? "Activation…" : "Activer l’envoi"}
          </button>
        </div>
        {message && <span className="resend-test-error">{message}</span>}
      </div>
    </section>
  );
}
