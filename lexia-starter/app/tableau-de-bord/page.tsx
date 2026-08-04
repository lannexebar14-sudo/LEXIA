"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import "./dashboard.css";
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

function notificationIcon(type: string) {
  if (type === "message") return "✉";
  if (type === "suivi") return "↻";
  if (type === "compte") return "♙";
  if (type === "paiement") return "€";
  if (type === "document") return "▤";
  if (type === "prestation") return "◇";
  return "✓";
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [name, setName] = useState("Client");
  const [userId, setUserId] = useState("");
  const [notifications, setNotifications] = useState<ClientNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.replace("/connexion");
      const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).single();
      if (profile?.role === "admin") return router.replace("/administration");
      setName(profile?.full_name || user.email?.split("@")[0] || "Client");
      setUserId(user.id);
      setLoading(false);
    }
    loadProfile();
  }, [router, supabase]);

  useEffect(() => {
    if (!userId) return;

    async function loadNotifications() {
      const { data } = await supabase
        .from("client_notifications")
        .select("id,type,title,message,url,read_at,created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(30);
      setNotifications((data as ClientNotification[]) || []);
    }

    loadNotifications();

    const channel = supabase
      .channel(`client-notifications-${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "client_notifications", filter: `user_id=eq.${userId}` },
        (payload) => {
          const incoming = payload.new as ClientNotification;
          setNotifications((current) => [incoming, ...current.filter((item) => item.id !== incoming.id)].slice(0, 30));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId]);

  const unreadCount = notifications.filter((notification) => !notification.read_at).length;

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
          <a href="#transparence">🔔 Suivi des actions {unreadCount > 0 ? `(${unreadCount})` : ""}</a>
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
          <article><span>Actions non lues</span><strong>{unreadCount}</strong><small>{unreadCount ? "Nouvelles actions de l’administration" : "Votre suivi est à jour"}</small></article>
          <article><span>Documents</span><strong>0</strong><small>Fichiers sécurisés</small></article>
          <article><span>Prestations</span><strong>0</strong><small>Aucune proposition en attente</small></article>
        </div>

        <section className="app-card transparency-card" id="transparence">
          <div className="card-title transparency-title">
            <div><small>TRANSPARENCE TOTALE</small><h3>Suivi des actions</h3><p>Chaque action importante effectuée par l’administration est conservée ici.</p></div>
            {unreadCount > 0 && <button type="button" onClick={markAllRead}>Tout marquer comme lu</button>}
          </div>

          {notifications.length === 0 ? (
            <div className="transparency-empty"><span>✓</span><div><b>Aucune action enregistrée</b><p>Les réponses, mises à jour et changements concernant votre compte apparaîtront ici.</p></div></div>
          ) : (
            <div className="notification-list">
              {notifications.map((notification) => (
                <button
                  type="button"
                  key={notification.id}
                  className={`notification-row ${notification.read_at ? "read" : "unread"}`}
                  onClick={() => openNotification(notification)}
                >
                  <span className="notification-icon">{notificationIcon(notification.type)}</span>
                  <span className="notification-copy">
                    <b>{notification.title}</b>
                    <span>{notification.message}</span>
                    <small>{new Date(notification.created_at).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}</small>
                  </span>
                  {!notification.read_at && <i>Nouveau</i>}
                  <em>›</em>
                </button>
              ))}
            </div>
          )}
        </section>

        <div className="client-columns">
          <section className="app-card" id="dossiers">
            <div className="card-title"><div><small>VOS DEMANDES</small><h3>Mes dossiers</h3></div><Link href="/nouveau-dossier">Nouveau</Link></div>
            <div className="empty-state"><div>⚖</div><h4>Aucun dossier déposé</h4><p>Votre première demande apparaîtra ici avec son statut et les réponses de votre conseiller.</p><Link href="/nouveau-dossier">Déposer mon premier dossier</Link></div>
          </section>
          <aside className="app-card help-card" id="messages"><small>BESOIN D’AIDE ?</small><h3>Une équipe à votre écoute</h3><p>Une fois votre dossier déposé, vous pourrez échanger directement avec votre conseiller.</p><div><b>Réponse personnalisée</b><span>Suivi depuis votre messagerie</span></div><div><b>Documents centralisés</b><span>PDF, photos et justificatifs</span></div></aside>
        </div>
      </section>
    </main>
  );
}
