"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "../../../lib/supabase/client";

type ClientRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: string | null;
  account_type: string | null;
  company_name: string | null;
};

type EmailHistoryRow = {
  id: string;
  resend_email_id: string | null;
  recipient_user_id: string | null;
  recipient_email: string;
  recipient_name: string | null;
  sender_user_id: string;
  subject: string;
  template_id: string | null;
  message_text: string;
  status: "queued" | "sent" | "failed";
  error_message: string | null;
  created_at: string;
};

type Preset = {
  id: string;
  label: string;
  description: string;
  icon: string;
  subject: string;
  message: string;
};

const presets: Preset[] = [
  {
    id: "custom",
    label: "Message personnalisé",
    description: "Rédigez librement votre message.",
    icon: "✦",
    subject: "",
    message: "",
  },
  {
    id: "case-update",
    label: "Suivi du dossier",
    description: "Informer le client d’une nouvelle mise à jour.",
    icon: "◇",
    subject: "Mise à jour de votre dossier LEXIA",
    message: "Nous vous informons qu’une nouvelle mise à jour est disponible concernant votre dossier. Connectez-vous à votre espace LEXIA afin de consulter les dernières informations et de poursuivre vos démarches.",
  },
  {
    id: "documents-needed",
    label: "Documents nécessaires",
    description: "Demander des pièces complémentaires.",
    icon: "▤",
    subject: "Documents nécessaires pour l’étude de votre dossier",
    message: "Afin de poursuivre l’analyse de votre situation, nous avons besoin de documents complémentaires. Merci de vous connecter à votre espace LEXIA et de déposer les pièces demandées dans votre dossier.",
  },
  {
    id: "answer-ready",
    label: "Réponse disponible",
    description: "Prévenir qu’une réponse est disponible.",
    icon: "✉",
    subject: "Une réponse est disponible dans votre espace LEXIA",
    message: "Une réponse concernant votre demande juridique est désormais disponible. Vous pouvez la consulter dès maintenant en vous connectant à votre espace sécurisé LEXIA.",
  },
  {
    id: "payment-reminder",
    label: "Paiement en attente",
    description: "Rappeler qu’un paiement reste à finaliser.",
    icon: "€",
    subject: "Votre dossier LEXIA est en attente de paiement",
    message: "Votre dossier a bien été enregistré, mais son traitement ne pourra commencer qu’après validation du paiement. Connectez-vous à votre espace LEXIA pour finaliser votre demande en toute sécurité.",
  },
];

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildPreview(name: string, subject: string, message: string) {
  const safeName = escapeHtml(name || "Client LEXIA");
  const safeSubject = escapeHtml(subject || "Votre message LEXIA");
  const safeMessage = escapeHtml(message || "Votre message apparaîtra ici.").replaceAll("\n", "<br>");

  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body style="margin:0;background:#eef1f5;"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eef1f5;"><tr><td align="center" style="padding:24px 10px;"><table width="620" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:620px;background:#fff;border:1px solid #dfe4eb;border-radius:24px;overflow:hidden;"><tr><td style="padding:27px 38px;background:#0b223d;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="font:700 30px Georgia,serif;letter-spacing:4px;color:#fff;">LEXIA<span style="color:#d7bb76;">.</span></td><td align="right" style="font:800 10px Arial,sans-serif;line-height:15px;letter-spacing:1.5px;color:#d7bb76;text-transform:uppercase;">Assistance juridique<br><span style="color:#b7c5d4;font-weight:600;letter-spacing:.4px;">Confidentielle et sécurisée</span></td></tr></table></td></tr><tr><td style="height:5px;background:#d7bb76;font-size:0;line-height:0;">&nbsp;</td></tr><tr><td style="padding:42px 48px 36px;"><p style="margin:0 0 12px;font:900 11px Arial,sans-serif;letter-spacing:2px;color:#9a7836;text-transform:uppercase;">Message de l’équipe LEXIA</p><h1 style="margin:0 0 20px;font:700 34px/41px Georgia,serif;color:#0b223d;">${safeSubject}</h1><p style="margin:0 0 18px;font:16px/26px Arial,sans-serif;color:#26364a;">Bonjour ${safeName},</p><p style="margin:0;font:16px/27px Arial,sans-serif;color:#26364a;">${safeMessage}</p><table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:30px;"><tr><td align="center" style="border-radius:14px;background:#0b223d;"><a href="https://lexiafrance.fr/connexion" style="display:inline-block;padding:15px 26px;font:800 15px Arial,sans-serif;color:#fff;text-decoration:none;">Accéder à mon espace LEXIA</a></td></tr></table><p style="margin:30px 0 0;padding-top:22px;border-top:1px solid #dfe4eb;font:12px/20px Arial,sans-serif;color:#697586;"><strong style="color:#0b223d;">Conseil de sécurité :</strong> LEXIA ne vous demandera jamais votre mot de passe ou vos coordonnées bancaires par e-mail.</p></td></tr><tr><td style="padding:24px 38px;background:#f8fafc;border-top:1px solid #dfe4eb;"><p style="margin:0 0 7px;font:11px/18px Arial,sans-serif;color:#697586;">Cet e-mail a été envoyé par l’administration LEXIA.</p><p style="margin:0;font:11px/18px Arial,sans-serif;color:#8994a3;">LEXIA — Plateforme française d’assistance juridique en ligne · lexiafrance.fr</p></td></tr></table></td></tr></table></body></html>`;
}

