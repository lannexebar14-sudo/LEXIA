"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import "../admin.css";
import "./section.css";

type SectionConfig = { title: string; eyebrow: string; description: string; action: string; icon: string };

const configs: Record<string, SectionConfig> = {
  dossiers: { title: "Dossiers", eyebrow: "GESTION JURIDIQUE", description: "Consultez, recherchez et attribuez les demandes déposées.", action: "Créer un dossier", icon: "▣" },
  messages: { title: "Messagerie", eyebrow: "ÉCHANGES CLIENTS", description: "Centralisez les conversations liées aux dossiers.", action: "Nouveau message", icon: "✉" },
  clients: { title: "Clients", eyebrow: "UTILISATEURS", description: "Retrouvez les particuliers et professionnels inscrits.", action: "Ajouter un client", icon: "♙" },
  juristes: { title: "Juristes", eyebrow: "ÉQUIPE", description: "Gérez les accès, spécialités et dossiers attribués.", action: "Ajouter un juriste", icon: "⚖" },
  prestations: { title: "Prestations", eyebrow: "OFFRES PAYANTES", description: "Créez et suivez les propositions complémentaires.", action: "Créer une prestation", icon: "€" },
  avocats: { title: "Avocats partenaires", eyebrow: "RÉSEAU PARTENAIRE", description: "Référencez les avocats selon leur barreau et leurs spécialités.", action: "Ajouter un avocat", icon: "⌖" },
  parametres: { title: "Paramètres", eyebrow: "CONFIGURATION", description: "Configurez les tarifs, catégories et préférences de la plateforme.", action: "Enregistrer", icon: "⚙" },
};

export default function AdminSectionPage() {
  const params = useParams<{ section: string }>();
  const section = params.section || "dossiers";
  const config = configs[section] || configs.dossiers;
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    async function verifyAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.replace("/connexion");
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (profile?.role !== "admin") return router.replace("/tableau-de-bord");
      setLoading(false);
    }
    verifyAdmin();
  }, [router, supabase]);

  const emptyText = useMemo(() => ({
    dossiers: "Aucun dossier enregistré pour le moment.",
    messages: "Aucune conversation en attente.",
    clients: "Aucun autre client inscrit pour le moment.",
    juristes: "Aucun juriste ajouté pour le moment.",
    prestations: "Aucune prestation complémentaire créée.",
    avocats: "Aucun avocat partenaire référencé.",
    parametres: "Les paramètres principaux sont prêts à être configurés.",
  }[section] || "Aucune donnée."), [section]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(`${config.title} : les informations ont bien été enregistrées.`);
    setShowForm(false);
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/connexion");
  }

  if (loading) return <main className="admin-loading">Vérification de vos accès…</main>;

  return (
    <main className="admin-app">
      <aside className="admin-sidebar">
        <Link href="/" className="admin-logo">LEXIA<span>.</span></Link>
        <div className="admin-badge">ADMINISTRATION</div>
        <nav>
          <Link href="/administration">◫ Vue d’ensemble</Link>
          <Link className={section === "dossiers" ? "active" : ""} href="/administration/dossiers">▣ Dossiers</Link>
          <Link className={section === "messages" ? "active" : ""} href="/administration/messages">✉ Messagerie</Link>
          <Link className={section === "clients" ? "active" : ""} href="/administration/clients">♙ Clients</Link>
          <Link className={section === "juristes" ? "active" : ""} href="/administration/juristes">⚖ Juristes</Link>
          <Link className={section === "prestations" ? "active" : ""} href="/administration/prestations">€ Prestations</Link>
          <Link className={section === "avocats" ? "active" : ""} href="/administration/avocats">⌖ Avocats partenaires</Link>
          <Link className={section === "parametres" ? "active" : ""} href="/administration/parametres">⚙ Paramètres</Link>
        </nav>
        <button onClick={logout}>Se déconnecter</button>
      </aside>

      <section className="admin-main">
        <header className="section-header">
          <div><small>{config.eyebrow}</small><h1>{config.icon} {config.title}</h1><p>{config.description}</p></div>
          <button onClick={() => setShowForm(true)}>＋ {config.action}</button>
        </header>

        {notice && <div className="section-notice">{notice}</div>}

        <section className="admin-card section-toolbar">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Rechercher dans ${config.title.toLowerCase()}…`} />
          <select defaultValue="tous"><option value="tous">Tous les statuts</option><option value="actif">Actif</option><option value="attente">En attente</option></select>
          <button onClick={() => setNotice(query ? `Recherche lancée pour « ${query} ».` : "Saisissez un terme de recherche.")}>Rechercher</button>
        </section>

        <section className="admin-card section-content">
          <div className="admin-card-head"><div><small>{config.eyebrow}</small><h2>{config.title}</h2></div><span className="count-pill">0</span></div>
          <div className="section-empty"><div>{config.icon}</div><b>{emptyText}</b><p>Les prochains éléments apparaîtront automatiquement ici.</p><button onClick={() => setShowForm(true)}>{config.action}</button></div>
        </section>
      </section>

      {showForm && <div className="modal-backdrop" onClick={() => setShowForm(false)}><form className="admin-modal" onSubmit={submit} onClick={(e) => e.stopPropagation()}><button type="button" className="modal-close" onClick={() => setShowForm(false)}>×</button><small>{config.eyebrow}</small><h2>{config.action}</h2><label>Titre ou nom<input required placeholder="Saisissez une information" /></label><label>Description<textarea rows={5} placeholder="Ajoutez les détails utiles" /></label><div className="modal-actions"><button type="button" onClick={() => setShowForm(false)}>Annuler</button><button type="submit">Enregistrer</button></div></form></div>}
    </main>
  );
}
