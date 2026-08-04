"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { createClient } from "../../../lib/supabase/client";

type SupportRow = {
  id: string;
  session_id: string;
  sender_type: "visitor" | "client" | "admin" | "jurist";
  visitor_name: string | null;
  visitor_email: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
};

type Conversation = {
  sessionId: string;
  name: string;
  email: string;
  unread: number;
  lastAt: string;
  messages: SupportRow[];
};

export default function AdminSupportInbox() {
  const supabase = createClient();
  const [rows, setRows] = useState<SupportRow[]>([]);
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function loadMessages() {
    const { data, error: loadError } = await supabase
      .from("support_chat_messages")
      .select("id, session_id, sender_type, visitor_name, visitor_email, message, is_read, created_at")
      .order("created_at", { ascending: true });

    if (loadError) {
      setError("Impossible de charger les conversations d’assistance.");
      setLoading(false);
      return;
    }

    const nextRows = (data as SupportRow[]) || [];
    setRows(nextRows);
    if (!selectedSession && nextRows.length) setSelectedSession(nextRows[nextRows.length - 1].session_id);
    setLoading(false);
  }

  useEffect(() => {
    loadMessages();

    const channel = supabase
      .channel("admin-support-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "support_chat_messages" },
        () => loadMessages()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const conversations = useMemo<Conversation[]>(() => {
    const grouped = new Map<string, SupportRow[]>();
    rows.forEach((row) => grouped.set(row.session_id, [...(grouped.get(row.session_id) || []), row]));

    return Array.from(grouped.entries())
      .map(([sessionId, messages]) => {
        const visitorMessage = [...messages].reverse().find((message) => message.sender_type !== "admin");
        return {
          sessionId,
          name: visitorMessage?.visitor_name || "Visiteur LEXIA",
          email: visitorMessage?.visitor_email || "E-mail non renseigné",
          unread: messages.filter((message) => message.sender_type !== "admin" && !message.is_read).length,
          lastAt: messages[messages.length - 1]?.created_at || "",
          messages,
        };
      })
      .sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime());
  }, [rows]);

  const active = conversations.find((conversation) => conversation.sessionId === selectedSession) || conversations[0];

  async function selectConversation(sessionId: string) {
    setSelectedSession(sessionId);
    await supabase
      .from("support_chat_messages")
      .update({ is_read: true })
      .eq("session_id", sessionId)
      .neq("sender_type", "admin");
    setRows((current) => current.map((row) => row.session_id === sessionId && row.sender_type !== "admin" ? { ...row, is_read: true } : row));
  }

  async function sendReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!active || !reply.trim()) return;
    setSending(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    const { error: sendError } = await supabase.from("support_chat_messages").insert({
      session_id: active.sessionId,
      user_id: user?.id || null,
      sender_type: "admin",
      visitor_name: active.name,
      visitor_email: active.email,
      message: reply.trim(),
      is_read: true,
    });

    if (sendError) {
      setError("La réponse n’a pas pu être envoyée.");
      setSending(false);
      return;
    }

    setReply("");
    setSending(false);
    await loadMessages();
  }

  if (loading) return <section className="admin-card support-admin-loading">Chargement des conversations…</section>;

  if (!conversations.length) {
    return <section className="admin-card section-content"><div className="section-empty"><div>✉</div><b>Aucune conversation d’assistance pour le moment.</b><p>Les messages envoyés depuis la bulle du site apparaîtront automatiquement ici.</p></div></section>;
  }

  return (
    <section className="support-admin-layout">
      <aside className="admin-card support-conversation-list">
        <div className="support-list-head"><div><small>ASSISTANCE EN LIGNE</small><h2>Conversations</h2></div><span>{conversations.reduce((sum, item) => sum + item.unread, 0)}</span></div>
        <div className="support-list-items">
          {conversations.map((conversation) => (
            <button key={conversation.sessionId} className={active?.sessionId === conversation.sessionId ? "active" : ""} onClick={() => selectConversation(conversation.sessionId)}>
              <div className="support-avatar">{conversation.name.slice(0, 1).toUpperCase()}</div>
              <div><b>{conversation.name}</b><small>{conversation.email}</small><span>{conversation.messages[conversation.messages.length - 1]?.message}</span></div>
              {conversation.unread > 0 && <em>{conversation.unread}</em>}
            </button>
          ))}
        </div>
      </aside>

      <section className="admin-card support-thread">
        <header><div><b>{active?.name}</b><small>{active?.email}</small></div><span className="support-online">Message du site</span></header>
        <div className="support-thread-messages">
          {active?.messages.map((message) => (
            <article key={message.id} className={message.sender_type === "admin" ? "admin" : "visitor"}>
              <p>{message.message}</p>
              <small>{new Date(message.created_at).toLocaleString("fr-FR")}</small>
            </article>
          ))}
        </div>
        <form onSubmit={sendReply}>
          <textarea rows={4} value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Répondre au client ou au visiteur…" />
          {error && <p className="support-admin-error">{error}</p>}
          <button disabled={sending || !reply.trim()}>{sending ? "Envoi…" : "Envoyer la réponse"}</button>
        </form>
      </section>
    </section>
  );
}
