"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import "./live-support.css";

type Message = {
  id: string;
  sender_type: "visitor" | "client" | "admin" | "jurist";
  message: string;
  created_at: string;
};

function getSessionId() {
  const key = "lexia_support_session";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const created = crypto.randomUUID();
  window.localStorage.setItem(key, created);
  return created;
}

export default function LiveSupport() {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  async function loadMessages(currentSessionId: string, currentUserId: string | null) {
    let request = supabase
      .from("support_chat_messages")
      .select("id,sender_type,message,created_at")
      .eq("session_id", currentSessionId)
      .order("created_at", { ascending: true })
      .limit(100);

    if (currentUserId) request = request.or(`user_id.eq.${currentUserId},session_id.eq.${currentSessionId}`);

    const { data } = await request;
    setMessages((data as Message[]) || []);
  }

  useEffect(() => {
    const currentSessionId = getSessionId();
    setSessionId(currentSessionId);

    let channel: ReturnType<typeof supabase.channel> | null = null;

    supabase.auth.getUser().then(async ({ data }) => {
      const id = data.user?.id || null;
      setUserId(id);

      if (data.user?.email) setEmail(data.user.email);

      if (id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", id)
          .single();
        if (profile?.full_name) setName(profile.full_name);
      }

      await loadMessages(currentSessionId, id);

      channel = supabase
        .channel(`support-${currentSessionId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "support_chat_messages",
            filter: `session_id=eq.${currentSessionId}`,
          },
          (payload) => setMessages((current) => [...current, payload.new as Message])
        )
        .subscribe();
    });

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function send(event: FormEvent) {
    event.preventDefault();
    if (!text.trim() || !sessionId || sending) return;

    if (!userId && (!name.trim() || !email.trim())) {
      setError("Merci de renseigner votre nom et votre e-mail.");
      return;
    }

    setSending(true);
    setError("");
    const content = text.trim();

    const { error: insertError } = await supabase.from("support_chat_messages").insert({
      session_id: sessionId,
      user_id: userId,
      sender_type: userId ? "client" : "visitor",
      visitor_name: name.trim() || null,
      visitor_email: email.trim() || null,
      message: content,
      is_read: false,
    });

    if (insertError) {
      setError("Le message n’a pas pu être envoyé. Réessayez dans quelques instants.");
      setSending(false);
      return;
    }

    setText("");
    setSending(false);
  }

  return (
    <div className="live-support">
      {open && (
        <section className="live-support-panel">
          <header>
            <div><span className="live-dot" /> <b>Assistance LEXIA</b><small>Échangez directement avec notre équipe</small></div>
            <button onClick={() => setOpen(false)} aria-label="Fermer">×</button>
          </header>

          <div className="live-messages">
            <div className="live-message support">Bonjour 👋 Comment pouvons-nous vous aider ?</div>
            {messages.map((item) => (
              <div key={item.id} className={`live-message ${item.sender_type === "admin" || item.sender_type === "jurist" ? "support" : "client"}`}>
                {item.message}
                <small>{new Date(item.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</small>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={send}>
            {!userId && (
              <div className="live-identity">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Votre nom" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Votre e-mail" />
              </div>
            )}
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Écrivez votre message…" rows={2} />
            {error && <p className="live-error">{error}</p>}
            <button disabled={!text.trim() || sending}>{sending ? "…" : "Envoyer"}</button>
          </form>

          <footer>Conversation sécurisée · LEXIA</footer>
        </section>
      )}

      <button className="live-support-button" onClick={() => setOpen((value) => !value)} aria-label="Ouvrir l'assistance">
        <span>💬</span><div><b>Besoin d’aide ?</b><small>Discutez avec nous</small></div>
      </button>
    </div>
  );
}
