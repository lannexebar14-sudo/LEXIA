"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import "./dashboard.css";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState("Client");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.replace("/connexion");
      const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).single();
      if (profile?.role === "admin") return router.replace("/administration");
      setName(profile?.full_name || user.email?.split("@")[0] || "Client");
      setLoading(false);
    }
    loadProfile();
  }, [router, supabase]);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/connexion");
  }

  if (loading) return <main className="app-loading">Chargement de votre espace…</main>;

  return (
    <main className="client-app">
      <aside className="client-sidebar">
        <Link href="/" className="app-logo">LEXIA<span>.</span></Link>
        <nav>
          <Link className="active" href="/tableau-de-bord">⌂ Tableau de bord</Link>
          <Link href="/nouveau-dossier">＋ Nouveau dossier</Link>
          <a href="#dossiers">▣ Mes dossiers</a>
          <a href="#messages">✉ Messagerie</a>
          <a href="#documents">▤ Documents</a>
          <a href="#paiements">€ Paiements</a>
        </nav>
        <button onClick={logout}>Se déconnecter</button>
      </aside>

      <section className="client-content">
        <header className="app-topbar">
          <div><small>ESPACE CLIENT</small><h1>Bonjour {name}</h1></div>
          <Link href="/nouveau-dossier" className="app-primary">Déposer un dossier</Link>
        </header>

        <div className="client-hero">
          <div><span>Votre assistance juridique</span><h2>Comment pouvons-nous vous aider aujourd’hui ?</h2><p>Expliquez votre situation, ajoutez vos documents et échangez avec notre équipe dans un espace confidentiel.</p></div>
          <Link href="/nouveau-dossier">Commencer une demande →</Link>
        </div>

        <div className="stats-grid">
          <article><span>Dossiers actifs</span><strong>0</strong><small>Aucun dossier pour le moment</small></article>
          <article><span>Messages non lus</span><strong>0</strong><small>Votre messagerie est à jour</small></article>
          <article><span>Documents</span><strong>0</strong><small>Fichiers sécurisés</small></article>
          <article><span>Prestations</span><strong>0</strong><small>Aucune proposition en attente</small></article>
        </div>

        <div className="client-columns">
          <section className="app-card" id="dossiers">
            <div className="card-title"><div><small>VOS DEMANDES</small><h3>Mes dossiers</h3></div><Link href="/nouveau-dossier">Nouveau</Link></div>
            <div className="empty-state"><div>⚖</div><h4>Aucun dossier déposé</h4><p>Votre première demande apparaîtra ici avec son statut et les réponses de votre conseiller.</p><Link href="/nouveau-dossier">Déposer mon premier dossier</Link></div>
          </section>
          <aside className="app-card help-card"><small>BESOIN D’AIDE ?</small><h3>Une équipe à votre écoute</h3><p>Une fois votre dossier déposé, vous pourrez échanger directement avec votre conseiller.</p><div><b>Réponse personnalisée</b><span>Suivi depuis votre messagerie</span></div><div><b>Documents centralisés</b><span>PDF, photos et justificatifs</span></div></aside>
        </div>
      </section>
    </main>
  );
}
