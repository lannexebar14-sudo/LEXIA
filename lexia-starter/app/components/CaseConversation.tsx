"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import "./case-conversation.css";

type ConversationRole = "client" | "admin" | "juriste" | "avocat";

type CaseMessage = {
  id: string;
  case_id: string;
  user_id: string;
  sender_id: string;
  sender_role: ConversationRole;
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
  clientUserId: string;
  role: ConversationRole;
};

const MAX_FILES = 3;
const MAX_FILE_SIZE = 15 * 1024 * 1024;

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}

function safeFileName(name: string) {
  const parts = name.split(".");
  const extension = parts.length > 1 ? `.${parts.pop()!.toLowerCase().replace(/[^a-z0-9]/g, "")}` : "";
  const base = parts.join(".").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "document";
  return `${base}${extension}`;
}

export default function CaseConversation({ caseId, clientUserId, role }: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [messages, setMessages] = useState<CaseMessage[]>([]);
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [internal, setInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);

  const isStaff = role === "admin" || role === "juriste" || role === "avocat";

  async function markRead() {
    await supabase.rpc("mark_legal_case_messages_read", { p_case_id: caseId });
  }

  useEffect(() => {
    let mounted = true;

    async function loadConversation() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted) return;
      setCurrentUserId(user?.id || "");

      const [messageResult, attachmentResult] = await Promise.all([
        supabase
          .from("legal_case_messages")
          .select("id,case_id,user_id,sender_id,sender_role,body,is_internal,read_by_client_at,read_by_staff_at,created_at")
          .eq("case_id", caseId)
          .order("created_at", { ascending: true }),
        supabase
          .from("legal_case_message_attachments")
          .select("id,message_id,case_id,storage_path,original_name,mime_type,size_bytes,created_at")
          .eq("case_id", caseId)
          .order("created_at", { ascending: true }),
      ]);

      if (!mounted) return;
      if (messageResult.error || attachmentResult.error) {
        setError("La conversation n’a pas pu être chargée.");
      } else {
        setMessages((messageResult.data as CaseMessage[]) || []);
        setAttachments((attachmentResult.data as MessageAttachment[]) || []);
        await markRead();
      }
      setLoading(false);
    }

    void loadConversation();

    const messageChannel = supabase
      .channel(`case-conversation-${caseId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "legal_case_messages", filter: `case_id=eq.${caseId}` }, (payload) => {
        const incoming = payload.new as CaseMessage;
        setMessages((current) => [...current.filter((item) => item.id !== incoming.id), incoming].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));
        void markRead();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "legal_case_messages", filter: `case_id=eq.${caseId}` }, (payload) => {
        const incoming = payload.new as CaseMessage;
        setMessages((current) => current.map((item) => item.id === incoming.id ? incoming : item));
      })
      .subscribe();

    const attachmentChannel = supabase
      .channel(`case-conversation-files-${caseId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "legal_case_message_attachments", filter: `case_id=eq.${caseId}` }, (payload) => {
        const incoming = payload.new as MessageAttachment;
        setAttachments((current) => [...current.filter((item) => item.id !== incoming.id), incoming]);
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(attachmentChannel);
    };
  }, [caseId, supabase]);

  function chooseFiles(event: ChangeEvent<HTMLInputElement>) {
    setError("");
    const selected = Array.from(event.target.files || []).slice(0, MAX_FILES);
    const oversized = selected.find((file) => file.size > MAX_FILE_SIZE);
    if (oversized) {
      setFiles([]);
      setFileInputKey((value) => value + 1);
      setError(`${oversized.name} dépasse la limite de 15 Mo.`);
      return;
    }
    setFiles(selected);
  }

  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    if (sending) return;
    const cleanText = text.trim();
    if (!cleanText && files.length === 0) {
      setError("Écrivez un message ou ajoutez un document.");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Votre session a expiré. Reconnectez-vous.");
      return;
    }

    setSending(true);
    setError("");

    const body = cleanText || (files.length === 1 ? "Un document a été transmis." : `${files.length} documents ont été transmis.`);
    const { data: insertedMessage, error: insertError } = await supabase
      .from("legal_case_messages")
      .insert({
        case_id: caseId,
        user_id: clientUserId,
        sender_id: user.id,
        sender_role: role,
        body,
        is_internal: isStaff ? internal : false,
      })
      .select("id,case_id,user_id,sender_id,sender_role,body,is_internal,read_by_client_at,read_by_staff_at,created_at")
      .single();

    if (insertError || !insertedMessage) {
      setError("Le message n’a pas pu être envoyé.");
      setSending(false);
      return;
    }

    const message = insertedMessage as CaseMessage;
    setMessages((current) => [...current.filter((item) => item.id !== message.id), message].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));

    let uploadFailed = false;
    for (const file of files) {
      const storagePath = `${clientUserId}/${caseId}/messages/${message.id}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
      const { error: uploadError } = await supabase.storage.from("case-documents").upload(storagePath, file, { upsert: false, contentType: file.type || undefined });
      if (uploadError) {
        uploadFailed = true;
        continue;
      }

      const { data: attachment, error: metadataError } = await supabase
        .from("legal_case_message_attachments")
        .insert({
          message_id: message.id,
          case_id: caseId,
          user_id: clientUserId,
          uploaded_by: user.id,
          storage_path: storagePath,
          original_name: file.name,
          mime_type: file.type || null,
          size_bytes: file.size,
        })
        .select("id,message_id,case_id,storage_path,original_name,mime_type,size_bytes,created_at")
        .single();

      if (metadataError || !attachment) {
        uploadFailed = true;
        await supabase.storage.from("case-documents").remove([storagePath]);
      } else {
        const savedAttachment = attachment as MessageAttachment;
        setAttachments((current) => [...current.filter((item) => item.id !== savedAttachment.id), savedAttachment]);
      }
    }

    setText("");
    setFiles([]);
    setInternal(false);
    setFileInputKey((value) => value + 1);
    if (uploadFailed) setError("Le message a été envoyé, mais un document n’a pas pu être ajouté.");
    setSending(false);
  }

  async function openAttachment(attachment: MessageAttachment) {
    setError("");
    const { data, error: signedError } = await supabase.storage.from("case-documents").createSignedUrl(attachment.storage_path, 90);
    if (signedError || !data?.signedUrl) {
      setError("Ce document ne peut pas être ouvert pour le moment.");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="case-conversation" id="messagerie">
      <header className="case-conversation-header">
        <div>
          <small>MESSAGERIE DU DOSSIER</small>
          <h3>Conversation sécurisée</h3>
          <p>{isStaff ? "Répondez au client ou ajoutez une note interne à l’équipe." : "Échangez avec l’équipe chargée de votre dossier."}</p>
        </div>
        <span>{messages.filter((message) => !message.is_internal).length} message{messages.filter((message) => !message.is_internal).length > 1 ? "s" : ""}</span>
      </header>

      <div className="case-conversation-thread" aria-live="polite">
        {loading && <p className="case-conversation-empty">Chargement de la conversation…</p>}
        {!loading && messages.length === 0 && <div className="case-conversation-empty"><b>Aucun message pour le moment.</b><span>La première réponse apparaîtra ici et déclenchera une notification.</span></div>}
        {messages.map((message) => {
          const own = message.sender_id === currentUserId;
          const messageAttachments = attachments.filter((attachment) => attachment.message_id === message.id);
          const senderLabel = message.sender_role === "client"
            ? "Client"
            : message.sender_role === "juriste"
              ? "Juriste"
              : message.sender_role === "avocat"
                ? "Avocat"
                : "Administration";
          const readLabel = own
            ? message.sender_role === "client"
              ? message.read_by_staff_at ? "Lu par l’équipe" : "Envoyé"
              : message.is_internal ? "Note interne" : message.read_by_client_at ? "Lu par le client" : "Envoyé"
            : "";

          return <article key={message.id} className={`case-conversation-message ${own ? "own" : "received"} ${message.is_internal ? "internal" : ""}`}>
            <div className="case-message-meta"><b>{message.is_internal ? "Note interne" : senderLabel}</b><time>{new Date(message.created_at).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}</time></div>
            <p>{message.body}</p>
            {messageAttachments.length > 0 && <div className="case-message-files">{messageAttachments.map((attachment) => <button type="button" key={attachment.id} onClick={() => openAttachment(attachment)}><span>▤</span><div><b>{attachment.original_name}</b><small>{formatSize(attachment.size_bytes)}</small></div><em>Ouvrir</em></button>)}</div>}
            {readLabel && <small className="case-message-read">{readLabel}</small>}
          </article>;
        })}
      </div>

      <form className="case-conversation-form" onSubmit={sendMessage}>
        <textarea value={text} onChange={(event) => setText(event.target.value)} maxLength={5000} rows={3} placeholder={isStaff ? "Écrire au client…" : "Écrire à l’équipe LEXIA…"} />
        <div className="case-conversation-actions">
          <label className="case-file-picker"><input key={fileInputKey} type="file" multiple onChange={chooseFiles} /><span>＋ Ajouter un document</span></label>
          {isStaff && <label className="case-internal-toggle"><input type="checkbox" checked={internal} onChange={(event) => setInternal(event.target.checked)} /><span>Note interne invisible au client</span></label>}
          <button type="submit" disabled={sending}>{sending ? "Envoi…" : internal ? "Ajouter la note" : "Envoyer"}</button>
        </div>
        {files.length > 0 && <div className="case-selected-files">{files.map((file) => <span key={`${file.name}-${file.size}`}>{file.name} · {formatSize(file.size)}</span>)}</div>}
        <small className="case-file-limit">3 documents maximum · 15 Mo par document</small>
        {error && <p className="case-conversation-error">{error}</p>}
      </form>
    </section>
  );
}
