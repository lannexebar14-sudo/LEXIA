"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import "./admin.css";
import "../mobile-app.css";

export default function AdministrationPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);

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
          <a className="active" href="#dashboard">◫ Vue d’ensemble</a>
          <a href="#dossiers">▣ Dossiers</a>
          <a href="#messages">✉ Messagerie</a>
          <a href="#clients">♙ Clients</a>
          <a href="#juristes">⚖ Juristes</a>
          <a href="#prestations">€ Prestations</a>
          <a href="#avocats">⌖ Avocats partenaires</a>
          <a href="#parametres">⚙ Paramètres</a>
        </nav>
        <button onClick={logout}>Se déconnecter</button>
      </aside>

      <section className="admin-main" id="dashboard">
        <header className="admin-topbar">
          <div><small>BACK-OFFICE LEXIA</small><h1>Tableau de bord administrateur</h1><p>Suivez les demandes, les clients et l’activité de la plateforme.</p></div>
          <div className="admin-actions"><button>＋ Nouveau dossier</button><span>VT</span></div>
        </header>

        <div className="admin-stats">
          <article><div><span>Nouveaux dossiers</span><strong>0</strong></div><i>Cette semaine</i></article>
          <article><div><span>En cours d’analyse</span><strong>0</strong></div><i>À traiter</i></article>
          <article><div><span>Messages en attente</span><strong>0</strong></div><i>Non lus</i></article>
          <article><div><span>Chiffre d’affaires</span><strong>0 €</strong></div><i>Ce mois-ci</i></article>
        </div>

        <div className="admin-grid">
          <section className="admin-card admin-wide" id="dossiers">
            <div className="admin-card-head"><div><small>GESTION DES DEMANDES</small><h2>Dossiers récents</h2></div><button>Voir tous les dossiers</button></div>
            <div className="admin-table-head"><span>Dossier</span><span>Client</span><span>Catégorie</span><span>Statut</span><span>Montant</span></div>
            <div className="admin-empty"><b>Aucun dossier pour le moment</b><p>Les nouvelles demandes déposées par les clients apparaîtront automatiquement ici.</p></div>
          </section>

          <aside className="admin-card">
            <div className="admin-card-head"><div><small>À FAIRE</small><h2>Priorités</h2></div></div>
            <div className="priority-item"><span>01</span><div><b>Configurer les catégories</b><small>Préparer le formulaire de dépôt</small></div></div>
            <div className="priority-item"><span>02</span><div><b>Ajouter les juristes</b><small>Créer leurs accès sécurisés</small></div></div>
            <div className="priority-item"><span>03</span><div><b>Configurer les prestations</b><small>Tarifs et propositions payantes</small></div></div>
          </aside>
        </div>

        <div className="admin-grid lower">
          <section className="admin-card" id="messages"><div className="admin-card-head"><div><small>MESSAGERIE</small><h2>Conversations</h2></div><span className="count-pill">0</span></div><div className="mini-empty">Aucun message en attente.</div></section>
          <section className="admin-card" id="prestations"><div className="admin-card-head"><div><small>VENTES</small><h2>Prestations proposées</h2></div></div><div className="offer-row"><span>En attente</span><b>0 €</b></div><div className="offer-row"><span>Payées</span><b>0 €</b></div><div className="offer-row"><span>Refusées</span><b>0</b></div></section>
        </div>
      </section>
    </main>
  );
}
