"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { AppRole, LEGAL_ROLES, ROLE_LABELS, isAppRole } from "../../../lib/roles";
import CaseConversation from "../../components/CaseConversation";
import "../admin.css";
import "./staff-messages.css";

type LegalCase = {
  id: string;
  reference: string;
  user_id: string;
  subject: string;
  category: string;
  status: string;
  updated_at: string;
};

type ClientProfile = {
  id: string;
  full_name: string | null;
  company_name: string | null;
};

type MessagePreview = {
  id: string;
  case_id: string;
  sender_role: "client" | "admin" | "juriste" | "avocat";
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
  awaiting_client: "Client attendu",
  completed: "Dossier terminé",
  cancelled: "Dossier annulé",
};

export default function StaffMessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const [role, setRole] = useState<AppRole | null>(null);
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ClientProfile>>({});
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

    async function loadPage() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/connexion?redirect=%2Fadministration%2Fmes-messages");
        return;
      }

      const { data: ownProfile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
      const ownRole: AppRole = isAppRole(ownProfile?.role) ? ownProfile.role : "client";
      if (!LEGAL_ROLES.includes(ownRole)) {
        router.replace(ownRole === "developpeur" ? "/administration/utilisateurs" : "/tableau-de-bord");
        return;
      }

      const [caseResult, messageResult] = await Promise.all([
        supabase.from("legal_cases").select("id,reference,user_id,subject,category,status,updated_at").order("updated_at", { ascending: false }),
        supabase.from("legal_case_messages").select("id,case_id,sender_role,body,is_internal,read_by_staff_at,created_at").order("created_at", { ascending: true }),
      ]);

      if (!mounted) return;
      if (caseResult.error || messageResult.error) {
        setError("La messagerie n’a pas pu être chargée.");
        setLoading(false);
        return;
      }

      const loadedCases = (caseResult.data as LegalCase[]) || [];
      setCases(loadedCases);
      setMessages((messageResult.data as MessagePreview[]) || []);
      setRole(ownRole);

      const userIds = Array.from(new Set(loadedCases.map((item) => item.user_id)));
      if (userIds.length > 0) {
        const { data } = await supabase.from("profiles").select("id,full_name,company_name").in("id", userIds);
        if (mounted) setProfiles(Object.fromEntries(((data as ClientProfile[]) || []).map((profile) => [profile.id, profile])));
      }

      if (!selectedId && loadedCases.length > 0) setSelectedId(loadedCases[0].id);
      setLoading(false);
    }

    void loadPage();

    const messagesChannel = supabase
      .channel("staff-case-messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "legal_case_messages" }, (payload) => {
        const incoming = payload.new as MessagePreview;
        setMessages((current) => [...current.filter((item) => item.id !== incoming.id), incoming]
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));
        setCases((current) => current.map((item) => item.id === incoming.case_id ? { ...item, updated_at: incoming.created_at } : item));
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "legal_case_messages" }, (payload) => {
        const incoming = payload.new as MessagePreview;
        setMessages((current) => current.map((item) => item.id === incoming.id ? incoming : item));
      })
      .subscribe();

    return () => {
      mounted = false;
      void supabase.removeChannel(messagesChannel);
    };
  }, [router, selectedId, supabase]);

  const filteredCases = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return [...cases]
      .filter((legalCase) => {
        const profile = profiles[legalCase.user_id];
        const haystack = `${legalCase.reference} ${legalCase.subject} ${profile?.full_name || ""} ${profile?.company_name || ""}`.toLowerCase();
        return !normalized || haystack.includes(normalized);
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
    router.replace(`/administration/mes-messages?dossier=${caseId}`, { scroll: false });
  }

  async function logout() {
    await supabase.auth.signOut({ scope: "local" });
    router.replace("/connexion");
  }

  if (loading) return <main className="admin-loading">Chargement de votre messagerie…</main>;

  return (
    <main className="admin-app staff-messages-page">
      <aside className="admin-sidebar">
        <Link href="/administration/mes-dossiers" className="admin-logo">LEXIA<span>.</span></Link>
        <div className="admin-badge">{role ? ROLE_LABELS[role].toUpperCase() : "ÉQUIPE JURIDIQUE"}</div>
        <nav>
          <Link href="/administration/mes-dossiers">▣ Mes dossiers</Link>
          <Link className="active" href="/administration/mes-messages">✉ Ma messagerie</Link>
        </nav>
        <button onClick={logout}>Se déconnecter</button>
      </aside>

      <section className="admin-main staff-messages-main">
        <header className="staff-messages-hero">
          <div><small>ÉCHANGES CONFIDENTIELS</small><h1>Messagerie des dossiers attribués</h1><p>Seules les conversations des dossiers qui vous sont confiés sont accessibles.</p></div>
          <span>{unreadTotal} message{unreadTotal > 1 ? "s" : ""} non lu{unreadTotal > 1 ? "s" : ""}</span>
        </header>

        {error && <div className="staff-messages-error">{error}</div>}

        <section className="staff-inbox">
          <aside className="staff-inbox-list">
            <header><b>Conversations</b><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher…" /></header>
            <div>
              {filteredCases.length === 0 && <p className="staff-inbox-empty">Aucun dossier disponible.</p>}
              {filteredCases.map((legalCase) => {
                const profile = profiles[legalCase.user_id];
                const publicMessages = messages.filter((message) => message.case_id === legalCase.id && !message.is_internal);
                const lastMessage = publicMessages.at(-1);
                const unread = publicMessages.filter((message) => message.sender_role === "client" && !message.read_by_staff_at).length;
                return <button type="button" key={legalCase.id} className={selectedId === legalCase.id ? "active" : ""} onClick={() => selectCase(legalCase.id)}>
                  <div><b>{legalCase.reference}</b>{unread > 0 && <em>{unread}</em>}</div>
                  <strong>{legalCase.subject}</strong>
                  <span>{profile?.full_name || profile?.company_name || "Client"}</span>
                  <p>{lastMessage?.body || "Aucun message dans ce dossier."}</p>
                  <small>{lastMessage ? new Date(lastMessage.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : statusLabels[legalCase.status] || legalCase.status}</small>
                </button>;
              })}
            </div>
          </aside>

          <div className="staff-inbox-conversation">
            {selectedCase && role ? <>
              <div className="staff-selected-case"><div><small>{selectedCase.reference}</small><h2>{selectedCase.subject}</h2><p>{profiles[selectedCase.user_id]?.full_name || profiles[selectedCase.user_id]?.company_name || "Client"} · {statusLabels[selectedCase.status] || selectedCase.status}</p></div><Link href="/administration/mes-dossiers">Voir mes dossiers</Link></div>
              <CaseConversation caseId={selectedCase.id} clientUserId={selectedCase.user_id} role={role === "admin" ? "admin" : role === "avocat" ? "avocat" : "juriste"} />
            </> : <div className="staff-inbox-placeholder"><span>✉</span><h2>Sélectionnez un dossier</h2><p>La conversation sécurisée s’affichera ici.</p></div>}
          </div>
        </section>
      </section>
    </main>
  );
}
