"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import NotificationTestButton from "./NotificationTestButton";
import "./admin.css";
import "../mobile-app.css";

export default function AdministrationPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
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
          <Link className="active" href="/administration">◫ Vue d’ensemble</Link>
          <Link href="/administration/dossiers">▣ Dossiers</Link>
          <Link href="/administration/messages">✉ Messagerie</Link>
          <Link href="/administration/clients">♙ Clients</Link>
          <Link href="/administration/juristes">⚖ Juristes</Link>
          <Link href="/administration/prestations">€ Prestations</Link>
          <Link href="/administration/avocats">⌖ Avocats partenaires</Link>
          <Link href="/administration/parametres">⚙ Paramètres</Link>
        </nav>
        <button onClick={logout}>Se déconnecter</button>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <small>BACK-OFFICE LEXIA</small>
            <h1>Tableau de bord administrateur</h1>
            <p>Suivez les demandes, les clients et l’activité de la plateforme.</p>
          </div>
          <div className="admin-actions">
            <div className="admin-header-buttons">
              <NotificationTestButton />
              <Link className="admin-new-dossier" href="/administration/dossiers">＋ Nouveau dossier</Link>
            </div>
            <span>VT</span>
          </div>
        </header>

        <div className="admin-stats">
          <article><span>Nouveaux dossiers</span><strong>0</strong><i>Cette semaine</i></article>
          <article><span>En cours d’analyse</span><strong>0</strong><i>À traiter</i></article>
          <article><span>Messages en attente</span><strong>0</strong><i>Non lus</i></article>
          <article><span>Chiffre d’affaires</span><strong>0 €</strong><i>Ce mois-ci</i></article>
        </div>

        <div className="admin-grid">
          <section className="admin-card">
            <div className="admin-card-head"><div><small>GESTION DES DEMANDES</small><h2>Dossiers récents</h2></div><Link href="/administration/dossiers">Voir les dossiers</Link></div>
            <div className="admin-empty"><b>Aucun dossier pour le moment</b><p>Les nouvelles demandes apparaîtront ici.</p></div>
          </section>
          <aside className="admin-card">
            <div className="admin-card-head"><div><small>ACCÈS RAPIDES</small><h2>Configurer LEXIA</h2></div></div>
            <div className="priority-item"><span>01</span><div><Link href="/administration/juristes"><b>Ajouter les juristes</b></Link><small>Créer leurs accès sécurisés</small></div></div>
            <div className="priority-item"><span>02</span><div><Link href="/administration/prestations"><b>Créer les prestations</b></Link><small>Tarifs complémentaires</small></div></div>
            <div className="priority-item"><span>03</span><div><Link href="/administration/avocats"><b>Ajouter des avocats</b></Link><small>Développer le réseau partenaire</small></div></div>
          </aside>
        </div>

        <div className="admin-grid lower">
          <Link className="admin-card" href="/administration/messages"><div className="admin-card-head"><div><small>MESSAGERIE</small><h2>Conversations</h2></div><span className="count-pill">0</span></div><div className="mini-empty">Ouvrir la messagerie →</div></Link>
          <Link className="admin-card" href="/administration/prestations"><div className="admin-card-head"><div><small>VENTES</small><h2>Prestations proposées</h2></div></div><div className="offer-row"><span>En attente</span><b>0 €</b></div><div className="offer-row"><span>Payées</span><b>0 €</b></div></Link>
        </div>
      </section>
    </main>
  );
}
