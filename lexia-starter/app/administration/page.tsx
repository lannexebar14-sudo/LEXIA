"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import NotificationTestButton from "./NotificationTestButton";
import "./admin.css";
import "./admin-actions.css";
import "./admin-live.css";
import "../mobile-app.css";

type AdminCase = {
  id: string;
  reference: string;
  subject: string;
  category: string;
  status: string;
  urgency: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
};

type PaymentRow = {
  amount: number;
  status: string;
  paid_at: string | null;
};

const statusLabels: Record<string, string> = {
  submitted: "Nouveau dossier",
  payment_pending: "Paiement en attente",
  paid: "Paiement confirmé",
  in_review: "Analyse en cours",
  awaiting_client: "Client attendu",
  completed: "Terminé",
  cancelled: "Annulé",
};

export default function AdministrationPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<AdminCase[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);

  useEffect(() => {
    let mounted = true;

    async function loadAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.replace("/connexion");
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (profile?.role !== "admin") return router.replace("/tableau-de-bord");

      const [caseResult, paymentResult] = await Promise.all([
        supabase.from("legal_cases").select("id,reference,subject,category,status,urgency,total_amount,created_at,updated_at").order("created_at", { ascending: false }),
        supabase.from("payment_transactions").select("amount,status,paid_at").eq("status", "paid"),
      ]);

      if (!mounted) return;
      setCases((caseResult.data as AdminCase[]) || []);
      setPayments((paymentResult.data as PaymentRow[]) || []);
      setLoading(false);
    }

    loadAdmin();

    const channel = supabase
      .channel("admin-dashboard-cases")
      .on("postgres_changes", { event: "*", schema: "public", table: "legal_cases" }, (payload) => {
        if (payload.eventType === "DELETE") {
          setCases((current) => current.filter((item) => item.id !== (payload.old as { id?: string }).id));
          return;
        }
        const incoming = payload.new as AdminCase;
        setCases((current) => [incoming, ...current.filter((item) => item.id !== incoming.id)].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [router, supabase]);

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const newThisWeek = cases.filter((legalCase) => new Date(legalCase.created_at) >= weekStart).length;
  const inReview = cases.filter((legalCase) => legalCase.status === "in_review").length;
  const pendingCases = cases.filter((legalCase) => ["submitted", "awaiting_client"].includes(legalCase.status)).length;
  const monthRevenue = payments.filter((payment) => payment.paid_at && new Date(payment.paid_at) >= monthStart).reduce((total, payment) => total + payment.amount, 0);
  const recentCases = cases.slice(0, 5);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/connexion");
  }

  if (loading) return <main className="admin-loading">Vérification de vos accès…</main>;

  return (
    <main className="admin-app">
      <aside className="admin-sidebar">
        <Link href="/administration" className="admin-logo">LEXIA<span>.</span></Link>
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
          <div><small>BACK-OFFICE LEXIA</small><h1>Tableau de bord administrateur</h1><p>Suivez les demandes, les clients et l’activité de la plateforme.</p></div>
          <div className="admin-actions"><div className="admin-header-buttons"><NotificationTestButton /><Link className="admin-new-dossier" href="/administration/dossiers">Voir les dossiers</Link></div><span>VT</span></div>
        </header>

        <div className="admin-stats">
          <article><span>Nouveaux dossiers</span><strong>{newThisWeek}</strong><i>Cette semaine</i></article>
          <article><span>En cours d’analyse</span><strong>{inReview}</strong><i>À traiter</i></article>
          <article><span>Actions en attente</span><strong>{pendingCases}</strong><i>Nouveaux ou client attendu</i></article>
          <article><span>Chiffre d’affaires</span><strong>{new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(monthRevenue / 100)}</strong><i>Ce mois-ci</i></article>
        </div>

        <div className="admin-grid">
          <section className="admin-card">
            <div className="admin-card-head"><div><small>GESTION DES DEMANDES</small><h2>Dossiers récents</h2></div><Link href="/administration/dossiers">Voir tous les dossiers</Link></div>
            {recentCases.length === 0 ? <div className="admin-empty"><b>Aucun dossier pour le moment</b><p>Les nouvelles demandes apparaîtront ici.</p></div> : <div className="admin-live-cases">{recentCases.map((legalCase) => <Link href="/administration/dossiers" key={legalCase.id}><div><small>{legalCase.reference} · {legalCase.category}</small><b>{legalCase.subject}</b><span>Créé le {new Date(legalCase.created_at).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}</span></div><em className={`status-${legalCase.status}`}>{statusLabels[legalCase.status] || legalCase.status}</em><strong>›</strong></Link>)}</div>}
          </section>
          <aside className="admin-card">
            <div className="admin-card-head"><div><small>ACCÈS RAPIDES</small><h2>Configurer LEXIA</h2></div></div>
            <div className="priority-item"><span>01</span><div><Link href="/administration/dossiers"><b>Traiter les dossiers</b></Link><small>{cases.filter((legalCase) => legalCase.status === "submitted").length} nouveau(x) à examiner</small></div></div>
            <div className="priority-item"><span>02</span><div><Link href="/administration/juristes"><b>Ajouter les juristes</b></Link><small>Créer leurs accès sécurisés</small></div></div>
            <div className="priority-item"><span>03</span><div><Link href="/administration/prestations"><b>Gérer les prestations</b></Link><small>Tarifs complémentaires</small></div></div>
          </aside>
        </div>

        <div className="admin-grid lower">
          <Link className="admin-card" href="/administration/messages"><div className="admin-card-head"><div><small>MESSAGERIE</small><h2>Conversations</h2></div><span className="count-pill">0</span></div><div className="mini-empty">Ouvrir la messagerie →</div></Link>
          <Link className="admin-card" href="/administration/dossiers"><div className="admin-card-head"><div><small>ACTIVITÉ</small><h2>Dossiers enregistrés</h2></div></div><div className="offer-row"><span>Actifs</span><b>{cases.filter((legalCase) => !["completed", "cancelled"].includes(legalCase.status)).length}</b></div><div className="offer-row"><span>Terminés</span><b>{cases.filter((legalCase) => legalCase.status === "completed").length}</b></div></Link>
        </div>
      </section>
    </main>
  );
}
