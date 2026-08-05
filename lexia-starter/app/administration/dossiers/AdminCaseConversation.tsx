"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "../../../lib/supabase/client";

type CaseMessage = {
  id: string;
  case_id: string;
  user_id: string;
  sender_id: string;
  sender_role: "client" | "admin" | "juriste" | "avocat";
  body: string;
  is_internal: boolean;
  read_by_client_at: string | null;
  read_by_staff_at: string | null;
  created_at: string;
};

type MessageAttachment = {
  id: string;
  message_id: string;
  case_id: string;
  storage_path: string;
  original_name: string;
  mime_type: string | null;
  size_bytes: number;
  created_at: string;
};

type Props = {
  caseId: string;
  clientId: string;
  reference: string;
  clientName: string;
};

const quickReplies = [
  {
    label: "Dossier reçu",
    text: "Bonjour,\n\nNous avons bien reçu votre dossier et les éléments transmis. Notre équipe procède actuellement à leur examen. Nous reviendrons vers vous directement dans cet espace dès que l’analyse aura avancé.\n\nCordialement,\nL’équipe LEXIA",
  },
  {
    label: "Demander un document",
    text: "Bonjour,\n\nAfin de poursuivre l’analyse de votre dossier, pouvez-vous nous transmettre le document ou l’information manquante directement dans cette conversation ?\n\nCordialement,\nL’équipe LEXIA",
  },
  {
    label: "Analyse en cours",
    text: "Bonjour,\n\nVotre dossier est actuellement en cours d’analyse. Nous vérifions les éléments transmis afin de vous apporter une réponse claire et adaptée à votre situation.\n\nCordialement,\nL’équipe LEXIA",
  },
  {
    label: "Réponse disponible",
    text: "Bonjour,\n\nUne réponse concernant votre dossier est désormais disponible ci-dessous. Vous pouvez nous répondre directement dans cet espace si un point nécessite une précision.\n\nCordialement,\nL’équipe LEXIA",
  },
];

function safeFileName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 150) || "document";
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}

