"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { emailCategoryLabels, lexiaEmailTemplates, type LexiaEmailTemplate } from "../../../lib/emailTemplates";
import AdminEmailComposer from "./AdminEmailComposer";
import "../admin.css";
import "../admin-console.css";
import "../../mobile-app.css";
import "./emails.css";

const previewValues: Record<string, string> = {
  "{{ .ConfirmationURL }}": "https://lexia-gold.vercel.app/connexion?confirmation=exemple",
  "{{ .SiteURL }}": "https://lexiafrance.fr",
  "{{ .Token }}": "482731",
  "{{ .NewEmail }}": "nouvelle.adresse@exemple.fr",
  "{{ .OldEmail }}": "ancienne.adresse@exemple.fr",
  "{{ .Email }}": "client@exemple.fr",
  "{{ reference }}": "LEX-2026-000145",
  "{{ subject }}": "Litige avec mon propriétaire",
  "{{ status_label }}": "Analyse en cours",
  "{{ case_url }}": "https://lexia-gold.vercel.app/tableau-de-bord/dossiers/exemple",
  "{{ conversation_url }}": "https://lexia-gold.vercel.app/tableau-de-bord/dossiers/exemple#conversation",
  "{{ amount }}": "13,00 € TTC",
};

type AccessContext = { role?: string | null };

function renderPreview(html: string) {
  return Object.entries(previewValues).reduce((result, [variable, value]) => result.split(variable).join(value), html);
}

function templateType(template: LexiaEmailTemplate) {
  if (template.category === "auth") return "E-mail d’authentification Supabase";
  if (template.category === "security") return "Notification de sécurité Supabase";
  return "E-mail transactionnel LEXIA";
}

export default function AdministrationEmailsPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [activeId, setActiveId] = useState(lexiaEmailTemplates[0].id);
  const [category, setCategory] = useState<"all" | LexiaEmailTemplate["category"]>("all");
  const [mobilePreview, setMobilePreview] = useState(false);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    let active = true;

    async function verifyAdminInBackground() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;
      if (!session?.user) {
        router.replace("/connexion?redirect=%2Fadministration%2Femails");
        return;
      }

      const { data, error } = await supabase.rpc("get_my_access_context").maybeSingle();
      if (!active || error) return;
      const context = data as AccessContext | null;
      if (context?.role !== "admin") router.replace("/tableau-de-bord");
    }

    void verifyAdminInBackground();
    return () => { active = false; };
  }, [router, supabase]);

  const visibleTemplates = useMemo(
    () => category === "all" ? lexiaEmailTemplates : lexiaEmailTemplates.filter((template) => template.category === category),
    [category],
  );

  const activeTemplate = lexiaEmailTemplates.find((template) => template.id === activeId) || lexiaEmailTemplates[0];
  const previewHtml = useMemo(() => renderPreview(activeTemplate.html), [activeTemplate]);

  async function copy(value: string, label: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1800);
  }

  async function logout() {
    await supabase.auth.signOut({ scope: "local" });
    router.replace("/connexion");
  }

  return (
    <main className="admin-app">
      <aside className="admin-sidebar">
        <Link href="/administration" className="admin-logo">LEXIA<span>.</span></Link>
        <div className="admin-badge">ADMINISTRATION</div>
        <nav>
          <Link href="/administration">◫ Vue d’ensemble</Link>
          <Link href="/administration/dossiers">▣ Dossiers</Link>
          <Link href="/administration/messages">✉ Messagerie</Link>
          <Link href="/administration/clients">♙ Clients</Link>
          <Link href="/administration/juristes">⚖ Juristes</Link>
          <Link href="/administration/prestations">€ Prestations</Link>
          <Link href="/administration/avocats">⌖ Avocats partenaires</Link>
          <Link className="active" href="/administration/emails">＠ E-mails</Link>
          <Link href="/administration/parametres">⚙ Paramètres</Link>
        </nav>
        <button onClick={logout}>Se déconnecter</button>
      </aside>

      <section className="admin-main email-studio-page">
        <header className="email-studio-hero">
          <div>
            <small>IDENTITÉ DE COMMUNICATION</small>
            <h1>E-mails LEXIA</h1>
            <p>Sélectionnez un client inscrit, envoyez-lui un message avec le design LEXIA et suivez l’historique des envois.</p>
          </div>
          <div className="email-studio-summary">
            <strong>{lexiaEmailTemplates.length}</strong>
            <span>modèles prêts</span>
          </div>
        </header>

        <section className="email-activation-note">
          <div>
            <b>Resend connecté à lexiafrance.fr</b>
            <p>L’envoi sécurisé depuis contact@lexiafrance.fr est intégré. Les enregistrements DNS doivent être validés avant le premier envoi réel.</p>
          </div>
          <span>DNS À VALIDER</span>
        </section>

        <AdminEmailComposer />

        <div className="email-studio-grid">
          <aside className="email-template-panel">
            <div className="email-category-tabs">
              <button className={category === "all" ? "active" : ""} onClick={() => setCategory("all")}>Tous</button>
              {(Object.keys(emailCategoryLabels) as LexiaEmailTemplate["category"][]).map((key) => (
                <button key={key} className={category === key ? "active" : ""} onClick={() => setCategory(key)}>{emailCategoryLabels[key]}</button>
              ))}
            </div>

            <div className="email-template-list">
              {visibleTemplates.map((template) => (
                <button key={template.id} className={activeTemplate.id === template.id ? "active" : ""} onClick={() => setActiveId(template.id)}>
                  <span>{template.category === "auth" ? "✉" : template.category === "security" ? "⌾" : "◇"}</span>
                  <div>
                    <b>{template.label}</b>
                    <small>{template.description}</small>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <section className="email-preview-panel">
            <header className="email-preview-toolbar">
              <div>
                <small>{templateType(activeTemplate)}</small>
                <h2>{activeTemplate.label}</h2>
              </div>
              <div className="email-preview-actions">
                <button className={!mobilePreview ? "active" : ""} onClick={() => setMobilePreview(false)}>Ordinateur</button>
                <button className={mobilePreview ? "active" : ""} onClick={() => setMobilePreview(true)}>Mobile</button>
              </div>
            </header>

            <div className="email-subject-card">
              <div><small>OBJET DE L’E-MAIL</small><b>{activeTemplate.subject}</b></div>
              <button onClick={() => copy(activeTemplate.subject, "subject")}>{copied === "subject" ? "Copié ✓" : "Copier l’objet"}</button>
            </div>

            <div className={`email-preview-stage ${mobilePreview ? "mobile" : "desktop"}`}>
              <iframe title={`Aperçu ${activeTemplate.label}`} srcDoc={previewHtml} sandbox="allow-popups" />
            </div>

            <div className="email-code-actions">
              <div>
                <small>{activeTemplate.supabaseTemplate ? `SUPABASE · ${activeTemplate.supabaseTemplate}` : "MODÈLE TRANSACTIONNEL"}</small>
                <p>Le HTML utilise uniquement des styles compatibles avec les principales messageries et s’adapte automatiquement aux écrans mobiles.</p>
              </div>
              <button onClick={() => copy(activeTemplate.html, "html")}>{copied === "html" ? "HTML copié ✓" : "Copier le HTML"}</button>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
