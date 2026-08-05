"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "../../../../lib/supabase/client";

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
  userId: string;
  reference: string;
  status: string;
};

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

export default function ClientCaseConversation({ caseId, userId, reference, status }: Props) {
  const supabase = useMemo(() => createClient(), []);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<CaseMessage[]>([]);
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function loadConversation() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !active) return;
      setCurrentUserId(user.id);

      const [messageResult, attachmentResult] = await Promise.all([
        supabase.from("legal_case_messages").select("id,case_id,user_id,sender_id,sender_role,body,is_internal,read_by_client_at,read_by_staff_at,created_at").eq("case_id", caseId).eq("is_internal", false).order("created_at", { ascending: true }),
        supabase.from("legal_case_message_attachments").select("id,message_id,case_id,storage_path,original_name,mime_type,size_bytes,created_at").eq("case_id", caseId).order("created_at", { ascending: true }),
      ]);

      if (!active) return;
      setMessages((messageResult.data as CaseMessage[]) || []);
      setAttachments((attachmentResult.data as MessageAttachment[]) || []);
      setLoading(false);
      await supabase.rpc("mark_legal_case_messages_read", { p_case_id: caseId });
    }

    void loadConversation();

    const messageChannel = supabase
      .channel(`client-case-conversation-${caseId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "legal_case_messages", filter: `case_id=eq.${caseId}` }, (payload) => {
        const incoming = payload.new as CaseMessage;
        if (incoming.is_internal) return;
        setMessages((current) => [...current.filter((message) => message.id !== incoming.id), incoming].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));
        if (incoming.sender_role !== "client") void supabase.rpc("mark_legal_case_messages_read", { p_case_id: caseId });
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "legal_case_messages", filter: `case_id=eq.${caseId}` }, (payload) => {
        const incoming = payload.new as CaseMessage;
        if (!incoming.is_internal) setMessages((current) => current.map((message) => message.id === incoming.id ? incoming : message));
      })
      .subscribe();

    const attachmentChannel = supabase
      .channel(`client-case-message-attachments-${caseId}`)
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
    if (valid.length !== incoming.length) setError("Chaque document doit faire moins de 15 Mo.");
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
    if (sending || ["completed", "cancelled"].includes(status)) return;
    const trimmed = body.trim();
    if (!trimmed) {
      setError("Rédigez votre message avant de l’envoyer.");
      return;
    }

    setSending(true);
    setError("");
    setSuccess("");

    const { data: inserted, error: insertError } = await supabase
      .from("legal_case_messages")
      .insert({
        case_id: caseId,
        user_id: userId,
        sender_id: currentUserId,
        sender_role: "client",
        body: trimmed,
        is_internal: false,
      })
      .select("id,case_id,user_id,sender_id,sender_role,body,is_internal,read_by_client_at,read_by_staff_at,created_at")
      .single();

    if (insertError || !inserted) {
      setError("Votre message n’a pas pu être envoyé. Réessayez dans quelques instants.");
      setSending(false);
      return;
    }

    const message = inserted as CaseMessage;
    setMessages((current) => [...current.filter((item) => item.id !== message.id), message]);
    const failedFiles: string[] = [];

    for (const file of files) {
      const storagePath = `${userId}/${caseId}/messages/${message.id}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
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
        user_id: userId,
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

    setBody("");
    setFiles([]);
    setSuccess(failedFiles.length > 0
      ? `Votre message est envoyé, mais ${failedFiles.length} document(s) n’ont pas pu être ajouté(s).`
      : "Votre message a été envoyé à l’équipe LEXIA.");
    setSending(false);
  }

  const closed = ["completed", "cancelled"].includes(status);

  return (
    <section className="app-card client-case-conversation" id="messagerie">
      <header className="client-conversation-header">
        <div>
          <small>MESSAGERIE DU DOSSIER</small>
          <h3>Échanger avec LEXIA</h3>
          <p>{reference} · vos messages restent rattachés à ce dossier</p>
        </div>
        <span>{messages.length} message{messages.length > 1 ? "s" : ""}</span>
      </header>

      <div className="client-conversation-security">🔒 Conversation confidentielle accessible uniquement depuis votre espace sécurisé.</div>

      <div className="client-conversation-thread">
        {loading && <div className="client-conversation-empty">Chargement des échanges…</div>}
        {!loading && messages.length === 0 && (
          <div className="client-conversation-empty">
            <span>✉</span><b>Aucun message pour le moment</b><p>Vous pouvez écrire directement à l’équipe chargée de votre dossier.</p>
          </div>
        )}

        {messages.map((message) => {
          const fromClient = message.sender_role === "client";
          const messageAttachments = attachments.filter((attachment) => attachment.message_id === message.id);
          return (
            <article key={message.id} className={`client-conversation-message ${fromClient ? "from-client" : "from-lexia"}`}>
              <div className="client-message-meta">
                <b>{fromClient ? "Vous" : "LEXIA"}</b>
                <span>{new Date(message.created_at).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}</span>
              </div>
              <p>{message.body}</p>
              {messageAttachments.length > 0 && (
                <div className="client-message-attachments">
                  {messageAttachments.map((attachment) => (
                    <button type="button" key={attachment.id} onClick={() => openAttachment(attachment)}>
                      <span>▤</span><div><b>{attachment.original_name}</b><small>{formatSize(attachment.size_bytes)}</small></div><em>Ouvrir</em>
                    </button>
                  ))}
                </div>
              )}
              {fromClient && <small className="client-message-read-state">{message.read_by_staff_at ? "Lu par l’équipe LEXIA" : "Envoyé"}</small>}
            </article>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="client-conversation-composer">
        {closed ? (
          <div className="client-conversation-closed">Ce dossier est clôturé. La conversation reste consultable, mais aucun nouveau message ne peut être envoyé.</div>
        ) : (
          <>
            <label className="client-message-field">
              <span>Votre message</span>
              <textarea value={body} onChange={(event) => { setBody(event.target.value); setError(""); setSuccess(""); }} rows={5} maxLength={5000} placeholder="Posez votre question ou apportez une précision sur votre dossier…" />
              <small>{body.length} / 5 000 caractères</small>
            </label>

            <div className="client-conversation-actions">
              <label className="client-attachment-picker">
                <input type="file" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={addFiles} />
                <span>＋ Ajouter un document</span>
              </label>
              <span>PDF, Word ou image · 15 Mo maximum</span>
            </div>

            {files.length > 0 && (
              <div className="client-selected-files">
                {files.map((file, index) => <button type="button" key={`${file.name}-${index}`} onClick={() => setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))}><span>▤</span><b>{file.name}</b><small>{formatSize(file.size)}</small><em>×</em></button>)}
              </div>
            )}

            {error && <div className="client-conversation-feedback error">{error}</div>}
            {success && <div className="client-conversation-feedback success">{success}</div>}

            <button type="button" className="client-send-message" onClick={sendMessage} disabled={sending || !body.trim()}>{sending ? "Envoi en cours…" : "Envoyer mon message à LEXIA"}</button>
          </>
        )}
      </div>
    </section>
  );
}
