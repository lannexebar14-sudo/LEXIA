"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import { AppRole, isAppRole } from "../../lib/roles";
import "./dashboard.css";
import "./cases-dashboard.css";
import "../mobile-app.css";

type ClientNotification = {
  id: string;
  type: string;
  title: string;
  message: string;
  url: string;
  read_at: string | null;
  created_at: string;
};

type ClientCase = {
  id: string;
  reference: string;
  subject: string;
  category: string;
  status: string;
  urgency: string;
  created_at: string;
  updated_at: string;
};

type CaseDocumentRow = { case_id: string };
type CaseServiceRow = { case_id: string };
type AccessContext = {
  user_id?: string | null;
  email?: string | null;
  full_name?: string | null;
  role?: string | null;
};

const ROLE_CACHE_KEY = "lexia_current_role_v1";

const statusLabels: Record<string, string> = {
  submitted: "Transmis à l’administration",
  payment_pending: "Paiement en attente",
  paid: "Paiement confirmé",
  in_review: "Analyse en cours",
  awaiting_client: "Action attendue",
  completed: "Dossier terminé",
  cancelled: "Dossier annulé",
};

const categoryLabels: Record<string, string> = {
  logement: "Logement",
  travail: "Travail",
  consommation: "Consommation",
  assurance: "Assurance",
  famille: "Famille",
  entreprise: "Entreprise",
  administration: "Administration",
  autre: "Autre situation",
};

function notificationIcon(type: string) {
  if (type === "message") return "✉";
  if (type === "suivi") return "↻";
  if (type === "compte") return "♙";
  if (type === "paiement") return "€";
  if (type === "document") return "▤";
  if (type === "prestation") return "◇";
  return "✓";
}

function destinationForRole(role: AppRole) {
  if (role === "admin") return "/administration";
  if (role === "juriste" || role === "avocat") return "/administration/mes-dossiers";
  if (role === "developpeur") return "/administration/developpement";
  return "/tableau-de-bord";
}

