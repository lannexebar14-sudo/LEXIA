"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import styles from "./page.module.css";

type Phase = "loading" | "waiting" | "paid" | "failed" | "error";

type CaseStatus = {
  reference: string;
  total_amount_cents: number;
  status: string;
  payment_status: string;
};

const DRAFT_KEY = "lexia_case_checkout_draft_v1";
const CASE_KEY = "lexia_case_checkout_case_id_v1";

export default function PaiementSuccessPage() {
  const supabase = useMemo(() => createClient(), []);
  const [phase, setPhase] = useState<Phase>("loading");
  const [caseData, setCaseData] = useState<CaseStatus | null>(null);
  const [message, setMessage] = useState("Nous vérifions la confirmation sécurisée envoyée par Stripe.");

  useEffect(() => {
    let active = true;
    let attempts = 0;
    let interval: number | undefined;

    async function checkPayment() {
      const params = new URLSearchParams(window.location.search);
      const caseId = params.get("case") || window.localStorage.getItem(CASE_KEY);

      if (!caseId) {
        if (active) {
          setPhase("error");
          setMessage("La référence du dossier est absente. Consultez votre espace client pour vérifier le paiement.");
        }
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (active) {
          setPhase("error");
          setMessage("Reconnectez-vous à Lexia pour consulter la confirmation du paiement.");
        }
        return;
      }

      const { data, error } = await supabase
        .from("legal_cases")
        .select("reference,total_amount_cents,status,payment_status")
        .eq("id", caseId)
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        if (active) {
          setPhase("error");
          setMessage("Le dossier n’a pas pu être retrouvé. Aucun paiement ne sera considéré comme validé sans confirmation Stripe.");
        }
        return;
      }

      if (!active) return;
      const current = data as CaseStatus;
      setCaseData(current);

      if (current.payment_status === "paid" || current.status === "paid") {
        window.localStorage.removeItem(DRAFT_KEY);
        window.localStorage.removeItem(CASE_KEY);
        setPhase("paid");
        setMessage("Votre paiement a été confirmé. Le dossier est transmis à l’équipe Lexia.");
        if (interval) window.clearInterval(interval);
        return;
      }

      if (["failed", "expired", "refunded"].includes(current.payment_status)) {
        setPhase("failed");
        setMessage(current.payment_status === "refunded"
          ? "Le paiement a été remboursé."
          : "Le paiement n’a pas été confirmé. Vous pouvez reprendre le règlement depuis votre espace.");
        if (interval) window.clearInterval(interval);
        return;
      }

      attempts += 1;
      setPhase("waiting");
      setMessage(attempts > 12
        ? "Stripe traite encore la confirmation. Vous pouvez quitter cette page : votre espace se mettra à jour automatiquement."
        : "Paiement reçu par Stripe, confirmation sécurisée en cours…");
    }

    void checkPayment();
    interval = window.setInterval(() => void checkPayment(), 2500);

    return () => {
      active = false;
      if (interval) window.clearInterval(interval);
    };
  }, [supabase]);

  const amount = caseData ? `${(caseData.total_amount_cents / 100).toFixed(2).replace(".", ",")} €` : "—";
  const icon = phase === "paid" ? "✓" : phase === "failed" || phase === "error" ? "!" : "…";
  const title = phase === "paid"
    ? "Paiement confirmé"
    : phase === "failed"
      ? "Paiement non validé"
      : phase === "error"
        ? "Vérification impossible"
        : "Confirmation en cours";

  return (
    <main className={styles.page}>
      <section className={`${styles.card} ${phase === "waiting" || phase === "loading" ? styles.waiting : ""} ${phase === "failed" || phase === "error" ? styles.failed : ""}`}>
        <div className={styles.logo}>LEXIA<span>.</span></div>
        <div className={styles.icon}>{icon}</div>
        <span className={styles.eyebrow}>PAIEMENT SÉCURISÉ STRIPE</span>
        <h1>{title}</h1>
        <p>{message}</p>

        {(phase === "loading" || phase === "waiting") && <div className={styles.loader} aria-label="Vérification en cours" />}

        {caseData && (
          <div className={styles.summary}>
            <div><span>Référence</span><b>{caseData.reference}</b></div>
            <div><span>Montant</span><b>{amount}</b></div>
            <div><span>Statut</span><b>{phase === "paid" ? "Payé" : phase === "failed" ? "Non validé" : "En vérification"}</b></div>
          </div>
        )}

        <div className={styles.actions}>
          <Link className={styles.primary} href="/tableau-de-bord">Ouvrir mon espace client</Link>
          {(phase === "failed" || phase === "error") && <Link className={styles.secondary} href="/nouveau-dossier">Reprendre le paiement</Link>}
        </div>
      </section>
    </main>
  );
}
