"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import CaseConversation from "../../components/CaseConversation";
import "./admin-case-inbox.css";

type LegalCase = {
  id: string;
  reference: string;
  user_id: string;
  subject: string;
  category: string;
  status: string;
  updated_at: string;
};

type Profile = {
  id: string;
  full_name: string | null;
  company_name: string | null;
};

type MessagePreview = {
  id: string;
  case_id: string;
  sender_role: "client" | "admin" | "juriste";
  body: string;
  is_internal: boolean;
  read_by_staff_at: string | null;
  created_at: string;
};

const statusLabels: Record<string, string> = {
  submitted: "Dossier transmis",
  payment_pending: "Paiement en attente",
  paid: "Paiement confirmé",
  in_review: "Analyse en cours",
  awaiting_client: "Action client attendue",
  completed: "Dossier terminé",
  cancelled: "Dossier annulé",
};

export default function AdminCaseInbox() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [messages, setMessages] = useState<MessagePreview[]>([]);
  const [selectedId, setSelectedId] = useState(searchParams.get("dossier") || "");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const requested = searchParams.get("dossier") || "";
    if (requested) setSelectedId(requested);
  }, [searchParams]);

  useEffect(() => {
    let mounted = true;

    async function loadInbox() {
      const [caseResult, messageResult] = await Promise.all([
        supabase.from("legal_cases").select("id,reference,user_id,subject,category,status,updated_at").order("updated_at", { ascending: false }),
        supabase.from("legal_case_messages").select("id,case_id,sender_role,body,is_internal,read_by_staff_at,created_at").order("created_at", { ascending: true }),
      ]);

      if (!mounted) return;
      if (caseResult.error || messageResult.error) {
        setError("La messagerie des dossiers n’a pas pu être chargée.");
        setLoading(false);
        return;
      }

      const loadedCases = (caseResult.data as LegalCase[]) || [];
      setCases(loadedCases);
      setMessages((messageResult.data as MessagePreview[]) || []);

      const userIds = Array.from(new Set(loadedCases.map((item) => item.user_id)));
      if (userIds.length > 0) {
        const { data } = await supabase.from("profiles").select("id,full_name,company_name").in("id", userIds);
        if (mounted) setProfiles(Object.fromEntries(((data as Profile[]) || []).map((profile) => [profile.id, profile])));
      }

      if (!selectedId && loadedCases.length > 0) setSelectedId(loadedCases[0].id);
      setLoading(false);
    }

    void loadInbox();

    const messagesChannel = supabase
      .channel("admin-case-inbox-messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "legal_case_messages" }, (payload) => {
        const incoming = payload.new as MessagePreview;
        setMessages((current) => [...current.filter((item) => item.id !== incoming.id), incoming].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));
        setCases((current) => current.map((item) => item.id === incoming.case_id ? { ...item, updated_at: incoming.created_at } : item));
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "legal_case_messages" }, (payload) => {
        const incoming = payload.new as MessagePreview;
        setMessages((current) => current.map((item) => item.id === incoming.id ? incoming : item));
      })
      .subscribe();

    const casesChannel = supabase
      .channel("admin-case-inbox-cases")
      .on("postgres_changes", { event: "*", schema: "public", table: "legal_cases" }, (payload) => {
        if (payload.eventType === "DELETE") {
          setCases((current) => current.filter((item) => item.id !== (payload.old as { id?: string }).id));
          return;
        }
        const incoming = payload.new as LegalCase;
        setCases((current) => [incoming, ...current.filter((item) => item.id !== incoming.id)]);
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(casesChannel);
    };
  }, [selectedId, supabase]);

  const filteredCases = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return [...cases]
      .filter((legalCase) => {
        const profile = profiles[legalCase.user_id];
        return !normalized || [legalCase.reference, legalCase.subject, profile?.full_name, profile?.company_name].filter(Boolean).some((value) => String(value).toLowerCase().includes(normalized));
      })
      .sort((a, b) => {
        const aLast = messages.filter((message) => message.case_id === a.id).at(-1)?.created_at || a.updated_at;
        const bLast = messages.filter((message) => message.case_id === b.id).at(-1)?.created_at || b.updated_at;
        return new Date(bLast).getTime() - new Date(aLast).getTime();
      });
  }, [cases, messages, profiles, search]);

  const selectedCase = cases.find((item) => item.id === selectedId) || null;
  const unreadTotal = messages.filter((message) => message.sender_role === "client" && !message.read_by_staff_at).length;

  function selectCase(caseId: string) {
    setSelectedId(caseId);
    router.replace(`/administration/messages?dossier=${caseId}`, { scroll: false });
  }

  if (loading) return <div className="admin-case-inbox-loading">Chargement des conversations…</div>;

  return (
    <section className="admin-case-inbox">
      <aside className="admin-case-inbox-list">
        <header>
          <div><b>Conversations dossiers</b><span>{unreadTotal} non lue{unreadTotal > 1 ? "s" : ""}</span></div>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un dossier…" />
        </header>
        {error && <p className="admin-case-inbox-error">{error}</p>}
        <div className="admin-case-inbox-scroll">
          {filteredCases.length === 0 && <p className="admin-case-inbox-empty">Aucun dossier disponible.</p>}
          {filteredCases.map((legalCase) => {
            const profile = profiles[legalCase.user_id];
            const caseMessages = messages.filter((message) => message.case_id === legalCase.id && !message.is_internal);
            const lastMessage = caseMessages.at(-1);
            const unread = caseMessages.filter((message) => message.sender_role === "client" && !message.read_by_staff_at).length;
            return <button type="button" key={legalCase.id} className={selectedId === legalCase.id ? "active" : ""} onClick={() => selectCase(legalCase.id)}>
              <div className="admin-case-inbox-item-top"><b>{legalCase.reference}</b>{unread > 0 && <em>{unread}</em>}</div>
              <strong>{legalCase.subject}</strong>
              <span>{profile?.full_name || profile?.company_name || "Client"}</span>
              <p>{lastMessage ? lastMessage.body : "Aucun message dans ce dossier."}</p>
              <small>{lastMessage ? new Date(lastMessage.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : statusLabels[legalCase.status] || legalCase.status}</small>
            </button>;
          })}
        </div>
      </aside>

      <div className="admin-case-inbox-conversation">
        {selectedCase ? <>
          <div className="admin-selected-case-title"><div><small>{selectedCase.reference}</small><h2>{selectedCase.subject}</h2><p>{profiles[selectedCase.user_id]?.full_name || profiles[selectedCase.user_id]?.company_name || "Client"} · {statusLabels[selectedCase.status] || selectedCase.status}</p></div><a href={`/administration/dossiers?dossier=${selectedCase.id}`}>Voir le dossier</a></div>
          <CaseConversation caseId={selectedCase.id} clientUserId={selectedCase.user_id} role="admin" />
        </> : <div className="admin-case-inbox-placeholder"><span>✉</span><h2>Sélectionnez un dossier</h2><p>La conversation sécurisée s’affichera ici.</p></div>}
      </div>
    </section>
  );
}