export default function AdminCaseConversation({ caseId, clientId, reference, clientName }: Props) {
  const supabase = useMemo(() => createClient(), []);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<CaseMessage[]>([]);
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [currentRole, setCurrentRole] = useState<"admin" | "juriste" | "avocat">("admin");
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [mode, setMode] = useState<"client" | "internal">("client");
  const [requestClientAction, setRequestClientAction] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadConversation() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !active) return;
      setCurrentUserId(user.id);

      const [{ data: profile }, messageResult, attachmentResult] = await Promise.all([
        supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(),
        supabase.from("legal_case_messages").select("id,case_id,user_id,sender_id,sender_role,body,is_internal,read_by_client_at,read_by_staff_at,created_at").eq("case_id", caseId).order("created_at", { ascending: true }),
        supabase.from("legal_case_message_attachments").select("id,message_id,case_id,storage_path,original_name,mime_type,size_bytes,created_at").eq("case_id", caseId).order("created_at", { ascending: true }),
      ]);

      if (!active) return;
      if (["admin", "juriste", "avocat"].includes(profile?.role)) setCurrentRole(profile?.role as "admin" | "juriste" | "avocat");
      setMessages((messageResult.data as CaseMessage[]) || []);
      setAttachments((attachmentResult.data as MessageAttachment[]) || []);
      setLoading(false);
      await supabase.rpc("mark_legal_case_messages_read", { p_case_id: caseId });
    }

    void loadConversation();

    const messageChannel = supabase
      .channel(`admin-case-conversation-${caseId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "legal_case_messages", filter: `case_id=eq.${caseId}` }, (payload) => {
        const incoming = payload.new as CaseMessage;
        setMessages((current) => [...current.filter((message) => message.id !== incoming.id), incoming].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));
        if (incoming.sender_role === "client") void supabase.rpc("mark_legal_case_messages_read", { p_case_id: caseId });
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "legal_case_messages", filter: `case_id=eq.${caseId}` }, (payload) => {
        const incoming = payload.new as CaseMessage;
        setMessages((current) => current.map((message) => message.id === incoming.id ? incoming : message));
      })
      .subscribe();

    const attachmentChannel = supabase
      .channel(`admin-case-attachments-${caseId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "legal_case_message_attachments", filter: `case_id=eq.${caseId}` }, (payload) => {
        const incoming = payload.new as MessageAttachment;
        setAttachments((current) => [...current.filter((attachment) => attachment.id !== incoming.id), incoming]);
      })
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(attachmentChannel);
    };
  }, [caseId, supabase]);

  useEffect(() => {
    if (!loading) bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [attachments.length, loading, messages.length]);

  function addFiles(event: ChangeEvent<HTMLInputElement>) {
    const incoming = Array.from(event.target.files || []);
    const valid = incoming.filter((file) => file.size <= 15 * 1024 * 1024);
    if (valid.length !== incoming.length) setError("Chaque pièce jointe doit faire moins de 15 Mo.");
    setFiles((current) => [...current, ...valid].slice(0, 5));
    event.target.value = "";
  }

  async function openAttachment(attachment: MessageAttachment) {
    setError("");
    const { data, error: signedError } = await supabase.storage.from("case-documents").createSignedUrl(attachment.storage_path, 90);
    if (signedError || !data?.signedUrl) {
      setError("La pièce jointe ne peut pas être ouverte pour le moment.");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  async function sendMessage() {
    if (sending) return;
    const trimmed = body.trim();
    if (!trimmed) {
      setError("Rédigez un message avant l’envoi.");
      return;
    }

    setSending(true);
    setError("");
    setFeedback("");

    const { data: inserted, error: insertError } = await supabase
      .from("legal_case_messages")
      .insert({
        case_id: caseId,
        user_id: clientId,
        sender_id: currentUserId,
        sender_role: currentRole,
        body: trimmed,
        is_internal: mode === "internal",
      })
      .select("id,case_id,user_id,sender_id,sender_role,body,is_internal,read_by_client_at,read_by_staff_at,created_at")
      .single();

    if (insertError || !inserted) {
      setError("Le message n’a pas pu être enregistré. Réessayez dans quelques instants.");
      setSending(false);
      return;
    }

    const message = inserted as CaseMessage;
    setMessages((current) => [...current.filter((item) => item.id !== message.id), message]);
    const failedFiles: string[] = [];

    for (const file of files) {
      const storagePath = `${clientId}/${caseId}/messages/${message.id}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
      const { error: uploadError } = await supabase.storage.from("case-documents").upload(storagePath, file, {
        contentType: file.type || undefined,
        upsert: false,
      });

      if (uploadError) {
        failedFiles.push(file.name);
        continue;
      }

      const { error: attachmentError } = await supabase.from("legal_case_message_attachments").insert({
        message_id: message.id,
        case_id: caseId,
        user_id: clientId,
        uploaded_by: currentUserId,
        storage_path: storagePath,
        original_name: file.name,
        mime_type: file.type || null,
        size_bytes: file.size,
      });

      if (attachmentError) {
        await supabase.storage.from("case-documents").remove([storagePath]);
        failedFiles.push(file.name);
      }
    }

    if (mode === "client" && requestClientAction) {
      await supabase.from("legal_cases").update({ status: "awaiting_client" }).eq("id", caseId);
    }

    setBody("");
    setFiles([]);
    setRequestClientAction(false);
    setFeedback(mode === "internal"
      ? "Note interne enregistrée. Elle reste invisible pour le client."
      : failedFiles.length > 0
        ? `Message envoyé, mais ${failedFiles.length} pièce(s) jointe(s) n’ont pas pu être ajoutées.`
        : `Réponse envoyée à ${clientName}. Le client a été notifié.`);
    setSending(false);
  }

  const visibleMessages = mode === "internal" ? messages : messages.filter((message) => !message.is_internal);
  const unreadClientMessages = messages.filter((message) => message.sender_role === "client" && !message.read_by_staff_at).length;

  if (loading) {
    return <section className="admin-case-conversation admin-case-conversation-loading">Chargement des échanges…</section>;
  }

  return (
    <section className="admin-case-conversation" id={`messagerie-${caseId}`}>
      <header className="admin-conversation-header">
        <div>
          <small>ÉCHANGES DU DOSSIER</small>
          <h3>Répondre à {clientName}</h3>
          <p>{reference} · conversation sécurisée et rattachée au dossier</p>
        </div>
        <div className="admin-conversation-counts">
          <span><b>{messages.filter((message) => !message.is_internal).length}</b> messages</span>
          {unreadClientMessages > 0 && <em>{unreadClientMessages} non lu{unreadClientMessages > 1 ? "s" : ""}</em>}
        </div>
      </header>

      <div className="admin-conversation-tabs">
        <button type="button" className={mode === "client" ? "active" : ""} onClick={() => { setMode("client"); setFeedback(""); setError(""); }}>✉ Message au client</button>
        <button type="button" className={mode === "internal" ? "active" : ""} onClick={() => { setMode("internal"); setFeedback(""); setError(""); }}>▤ Note interne</button>
      </div>

      <div className={`admin-conversation-thread ${mode === "internal" ? "internal-mode" : ""}`}>
        {visibleMessages.length === 0 && (
          <div className="admin-conversation-empty">
            <span>{mode === "internal" ? "▤" : "✉"}</span>
            <b>{mode === "internal" ? "Aucune note interne" : "Aucun échange pour le moment"}</b>
            <p>{mode === "internal" ? "Ajoutez une note réservée à l’équipe LEXIA." : "Écrivez la première réponse directement depuis ce dossier."}</p>
          </div>
        )}

        {visibleMessages.map((message) => {
          const fromClient = message.sender_role === "client";
          const messageAttachments = attachments.filter((attachment) => attachment.message_id === message.id);
          return (
            <article key={message.id} className={`admin-conversation-message ${fromClient ? "from-client" : "from-lexia"} ${message.is_internal ? "internal" : ""}`}>
              <div className="admin-message-meta">
                <b>{message.is_internal ? "Note interne LEXIA" : fromClient ? clientName : "LEXIA"}</b>
                <span>{new Date(message.created_at).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}</span>
              </div>
              <p>{message.body}</p>
              {messageAttachments.length > 0 && (
                <div className="admin-message-attachments">
                  {messageAttachments.map((attachment) => (
                    <button type="button" key={attachment.id} onClick={() => openAttachment(attachment)}>
                      <span>▤</span><div><b>{attachment.original_name}</b><small>{formatSize(attachment.size_bytes)}</small></div><em>Ouvrir</em>
                    </button>
                  ))}
                </div>
              )}
              {!fromClient && !message.is_internal && (
                <small className="admin-message-read-state">{message.read_by_client_at ? `Lu par le client le ${new Date(message.read_by_client_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}` : "Envoyé · en attente de lecture"}</small>
              )}
            </article>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="admin-conversation-composer">
        {mode === "client" && (
          <div className="admin-quick-replies">
            {quickReplies.map((reply) => <button type="button" key={reply.label} onClick={() => setBody(reply.text)}>{reply.label}</button>)}
          </div>
        )}

        <label className="admin-message-field">
          <span>{mode === "internal" ? "Note réservée à l’équipe" : "Votre réponse au client"}</span>
          <textarea
            value={body}
            onChange={(event) => { setBody(event.target.value); setError(""); setFeedback(""); }}
            rows={6}
            maxLength={5000}
            placeholder={mode === "internal" ? "Ajoutez un commentaire interne sur le traitement du dossier…" : "Rédigez une réponse claire au client…"}
          />
          <small>{body.length} / 5 000 caractères</small>
        </label>

        <div className="admin-conversation-actions">
          <label className="admin-attachment-picker">
            <input type="file" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={addFiles} />
            <span>＋ Ajouter une pièce jointe</span>
          </label>
          {mode === "client" && (
            <label className="admin-client-action-toggle">
              <input type="checkbox" checked={requestClientAction} onChange={(event) => setRequestClientAction(event.target.checked)} />
              <span>Passer le dossier en « action client attendue »</span>
            </label>
          )}
        </div>

        {files.length > 0 && (
          <div className="admin-selected-files">
            {files.map((file, index) => <button type="button" key={`${file.name}-${index}`} onClick={() => setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))}><span>▤</span><b>{file.name}</b><small>{formatSize(file.size)}</small><em>×</em></button>)}
          </div>
        )}

        {error && <div className="admin-conversation-feedback error">{error}</div>}
        {feedback && <div className="admin-conversation-feedback success">{feedback}</div>}

        <button type="button" className="admin-send-message" onClick={sendMessage} disabled={sending || !body.trim()}>
          {sending ? "Envoi en cours…" : mode === "internal" ? "Enregistrer la note interne" : "Envoyer la réponse au client"}
        </button>
      </div>
    </section>
  );
}
