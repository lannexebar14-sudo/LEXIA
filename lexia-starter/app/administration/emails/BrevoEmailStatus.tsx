"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../../lib/supabase/client";

type StatusRow = {
  configured: boolean;
  sender_email: string;
  sender_name: string;
};

export default function BrevoEmailStatus() {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(false);
  const [senderEmail, setSenderEmail] = useState("thieryvalentin2@gmail.com");
  const [senderName, setSenderName] = useState("LEXIA");

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
    }

    void load();
    return () => { active = false; };
  }, [supabase]);

  if (loading) {
    return <section className="brevo-status-card loading">Chargement de la connexion Brevo…</section>;
  }

  if (!configured) {
    return (
      <section className="brevo-status-card pending">
        <div className="brevo-status-icon">!</div>
        <div className="brevo-status-copy">
          <small>ENVOI BREVO</small>
          <b>Configuration incomplète</b>
          <p>La connexion Brevo n’est pas encore disponible dans Lexia.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="brevo-status-card active">
      <div className="brevo-status-icon">✓</div>
      <div className="brevo-status-copy">
        <small>ENVOI BREVO SÉCURISÉ</small>
        <b>Brevo est connecté</b>
        <p>Les e-mails Lexia partent depuis <strong>{senderName} &lt;{senderEmail}&gt;</strong>, avec le design de la plateforme.</p>
        <span className="brevo-success">Clé API enregistrée et expéditeur vérifié.</span>
      </div>
    </section>
  );
}
