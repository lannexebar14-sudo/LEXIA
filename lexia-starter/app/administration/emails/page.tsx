"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { emailCategoryLabels, lexiaEmailTemplates, type LexiaEmailTemplate } from "../../../lib/emailTemplates";
import "../admin.css";
import "../admin-console.css";
import "../../mobile-app.css";
import "./emails.css";

const previewValues: Record<string, string> = {
  "{{ .ConfirmationURL }}": "https://lexia-gold.vercel.app/connexion?confirmation=exemple",
  "{{ .SiteURL }}": "https://lexia-gold.vercel.app",
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
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(lexiaEmailTemplates[0].id);
  const [category, setCategory] = useState<"all" | LexiaEmailTemplate["category"]>("all");
  const [mobilePreview, setMobilePreview] = useState(false);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    async function verifyAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.replace("/connexion?redirect=/administration/emails");
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (profile?.role !== "admin") return router.replace("/tableau-de-bord");
      setLoading(false);
    }
    void verifyAdmin();
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
    await supabase.auth.signOut();
    router.replace("/connexion");
  }

  if (loading) return <main className="admin-loading">Chargement des modèles d’e-mails…</main>;

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
            <p>Prévisualisez et centralisez tous les messages envoyés aux clients avec une identité homogène, rassurante et professionnelle.</p>
          </div>
          <div className="email-studio-summary">
            <strong>{lexiaEmailTemplates.length}</strong>
            <span>modèles prêts</span>
          </div>
        </header>

        <section className="email-activation-note">
          <div>
            <b>Design terminé et compatible Supabase</b>
            <p>Les six modèles d’authentification et les notifications de sécurité utilisent les variables officielles Supabase. Les e-mails de dossiers sont prêts pour le futur service d’envoi transactionnel.</p>
          </div>
          <span>PRÊT À ACTIVER</span>
        </section>

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