async function readFunctionError(error: unknown) {
  const functionError = error as { message?: string; context?: Response };
  if (functionError.context) {
    try {
      const payload = await functionError.context.json() as { error?: string };
      if (payload.error) return payload.error;
    } catch {
      // Le message générique sera utilisé.
    }
  }
  return functionError.message || "L’e-mail n’a pas pu être envoyé.";
}

export default function AdminEmailComposer() {
  const supabase = useMemo(() => createClient(), []);
  const composerRef = useRef<HTMLElement | null>(null);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [history, setHistory] = useState<EmailHistoryRow[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [search, setSearch] = useState("");
  const [presetId, setPresetId] = useState("custom");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [mobilePreview, setMobilePreview] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [loadingClients, setLoadingClients] = useState(true);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      const [usersResult, historyResult] = await Promise.all([
        supabase.rpc("list_users_with_roles"),
        supabase.rpc("list_admin_email_history", { p_limit: 30 }),
      ]);

      if (!active) return;

      if (!usersResult.error) {
        const clientRows = ((usersResult.data as ClientRow[]) || [])
          .filter((user) => !user.role || user.role === "client")
          .sort((a, b) => (a.full_name || a.company_name || a.email).localeCompare(b.full_name || b.company_name || b.email, "fr"));
        setClients(clientRows);
      } else {
        setFeedback({ type: "error", text: "La liste des clients n’a pas pu être chargée." });
      }

      if (!historyResult.error) setHistory((historyResult.data as EmailHistoryRow[]) || []);
      setLoadingClients(false);
    }

    void load();
    return () => { active = false; };
  }, [supabase]);

  const filteredClients = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return clients;
    return clients.filter((client) => `${client.full_name || ""} ${client.company_name || ""} ${client.email}`.toLowerCase().includes(value));
  }, [clients, search]);

  const selectedClient = clients.find((client) => client.id === selectedClientId) || null;
  const selectedName = selectedClient?.full_name || selectedClient?.company_name || "Client LEXIA";
  const previewHtml = useMemo(() => buildPreview(selectedName, subject, message), [selectedName, subject, message]);

  function applyPreset(nextId: string, scrollToComposer = false) {
    setPresetId(nextId);
    const preset = presets.find((item) => item.id === nextId);
    if (preset && preset.id !== "custom") {
      setSubject(preset.subject);
      setMessage(preset.message);
    }
    if (scrollToComposer) {
      window.setTimeout(() => composerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  }

  async function sendEmail() {
    setFeedback(null);
    if (!selectedClient) {
      setFeedback({ type: "error", text: "Sélectionnez d’abord un client inscrit." });
      return;
    }
    if (!subject.trim() || !message.trim()) {
      setFeedback({ type: "error", text: "Complétez l’objet et le contenu du message." });
      return;
    }

    setSending(true);
    const { data, error } = await supabase.functions.invoke("send-admin-email", {
      body: {
        recipientUserId: selectedClient.id,
        subject: subject.trim(),
        message: message.trim(),
        templateId: presetId,
      },
    });

    if (error || data?.error) {
      const errorMessage = data?.error || await readFunctionError(error);
      setFeedback({ type: "error", text: errorMessage });
      setSending(false);
      return;
    }

    setHistory((current) => [{
      id: crypto.randomUUID(),
      resend_email_id: data.emailId,
      recipient_user_id: selectedClient.id,
      recipient_email: selectedClient.email,
      recipient_name: selectedName,
      sender_user_id: "current",
      subject: subject.trim(),
      template_id: presetId,
      message_text: message.trim(),
      status: "sent",
      error_message: null,
      created_at: new Date().toISOString(),
    }, ...current]);
    setFeedback({ type: "success", text: `E-mail envoyé à ${selectedClient.email}.` });
    setSending(false);
  }

  return (
    <section className="admin-email-composer" ref={composerRef}>
      <section className="admin-email-compose-card">
        <header className="admin-email-composer-head">
          <small>NOUVEL ENVOI</small>
          <h1>Écrire à un client</h1>
          <span className="admin-email-title-line" aria-hidden="true" />
          <p>Sélectionnez un compte inscrit, rédigez votre message et envoyez-le avec l’identité visuelle LEXIA.</p>
          <div className="admin-email-sender"><span>De :</span><b>LEXIA &lt;contact@lexiafrance.fr&gt;</b></div>
        </header>

        {feedback && <div className={`admin-email-feedback ${feedback.type}`}>{feedback.text}</div>}

        <div className="admin-email-form-card">
          <label className="admin-email-field">
            <span>Rechercher un client</span>
            <div className="admin-email-control">
              <i aria-hidden="true">⌕</i>
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nom, société ou adresse e-mail" />
            </div>
          </label>

          <label className="admin-email-field">
            <span>Destinataire</span>
            <div className="admin-email-control">
              <i aria-hidden="true">♙</i>
              <select value={selectedClientId} onChange={(event) => setSelectedClientId(event.target.value)} disabled={loadingClients}>
                <option value="">{loadingClients ? "Chargement des clients…" : "Sélectionner un client"}</option>
                {filteredClients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.full_name || client.company_name || "Client LEXIA"} — {client.email}
                  </option>
                ))}
              </select>
            </div>
          </label>

          {selectedClient && (
            <div className="admin-email-recipient-card">
              <span>{selectedName.trim().charAt(0).toUpperCase()}</span>
              <div><b>{selectedName}</b><small>{selectedClient.email}</small></div>
              <em>{selectedClient.account_type === "professionnel" ? "Professionnel" : "Particulier"}</em>
            </div>
          )}

          <label className="admin-email-field">
            <span>Modèle rapide</span>
            <div className="admin-email-control">
              <i className="dark" aria-hidden="true">✦</i>
              <select value={presetId} onChange={(event) => applyPreset(event.target.value)}>
                {presets.map((preset) => <option key={preset.id} value={preset.id}>{preset.label}</option>)}
              </select>
            </div>
          </label>

          <label className="admin-email-field">
            <span>Objet</span>
            <div className="admin-email-control no-icon">
              <input value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={180} placeholder="Objet de l’e-mail" />
            </div>
          </label>

          <label className="admin-email-field">
            <span>Message</span>
            <div className="admin-email-textarea-wrap">
              <textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength={4000} rows={8} placeholder="Rédigez le message destiné au client…" />
              <small>{message.length} / 4000</small>
            </div>
          </label>

          <button className="admin-email-send" type="button" onClick={sendEmail} disabled={sending}>
            <span aria-hidden="true">▷</span>
            {sending ? "Envoi sécurisé en cours…" : "Envoyer l’e-mail au client"}
          </button>
        </div>

        <section className={`admin-email-live-preview ${previewOpen ? "open" : ""}`}>
          <header>
            <button className="admin-email-preview-toggle" type="button" onClick={() => setPreviewOpen((current) => !current)}>
              <span aria-hidden="true">◉</span>
              <div><small>APERÇU EN TEMPS RÉEL</small><b>{selectedClient ? selectedClient.email : "Aucun destinataire sélectionné"}</b></div>
              <em>{previewOpen ? "Masquer" : "Afficher"}</em>
            </button>
            <div className="admin-email-device-tabs">
              <button type="button" className={!mobilePreview ? "active" : ""} onClick={() => setMobilePreview(false)}>▣ Ordinateur</button>
              <button type="button" className={mobilePreview ? "active" : ""} onClick={() => setMobilePreview(true)}>▯ Mobile</button>
            </div>
          </header>
          {previewOpen && (
            <div className={mobilePreview ? "mobile" : "desktop"}>
              <iframe title="Aperçu de l’e-mail au client" srcDoc={previewHtml} sandbox="allow-popups" />
            </div>
          )}
        </section>
      </section>

      <div className="admin-email-bottom-grid">
        <section className="admin-email-history">
          <header>
            <div className="admin-email-section-icon" aria-hidden="true">◷</div>
            <div><small>HISTORIQUE</small><h2>Derniers e-mails envoyés</h2></div>
            <span>{history.length}</span>
          </header>
          <div>
            {history.length === 0 && <p className="admin-email-history-empty">Aucun e-mail envoyé depuis Lexia pour le moment.</p>}
            {history.slice(0, 5).map((item) => (
              <article key={item.id}>
                <span className={`admin-email-status ${item.status}`}>{item.status === "sent" ? "Envoyé" : item.status === "failed" ? "Échec" : "En attente"}</span>
                <div><b>{item.subject}</b><small>{item.recipient_name || "Client LEXIA"} · {item.recipient_email}</small></div>
                <time>{new Date(item.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}</time>
              </article>
            ))}
          </div>
        </section>

        <section className="admin-email-presets">
          <header>
            <div className="admin-email-section-icon" aria-hidden="true">▱</div>
            <div><small>MODÈLES RAPIDES</small><h2>Messages prêts à envoyer</h2></div>
          </header>
          <div className="admin-email-preset-list">
            {presets.filter((preset) => preset.id !== "custom").map((preset) => (
              <button key={preset.id} type="button" onClick={() => applyPreset(preset.id, true)}>
                <span aria-hidden="true">{preset.icon}</span>
                <div><b>{preset.label}</b><small>{preset.description}</small></div>
                <em aria-hidden="true">›</em>
              </button>
            ))}
          </div>
        </section>
      </div>

      <p className="admin-email-security"><span aria-hidden="true">⌾</span> La clé Resend reste chiffrée côté serveur et n’est jamais exposée au navigateur.</p>
    </section>
  );
}
