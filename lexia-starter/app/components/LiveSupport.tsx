"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import "./live-support.css";

type Message = { id: string; sender: "client" | "support"; content: string; created_at: string };

export default function LiveSupport() {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    supabase.auth.getUser().then(async ({ data }) => {
      const id = data.user?.id || null;
      setUserId(id);
      if (!id) return;
      const { data: rows } = await supabase.from("support_messages").select("id,sender,content,created_at").eq("user_id", id).order("created_at", { ascending: true }).limit(100);
      setMessages((rows as Message[]) || []);
      channel = supabase.channel(`support-${id}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "support_messages", filter: `user_id=eq.${id}` }, (payload) => {
        setMessages((current) => [...current, payload.new as Message]);
      }).subscribe();
    });
    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, open]);

  async function send(event: FormEvent) {
    event.preventDefault();
    if (!userId || !text.trim() || sending) return;
    setSending(true);
    const content = text.trim();
    setText("");
    const { error } = await supabase.from("support_messages").insert({ user_id: userId, sender: "client", content });
    if (error) setText(content);
    setSending(false);
  }

  return (
    <div className="live-support">
      {open && (
        <section className="live-support-panel">
          <header><div><span className="live-dot" /> <b>Assistance LEXIA</b><small>Échangez directement avec notre équipe</small></div><button onClick={() => setOpen(false)} aria-label="Fermer">×</button></header>
          <div className="live-messages">
            <div className="live-message support">Bonjour 👋 Comment pouvons-nous vous aider ?</div>
            {!userId && <div className="live-login">Connectez-vous à votre espace pour démarrer une conversation sécurisée en direct.<a href="/connexion">Se connecter</a></div>}
            {messages.map((message) => <div key={message.id} className={`live-message ${message.sender}`}>{message.content}<small>{new Date(message.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</small></div>)}
            <div ref={bottomRef} />
          </div>
          {userId && <form onSubmit={send}><textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Écrivez votre message…" rows={2} /><button disabled={!text.trim() || sending}>{sending ? "…" : "Envoyer"}</button></form>}
          <footer>Conversation sécurisée · LEXIA</footer>
        </section>
      )}
      <button className="live-support-button" onClick={() => setOpen((value) => !value)} aria-label="Ouvrir l'assistance"><span>💬</span><div><b>Besoin d’aide ?</b><small>Discutez avec nous</small></div></button>
    </div>
  );
}
