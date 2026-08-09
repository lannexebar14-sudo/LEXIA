"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import "./live-support.css";

type Message = {
  id: string;
  sender_type: "visitor" | "client" | "admin" | "jurist" | "assistant";
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
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  async function loadMessages(currentSessionId: string) {
    const { data } = await supabase
      .from("support_chat_messages")
      .select("id,sender_type,message,created_at")
      .eq("session_id", currentSessionId)
      .order("created_at", { ascending: true })
      .limit(100);
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
        const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", id).single();
        if (profile?.full_name) setName(profile.full_name);
      }

      await loadMessages(currentSessionId);

      channel = supabase
        .channel(`support-${currentSessionId}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "support_chat_messages", filter: `session_id=eq.${currentSessionId}` }, (payload) => {
          setMessages((current) => [...current, payload.new as Message]);
        })
        .subscribe();
    });

    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, open, thinking]);

  async function askAssistant(content: string) {
    setThinking(true);
    try {
      const history = messages.slice(-8).map((item) => ({
        role: item.sender_type === "assistant" || item.sender_type === "admin" || item.sender_type === "jurist" ? "assistant" : "user",
        content: item.message,
      }));
      const response = await fetch("/api/lexia-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, history }),
      });
      const data = await response.json();
      const reply = String(data?.reply || "Je peux vous aider à identifier le bon parcours LEXIA.");
      setMessages((current) => [...current, {
        id: `assistant-${Date.now()}`,
        sender_type: "assistant",
        message: reply,
        created_at: new Date().toISOString(),
      }]);
    } catch {
      setMessages((current) => [...current, {
        id: `assistant-${Date.now()}`,
        sender_type: "assistant",
        message: "Je n’arrive pas à analyser votre demande pour le moment. Vous pouvez utiliser l’Orientation juridique express depuis le menu LEXIA.",
        created_at: new Date().toISOString(),
      }]);
    } finally {
      setThinking(false);
    }
  }

  async function send(event: FormEvent) {
    event.preventDefault();
    if (!text.trim() || !sessionId || sending || thinking) return;

    setSending(true);
    setError("");
    const content = text.trim();
    const now = new Date().toISOString();

    const { error: conversationError } = await supabase.from("support_chat_conversations").upsert({
      session_id: sessionId,
      user_id: userId,
      visitor_name: name.trim() || null,
      visitor_email: email.trim() || null,
      status: "active",
      last_message_at: now,
      resolved_at: null,
      resolved_by: null,
      updated_at: now,
    }, { onConflict: "session_id" });

    if (conversationError) {
      setError("La conversation n’a pas pu être ouverte.");
      setSending(false);
      return;
    }

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
    await askAssistant(content);
  }

  const quickPrompts = ["J’ai un impayé", "Problème avec mon employeur", "Litige logement", "Je ne sais pas quoi choisir"];

  return (
    <div className="live-support">
      {open && (
        <section className="live-support-panel">
          <header><div><span className="live-dot" /> <b>LEXIA Assistant</b><small>Orientation immédiate par IA · relais humain possible</small></div><button onClick={() => setOpen(false)} aria-label="Fermer">×</button></header>
          <div className="live-messages">
            <div className="live-message support assistant"><b>LEXIA IA</b>Bonjour 👋 Décrivez votre problème en quelques mots. Je vais vous orienter vers le bon service LEXIA.</div>
            {messages.map((item) => <div key={item.id} className={`live-message ${item.sender_type === "admin" || item.sender_type === "jurist" || item.sender_type === "assistant" ? "support" : "client"} ${item.sender_type === "assistant" ? "assistant" : ""}`}>{item.sender_type === "assistant" && <b>LEXIA IA</b>}{item.message}<small>{new Date(item.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</small></div>)}
            {thinking && <div className="live-message support assistant thinking"><b>LEXIA IA</b>Analyse de votre situation…</div>}
            <div ref={bottomRef} />
          </div>
          {messages.length === 0 && <div className="live-quick-prompts">{quickPrompts.map((prompt) => <button key={prompt} type="button" onClick={() => setText(prompt)}>{prompt}</button>)}</div>}
          <form onSubmit={send}>
            {!userId && <div className="live-identity"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom (optionnel)" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail (optionnel)" /></div>}
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Ex. Mon employeur ne m’a pas payé…" rows={2} />
            {error && <p className="live-error">{error}</p>}
            <button disabled={!text.trim() || sending || thinking}>{thinking ? "Analyse…" : sending ? "…" : "Envoyer"}</button>
          </form>
          <footer>Assistant d’orientation · ne remplace pas une consultation juridique · conversation sécurisée</footer>
        </section>
      )}
      <button className="live-support-button" onClick={() => setOpen((value) => !value)} aria-label="Ouvrir l'assistant LEXIA"><span>✦</span><div><b>LEXIA Assistant</b><small>Posez votre question</small></div></button>
    </div>
  );
}
