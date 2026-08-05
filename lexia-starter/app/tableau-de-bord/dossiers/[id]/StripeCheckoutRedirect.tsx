"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "../../../../lib/supabase/client";
import "./stripe-checkout.css";

type CheckoutResult = {
  success?: boolean;
  checkoutUrl?: string;
  url?: string;
  error?: string;
  amountCents?: number;
};

async function readFunctionError(error: unknown) {
  const candidate = error as { message?: string; context?: Response };
  if (candidate?.context) {
    try {
      const body = await candidate.context.clone().json() as { error?: string };
      if (body.error) return body.error;
    } catch {
      // Le message générique sera utilisé.
    }
  }
  return candidate?.message || "Le paiement Stripe n’a pas pu être préparé.";
}

export default function StripeCheckoutRedirect() {
  const supabase = useMemo(() => createClient(), []);
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const started = useRef(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  const caseId = String(params?.id || "");
  const shouldStart = searchParams.get("depot") === "confirme" || searchParams.get("paiement") === "reprendre";

  async function startCheckout() {
    if (!caseId || working) return;
    setWorking(true);
    setError("");

    const { data, error: functionError } = await supabase.functions.invoke<CheckoutResult>("create-stripe-checkout", {
      body: { caseId },
    });

    if (functionError || data?.error) {
      setError(data?.error || await readFunctionError(functionError));
      setWorking(false);
      return;
    }

    const checkoutUrl = data?.checkoutUrl || data?.url;
    if (!checkoutUrl) {
      setError("Stripe n’a pas retourné de page de paiement.");
      setWorking(false);
      return;
    }

    window.location.replace(checkoutUrl);
  }

  useEffect(() => {
    if (!shouldStart || started.current) return;
    started.current = true;
    void startCheckout();
  }, [shouldStart, caseId]);

  if (!shouldStart) return null;

  return (
    <div className="stripe-checkout-overlay" role="dialog" aria-modal="true" aria-live="polite">
      <section className="stripe-checkout-card">
        <div className="stripe-checkout-logo">LEXIA<span>.</span></div>
        {error ? (
          <>
            <div className="stripe-checkout-state error">!</div>
            <small>PAIEMENT NON DÉMARRÉ</small>
            <h2>Stripe doit être vérifié</h2>
            <p>{error}</p>
            <div className="stripe-checkout-actions">
              <button type="button" onClick={() => void startCheckout()} disabled={working}>{working ? "Nouvelle tentative…" : "Réessayer le paiement"}</button>
              <Link href={`/tableau-de-bord/dossiers/${caseId}`}>Revenir au dossier</Link>
            </div>
          </>
        ) : (
          <>
            <div className="stripe-checkout-state"><span /></div>
            <small>PAIEMENT SÉCURISÉ</small>
            <h2>Ouverture de Stripe…</h2>
            <p>Votre dossier est enregistré. Vous allez être redirigé vers Stripe pour finaliser le paiement.</p>
            <div className="stripe-checkout-security">🔒 Aucune donnée bancaire n’est enregistrée par LEXIA.</div>
          </>
        )}
      </section>
    </div>
  );
}
