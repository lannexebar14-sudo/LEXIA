"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import "./assistance-chat.css";

type ChatMessage = {
  id: string;
  sender: "visitor" | "support";
  text: string;
};

function getSessionId() {
  const key = "lexia_support_session";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const created = crypto.randomUUID();
  window.localStorage.setItem(key, created);
  return created;
}

export default function AssistanceChat() {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "support",
      text: "Bonjour, bienvenue sur LEXIA. Expliquez-nous brièvement votre besoin, notre équipe vous répondra depuis la messagerie d’assistance.",
    },
  ]);

  useEffect(() => {
    setSessionId(getSessionId());
  }, []);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const cleanMessage = message.trim();
    if (!name.trim() || !email.trim() || !cleanMessage) {
      setError("Merci de renseigner votre nom, votre e-mail et votre message.");
      return;
    }

    setSending(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { error: insertError } = await supabase.from("support_chat_messages").insert({
      session_id: sessionId || getSessionId(),
      user_id: user?.id || null,
      sender_type: user ? "client" : "visitor",
      visitor_name: name.trim(),
      visitor_email: email.trim(),
      message: cleanMessage,
    });

    if (insertError) {
      setError("Le message n’a pas pu être envoyé. Réessayez dans quelques instants.");
      setSending(false);
      return;
    }

    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), sender: "visitor", text: cleanMessage },
      {
        id: crypto.randomUUID(),
        sender: "support",
        text: "Votre message a bien été transmis à l’équipe LEXIA. Vous recevrez la réponse dans cet espace ou par e-mail.",
      },
    ]);
    setMessage("");
    setSending(false);
  }

  return (
    <div className={`support-chat ${open ? "open" : ""}`}>
      {open && (
        <section className="support-chat-panel" aria-label="Assistance LEXIA">
          <header>
            <div>
              <span className="support-status-dot" />
              <div><b>Assistance LEXIA</b><small>Équipe disponible en ligne</small></div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Fermer">×</button>
          </header>

          <div className="support-chat-messages">
            {messages.map((item) => (
              <div key={item.id} className={`support-message ${item.sender}`}>
                {item.text}
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage}>
            <div className="support-chat-identity">
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Votre nom" />
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Votre e-mail" />
            </div>
            <textarea rows={3} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Écrivez votre message…" />
            {error && <p className="support-chat-error">{error}</p>}
            <button type="submit" disabled={sending}>{sending ? "Envoi…" : "Envoyer le message"}</button>
            <small className="support-chat-note">Les échanges sont enregistrés de manière sécurisée pour permettre le suivi de votre demande.</small>
          </form>
        </section>
      )}

      <button type="button" className="support-chat-trigger" onClick={() => setOpen((current) => !current)} aria-label="Ouvrir l’assistance">
        <span>✦</span>
        <div><b>Besoin d’aide ?</b><small>Discutez avec nous</small></div>
      </button>
    </div>
  );
}