function withTimeout<T>(task: PromiseLike<T>, delay = 2200): Promise<T | null> {
  return Promise.race([
    Promise.resolve(task),
    new Promise<null>((resolve) => window.setTimeout(() => resolve(null), delay)),
  ]);
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [name, setName] = useState("Client");
  const [userId, setUserId] = useState("");
  const [notifications, setNotifications] = useState<ClientNotification[]>([]);
  const [cases, setCases] = useState<ClientCase[]>([]);
  const [documents, setDocuments] = useState<CaseDocumentRow[]>([]);
  const [services, setServices] = useState<CaseServiceRow[]>([]);
  const [syncing, setSyncing] = useState(true);
  const [syncWarning, setSyncWarning] = useState(false);

  useEffect(() => {
    let active = true;

    const cachedValue = window.sessionStorage.getItem(ROLE_CACHE_KEY);
    const cachedRole = isAppRole(cachedValue) ? cachedValue : null;
    if (cachedRole && cachedRole !== "client") {
      router.replace(destinationForRole(cachedRole));
      return () => { active = false; };
    }

    async function openSession() {
      const sessionResult = await withTimeout(supabase.auth.getSession(), 1400);
      if (!active) return;

      if (!sessionResult) {
        setSyncing(false);
        setSyncWarning(true);
        return;
      }

      const session = sessionResult.data.session;
      if (!session?.user) {
        router.replace("/connexion");
        return;
      }

      setUserId(session.user.id);
      setName(session.user.email?.split("@")[0] || "Client");

      const accessResult = await withTimeout(
        supabase.rpc("get_my_access_context").maybeSingle(),
        1800,
      );
      if (!active) return;

      if (accessResult && !accessResult.error) {
        const context = accessResult.data as AccessContext | null;
        const role: AppRole = isAppRole(context?.role) ? context.role : "client";
        window.sessionStorage.setItem(ROLE_CACHE_KEY, role);
        setName(context?.full_name || context?.email?.split("@")[0] || session.user.email?.split("@")[0] || "Client");

        if (role !== "client") {
          router.replace(destinationForRole(role));
          return;
        }
      }
    }

    void openSession();
    return () => { active = false; };
  }, [router, supabase]);

  useEffect(() => {
    if (!userId) return;
    let mounted = true;

    async function loadDashboard() {
      setSyncing(true);
      setSyncWarning(false);

      const results = await Promise.all([
        withTimeout(
          supabase.from("client_notifications").select("id,type,title,message,url,read_at,created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(30),
          2500,
        ),
        withTimeout(
          supabase.from("legal_cases").select("id,reference,subject,category,status,urgency,created_at,updated_at").eq("user_id", userId).order("created_at", { ascending: false }),
          2500,
        ),
        withTimeout(
          supabase.from("legal_case_documents").select("case_id").eq("user_id", userId),
          2500,
        ),
        withTimeout(
          supabase.from("legal_case_services").select("case_id"),
          2500,
        ),
      ]);

      if (!mounted) return;
      const [notificationResult, caseResult, documentResult, serviceResult] = results;

      if (notificationResult && !notificationResult.error) {
        setNotifications((notificationResult.data as ClientNotification[]) || []);
      }
      if (caseResult && !caseResult.error) {
        setCases((caseResult.data as ClientCase[]) || []);
      }
      if (documentResult && !documentResult.error) {
        setDocuments((documentResult.data as CaseDocumentRow[]) || []);
      }
      if (serviceResult && !serviceResult.error) {
        setServices((serviceResult.data as CaseServiceRow[]) || []);
      }

      const incomplete = results.some((result) => !result || Boolean(result.error));
      setSyncWarning(incomplete);
      setSyncing(false);
    }

    void loadDashboard();

    const notificationChannel = supabase
      .channel(`client-notifications-${userId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "client_notifications", filter: `user_id=eq.${userId}` }, (payload) => {
        const incoming = payload.new as ClientNotification;
        setNotifications((current) => [incoming, ...current.filter((item) => item.id !== incoming.id)].slice(0, 30));
      })
      .subscribe();

    const caseChannel = supabase
      .channel(`client-cases-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "legal_cases", filter: `user_id=eq.${userId}` }, (payload) => {
        if (payload.eventType === "DELETE") {
          setCases((current) => current.filter((item) => item.id !== (payload.old as { id?: string }).id));
          return;
        }
        const incoming = payload.new as ClientCase;
        setCases((current) => [incoming, ...current.filter((item) => item.id !== incoming.id)]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      })
      .subscribe();

    return () => {
      mounted = false;
      void supabase.removeChannel(notificationChannel);
      void supabase.removeChannel(caseChannel);
    };
  }, [supabase, userId]);

  const unreadCount = notifications.filter((notification) => !notification.read_at).length;
  const activeCases = cases.filter((legalCase) => !["completed", "cancelled"].includes(legalCase.status));

  async function openNotification(notification: ClientNotification) {
    if (!notification.read_at) {
      const readAt = new Date().toISOString();
      await supabase.from("client_notifications").update({ read_at: readAt }).eq("id", notification.id);
      setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, read_at: readAt } : item));
    }
    router.push(notification.url || "/tableau-de-bord");
  }

  async function markAllRead() {
    if (!userId || unreadCount === 0) return;
    const readAt = new Date().toISOString();
    await supabase.from("client_notifications").update({ read_at: readAt }).eq("user_id", userId).is("read_at", null);
    setNotifications((current) => current.map((item) => ({ ...item, read_at: item.read_at || readAt })));
  }

  async function logout() {
    window.sessionStorage.removeItem(ROLE_CACHE_KEY);
    await supabase.auth.signOut();
    router.replace("/connexion");
  }

  return (
    <main className="client-app">
      <aside className="client-sidebar">
        <Link href="/tableau-de-bord" className="app-logo">LEXIA<span>.</span></Link>
        <nav>
          <Link className="active" href="/tableau-de-bord">⌂ Tableau de bord</Link>
          <Link href="/nouveau-dossier">＋ Nouveau dossier</Link>
          <a href="#dossiers">▣ Mes dossiers</a>
          <a href="#messages">✉ Messagerie</a>
          <a href="#transparence">🔔 Suivi des actions {unreadCount > 0 ? `(${unreadCount})` : ""}</a>
          <a href="#documents">▤ Documents</a>
          <a href="#paiements">€ Paiements</a>
        </nav>
        <button onClick={logout}>Se déconnecter</button>
      </aside>

      <section className="client-content">
        <header className="app-topbar">
          <div>
            <small>{syncing ? "ESPACE CLIENT · SYNCHRONISATION…" : "ESPACE CLIENT"}</small>
            <h1>Bonjour {name}</h1>
          </div>
          <Link href="/nouveau-dossier" className="app-primary">Déposer un dossier</Link>
        </header>

        {syncWarning && (
          <div className="dashboard-sync-warning">
            Certaines informations mettent plus de temps à arriver, mais votre espace reste utilisable.
          </div>
        )}

        <div className="client-hero">
          <div><span>Votre assistance juridique</span><h2>Comment pouvons-nous vous aider aujourd’hui ?</h2><p>Expliquez votre situation, ajoutez vos documents et suivez chaque action de l’administration dans un espace confidentiel.</p></div>
          <Link href="/nouveau-dossier">Commencer une demande →</Link>
        </div>

        <div className="stats-grid">
          <article><span>Dossiers actifs</span><strong>{activeCases.length}</strong><small>{activeCases.length ? "En cours de traitement" : "Aucun dossier actif"}</small></article>
          <article><span>Actions non lues</span><strong>{unreadCount}</strong><small>{unreadCount ? "Nouvelles actions de l’administration" : "Votre suivi est à jour"}</small></article>
          <article><span>Documents</span><strong>{documents.length}</strong><small>Fichiers sécurisés</small></article>
          <article><span>Prestations</span><strong>{services.length}</strong><small>Services rattachés aux dossiers</small></article>
        </div>

        <section className="app-card client-cases-card" id="dossiers">
          <div className="card-title"><div><small>VOS DEMANDES</small><h3>Mes dossiers</h3><p>Consultez leur statut, les documents et la chronologie complète.</p></div><Link href="/nouveau-dossier">Nouveau dossier</Link></div>
          {cases.length === 0 ? (
            <div className="empty-state"><div>⚖</div><h4>{syncing ? "Synchronisation des dossiers…" : "Aucun dossier déposé"}</h4><p>{syncing ? "La page reste accessible pendant la récupération de vos informations." : "Votre première demande apparaîtra ici avec sa référence et les actions de l’administration."}</p>{!syncing && <Link href="/nouveau-dossier">Déposer mon premier dossier</Link>}</div>
          ) : (
            <div className="client-case-list">
              {cases.map((legalCase) => {
                const documentCount = documents.filter((document) => document.case_id === legalCase.id).length;
                return <Link href={`/tableau-de-bord/dossiers/${legalCase.id}`} key={legalCase.id} className="client-case-row"><div className="client-case-reference"><b>{legalCase.reference}</b><span>{categoryLabels[legalCase.category] || legalCase.category}</span></div><div className="client-case-copy"><strong>{legalCase.subject}</strong><small>Mis à jour le {new Date(legalCase.updated_at).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}</small></div><div className="client-case-info"><span className={`case-mini-status status-${legalCase.status}`}>{statusLabels[legalCase.status] || legalCase.status}</span><small>{documentCount} document{documentCount > 1 ? "s" : ""}</small></div><em>›</em></Link>;
              })}
            </div>
          )}
        </section>

        <section className="app-card transparency-card" id="transparence">
          <div className="card-title transparency-title">
            <div><small>TRANSPARENCE TOTALE</small><h3>Suivi des actions</h3><p>Chaque action importante effectuée par l’administration est conservée ici.</p></div>
            {unreadCount > 0 && <button type="button" onClick={markAllRead}>Tout marquer comme lu</button>}
          </div>

          {notifications.length === 0 ? (
            <div className="transparency-empty"><span>✓</span><div><b>{syncing ? "Synchronisation en cours" : "Aucune action en attente"}</b><p>{syncing ? "Les dernières actions apparaîtront sans bloquer votre navigation." : "Les réponses, mises à jour et changements de statut apparaîtront ici."}</p></div></div>
          ) : (
            <div className="notification-list">
              {notifications.map((notification) => <button type="button" key={notification.id} className={`notification-row ${notification.read_at ? "read" : "unread"}`} onClick={() => openNotification(notification)}><span className="notification-icon">{notificationIcon(notification.type)}</span><span className="notification-copy"><b>{notification.title}</b><span>{notification.message}</span><small>{new Date(notification.created_at).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}</small></span>{!notification.read_at && <i>Nouveau</i>}<em>›</em></button>)}
            </div>
          )}
        </section>

        <div className="client-columns">
          <section className="app-card" id="documents"><div className="card-title"><div><small>DOCUMENTS</small><h3>Pièces sécurisées</h3></div><span className="dashboard-count">{documents.length}</span></div><div className="mini-dashboard-copy">Les documents sont accessibles depuis la fiche du dossier correspondant.</div></section>
          <aside className="app-card help-card" id="messages"><small>BESOIN D’AIDE ?</small><h3>Une équipe à votre écoute</h3><p>Après le dépôt, vous recevez une notification à chaque changement important.</p><div><b>Réponse personnalisée</b><span>Suivi depuis votre messagerie</span></div><div><b>Documents centralisés</b><span>PDF, photos et justificatifs</span></div></aside>
        </div>
      </section>
    </main>
  );
}
