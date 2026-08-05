"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../lib/supabase/client";
import "./stripe.css";

type StripeStatus = {
  configured?: boolean;
  ready?: boolean;
  accountId?: string;
  displayName?: string;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  currency?: string;
  error?: string;
};

export default function StripeLiveSettingsPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [secretKey, setSecretKey] = useState("");
  const [status, setStatus] = useState<StripeStatus>({});
  const [message, setMessage] = useState("");

  async function checkStripe() {
    const { data, error } = await supabase.functions.invoke("check-stripe-live", { body: {} });
    const result = (data || {}) as StripeStatus;
    if (error && !result.error) result.error = "La vérification Stripe n’a pas pu être effectuée.";
    setStatus(result);
    return result;
  }

  useEffect(() => {
    let active = true;

    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.replace("/connexion?redirect=%2Fadministration%2Fparametres%2Fstripe");
        return;
      }

      const { data: access } = await supabase.rpc("get_my_access_context").maybeSingle();
      if (!active) return;
      const role = (access as { role?: string } | null)?.role;
      if (role !== "admin") {
        router.replace("/tableau-de-bord");
        return;
      }

      const { data: config } = await supabase.rpc("stripe_live_status").maybeSingle();
      if (!active) return;
      const configured = Boolean((config as { configured?: boolean } | null)?.configured);
      if (configured) await checkStripe();
      else setStatus({ configured: false, ready: false });
      if (active) setLoading(false);
    }

    void load();
    return () => { active = false; };
  }, [router, supabase]);

  async function activate() {
    const key = secretKey.trim();
    setMessage("");
    if (!key.startsWith("sk_live_") || key.length < 30) {
      setMessage("Collez la clé secrète Stripe commençant par sk_live_.");
      return;
    }

    setSaving(true);
    const { error } = await supabase.rpc("set_stripe_live_secret", { p_key: key });
    if (error) {
      setMessage(error.message || "La clé Stripe n’a pas pu être enregistrée.");
      setSaving(false);
      return;
    }

    setSecretKey("");
    const result = await checkStripe();
    setMessage(result.ready ? "Stripe réel est activé. Les paiements LEXIA peuvent maintenant être encaissés." : result.error || "La clé est enregistrée, mais Stripe n’est pas encore prêt.");
    setSaving(false);
  }

  return (
    <main className="stripe-settings-page">
      <header className="stripe-settings-header">
        <Link href="/administration/parametres">← Paramètres</Link>
        <div className="stripe-wordmark">LEXIA<span>.</span></div>
        <span>PAIEMENTS</span>
      </header>

      <section className="stripe-settings-shell">
        <div className="stripe-settings-intro">
          <small>STRIPE · MODE RÉEL</small>
          <h1>Activer les paiements LEXIA</h1>
          <p>La clé est enregistrée une seule fois dans le coffre chiffré Supabase. Elle n’est jamais envoyée au navigateur ni enregistrée dans GitHub.</p>
        </div>

        {loading ? (
          <div className="stripe-status-card loading">Vérification de Stripe…</div>
        ) : status.ready ? (
          <section className="stripe-status-card ready">
            <div className="stripe-status-icon">✓</div>
            <div>
              <small>PAIEMENTS ACTIVÉS</small>
              <h2>Stripe réel est connecté</h2>
              <p><strong>{status.displayName || "Compte Stripe"}</strong><br />Compte {status.accountId} · EUR</p>
              <div className="stripe-badges"><span>Encaissements actifs</span><span>Virements actifs</span><span>Webhook sécurisé</span></div>
              <button type="button" onClick={() => void checkStripe()}>Vérifier la connexion</button>
            </div>
          </section>
        ) : (
          <section className="stripe-status-card pending">
            <div className="stripe-status-icon">S</div>
            <div className="stripe-status-copy">
              <small>ACTIVATION UNIQUE</small>
              <h2>Enregistrer la clé Stripe live</h2>
              <p>Dans Stripe, ouvrez <strong>Développeurs → Clés API</strong>, affichez la clé secrète réelle puis collez-la ci-dessous.</p>
              <div className="stripe-key-form">
                <input
                  type="password"
                  autoComplete="off"
                  value={secretKey}
                  onChange={(event) => setSecretKey(event.target.value)}
                  placeholder="sk_live_…"
                />
                <button type="button" onClick={activate} disabled={saving}>{saving ? "Activation…" : "Activer Stripe réel"}</button>
              </div>
              {status.error && <span className="stripe-error">{status.error}</span>}
            </div>
          </section>
        )}

        {message && <div className={status.ready ? "stripe-message success" : "stripe-message"}>{message}</div>}

        <section className="stripe-flow-card">
          <h2>Fonctionnement installé</h2>
          <div><span>1</span><p>Le client dépose son dossier et ses documents.</p></div>
          <div><span>2</span><p>Lexia calcule le montant exact : ouverture, urgence et prestations.</p></div>
          <div><span>3</span><p>Stripe Checkout encaisse en euros avec authentification bancaire.</p></div>
          <div><span>4</span><p>Le webhook confirme le paiement avant d’activer le dossier.</p></div>
        </section>
      </section>
    </main>
  );
}
