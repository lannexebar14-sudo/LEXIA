"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../../lib/supabase/client";

type StatusRow = {
  configured: boolean;
  sender_email: string;
  sender_name: string;
};

type CheckResult = {
  senderFound?: boolean;
  senderActive?: boolean;
  senderEmail?: string;
  senderName?: string;
  error?: string;
  code?: string;
  blockedIp?: string;
  authorizationUrl?: string;
};

export default function BrevoEmailStatus() {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [senderEmail, setSenderEmail] = useState("lannexebar14@gmail.com");
  const [senderName, setSenderName] = useState("LEXIA");
  const [senderFound, setSenderFound] = useState(false);
  const [senderActive, setSenderActive] = useState(false);
  const [message, setMessage] = useState("");
  const [authorizationUrl, setAuthorizationUrl] = useState("");
  const [blockedIp, setBlockedIp] = useState("");

  async function checkConnection() {
    setWorking(true);
    setMessage("");
    setAuthorizationUrl("");
    setBlockedIp("");

    const { data, error } = await supabase.functions.invoke("check-brevo-email", { body: {} });
    const result = (data || {}) as CheckResult;

    if (error || result.error) {
      setMessage(result.error || "La connexion Brevo n’a pas pu être vérifiée.");
      if (result.code === "BREVO_IP_BLOCKED" && result.authorizationUrl) {
        setAuthorizationUrl(result.authorizationUrl);
        setBlockedIp(result.blockedIp || "");
      }
      setWorking(false);
      return;
    }

    setSenderFound(Boolean(result.senderFound));
    setSenderActive(Boolean(result.senderActive));
    if (result.senderEmail) setSenderEmail(result.senderEmail);
    if (result.senderName) setSenderName(result.senderName);

    if (result.senderActive) {
      setMessage("Brevo est prêt : les e-mails peuvent être envoyés à tous les clients.");
    } else if (result.senderFound) {
      setMessage("L’expéditeur existe. Validez l’e-mail reçu de Brevo dans la boîte Gmail.");
    } else {
      setMessage("La connexion fonctionne. Il reste à créer l’expéditeur.");
    }

    setWorking(false);
  }

  useEffect(() => {
    let active = true;

    async function load() {
      const { data } = await supabase.rpc("brevo_email_status").maybeSingle();
      if (!active) return;

      const status = data as StatusRow | null;
      setConfigured(Boolean(status?.configured));
      if (status?.sender_email) setSenderEmail(status.sender_email);
      if (status?.sender_name) setSenderName(status.sender_name);
      setLoading(false);

      if (status?.configured) void checkConnection();
    }

    void load();
    return () => { active = false; };
  }, [supabase]);

  async function ensureSender() {
    setWorking(true);
    setMessage("");

    const { data, error } = await supabase.functions.invoke("ensure-brevo-sender", { body: {} });
    const result = (data || {}) as CheckResult;

    if (error || result.error) {
      setMessage(result.error || "L’expéditeur Brevo n’a pas pu être configuré.");
      setWorking(false);
      return;
    }

    setSenderFound(Boolean(result.senderFound));
    setSenderActive(Boolean(result.senderActive));
    if (result.senderEmail) setSenderEmail(result.senderEmail);
    if (result.senderName) setSenderName(result.senderName);

    if (result.senderActive) {
      setMessage("Brevo est prêt : les e-mails peuvent être envoyés à tous les clients.");
    } else {
      setMessage("Brevo a envoyé un e-mail de validation à Gmail. Ouvrez-le et confirmez l’adresse.");
    }

    setWorking(false);
  }

  if (loading) {
    return <section className="brevo-status-card loading">Connexion sécurisée à Brevo…</section>;
  }

  if (!configured) {
    return (
      <section className="brevo-status-card pending">
        <div className="brevo-status-icon">!</div>
        <div>
          <small>BREVO</small>
          <b>Connexion incomplète</b>
          <p>La configuration Brevo n’est pas encore disponible dans Lexia.</p>
        </div>
      </section>
    );
  }

  return (
    <section className={`brevo-status-card ${senderActive ? "active" : "pending"}`}>
      <div className="brevo-status-icon">{senderActive ? "✓" : "B"}</div>
      <div className="brevo-status-copy">
        <small>ENVOI BREVO SÉCURISÉ</small>
        <b>{senderActive ? "Envoi aux clients activé" : "Brevo est connecté"}</b>
        <p>Les e-mails Lexia partent depuis <strong>{senderName} &lt;{senderEmail}&gt;</strong>, avec le design de la plateforme.</p>

        {message && <span className={senderActive ? "brevo-success" : "brevo-notice"}>{message}</span>}
        {blockedIp && <span className="brevo-ip-value">Adresse à autoriser : {blockedIp}</span>}

        <div className="brevo-actions">
          {authorizationUrl && (
            <a className="brevo-authorize-link" href={authorizationUrl} target="_blank" rel="noreferrer">
              Autoriser l’adresse IP Brevo
            </a>
          )}
          {!authorizationUrl && !senderFound && (
            <button type="button" onClick={ensureSender} disabled={working}>
              {working ? "Configuration…" : "Créer l’expéditeur automatiquement"}
            </button>
          )}
          {!authorizationUrl && senderFound && !senderActive && (
            <button type="button" onClick={checkConnection} disabled={working}>
              {working ? "Vérification…" : "J’ai validé l’e-mail Brevo"}
            </button>
          )}
          {!authorizationUrl && senderActive && (
            <button type="button" onClick={checkConnection} disabled={working}>
              {working ? "Vérification…" : "Vérifier la connexion"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
