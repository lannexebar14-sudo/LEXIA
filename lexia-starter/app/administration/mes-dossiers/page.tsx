"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { AppRole, LEGAL_ROLES, ROLE_LABELS, isAppRole } from "../../../lib/roles";
import "../admin.css";
import "./staff-cases.css";

type LegalCase = {
  id: string;
  reference: string;
  user_id: string;
  category: string;
  subject: string;
  description: string;
  objective: string | null;
  urgency: string;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
};

type ClientProfile = {
  id: string;
  full_name: string | null;
  company_name: string | null;
  account_type: string | null;
};

type CaseDocument = {
  id: string;
  case_id: string;
  storage_path: string;
  original_name: string;
  size_bytes: number;
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

const editableStatuses = ["submitted", "in_review", "awaiting_client", "completed"];

function formatSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} Ko` : `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}

export default function StaffCasesPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [role, setRole] = useState<AppRole | null>(null);
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ClientProfile>>({});
  const [documents, setDocuments] = useState<CaseDocument[]>([]);
  const [openCaseId, setOpenCaseId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [savingCaseId, setSavingCaseId] = useState("");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadPage() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/connexion?redirect=%2Fadministration%2Fmes-dossiers");
        return;
      }

      const { data: ownProfile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
      const ownRole: AppRole = isAppRole(ownProfile?.role) ? ownProfile.role : "client";
      if (!LEGAL_ROLES.includes(ownRole)) {
        router.replace(ownRole === "developpeur" ? "/administration/utilisateurs" : "/tableau-de-bord");
        return;
      }

      const [caseResult, documentResult] = await Promise.all([
        supabase.from("legal_cases").select("id,reference,user_id,category,subject,description,objective,urgency,status,total_amount,created_at,updated_at").order("updated_at", { ascending: false }),
        supabase.from("legal_case_documents").select("id,case_id,storage_path,original_name,size_bytes,created_at").order("created_at", { ascending: false }),
      ]);

      if (!mounted) return;
      const loadedCases = (caseResult.data as LegalCase[]) || [];
      setCases(loadedCases);
      setDocuments((documentResult.data as CaseDocument[]) || []);
      setRole(ownRole);

      const userIds = Array.from(new Set(loadedCases.map((item) => item.user_id)));
      if (userIds.length > 0) {
        const { data } = await supabase.from("profiles").select("id,full_name,company_name,account_type").in("id", userIds);
        if (mounted) setProfiles(Object.fromEntries(((data as ClientProfile[]) || []).map((profile) => [profile.id, profile])));
      }

      setLoading(false);
    }

    void loadPage();

    const channel = supabase
      .channel("staff-assigned-cases")
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
      void supabase.removeChannel(channel);
    };
  }, [router, supabase]);

  const filteredCases = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return cases.filter((legalCase) => {
      const client = profiles[legalCase.user_id];
      const haystack = `${legalCase.reference} ${legalCase.subject} ${client?.full_name || ""} ${client?.company_name || ""}`.toLowerCase();
      return (statusFilter === "all" || legalCase.status === statusFilter) && (!normalized || haystack.includes(normalized));
    });
  }, [cases, profiles, search, statusFilter]);

  async function changeStatus(legalCase: LegalCase, nextStatus: string) {
    if (nextStatus === legalCase.status || savingCaseId) return;
    setSavingCaseId(legalCase.id);
    setNotice("");
    const { error } = await supabase.from("legal_cases").update({ status: nextStatus }).eq("id", legalCase.id);
    if (error) setNotice("La mise à jour du dossier a été refusée.");
    else {
      setCases((current) => current.map((item) => item.id === legalCase.id ? { ...item, status: nextStatus, updated_at: new Date().toISOString() } : item));
      setNotice(`${legalCase.reference} : statut mis à jour.`);
    }
    setSavingCaseId("");
  }

  async function openDocument(document: CaseDocument) {
    const { data, error } = await supabase.storage.from("case-documents").createSignedUrl(document.storage_path, 90);
    if (error || !data?.signedUrl) {
      setNotice("Ce document ne peut pas être ouvert.");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  async function logout() {
    await supabase.auth.signOut({ scope: "local" });
    router.replace("/connexion");
  }

  if (loading) return <main className="admin-loading">Chargement de vos dossiers attribués…</main>;

  return (
    <main className="admin-app staff-cases-page">
      <aside className="admin-sidebar">
        <Link href="/administration/mes-dossiers" className="admin-logo">LEXIA<span>.</span></Link>
        <div className="admin-badge">{role ? ROLE_LABELS[role].toUpperCase() : "ÉQUIPE JURIDIQUE"}</div>
        <nav>
          <Link className="active" href="/administration/mes-dossiers">▣ Mes dossiers</Link>
          <Link href="/administration/messages">✉ Messagerie</Link>
        </nav>
        <button onClick={logout}>Se déconnecter</button>
      </aside>

      <section className="admin-main staff-cases-main">
        <header className="staff-cases-hero">
          <div><small>ESPACE PROFESSIONNEL</small><h1>Mes dossiers attribués</h1><p>Vous voyez uniquement les dossiers qui vous ont été confiés par l’administration.</p></div>
          <div><span>Accès</span><strong>{role ? ROLE_LABELS[role] : "Professionnel"}</strong></div>
        </header>

        {notice && <div className="staff-cases-notice">{notice}</div>}

        <section className="staff-cases-stats">
          <article><span>Total attribué</span><strong>{cases.length}</strong></article>
          <article><span>À examiner</span><strong>{cases.filter((item) => item.status === "submitted").length}</strong></article>
          <article><span>En analyse</span><strong>{cases.filter((item) => item.status === "in_review").length}</strong></article>
          <article><span>Client attendu</span><strong>{cases.filter((item) => item.status === "awaiting_client").length}</strong></article>
        </section>

        <section className="staff-cases-toolbar">
          <label><span>Rechercher</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Référence, objet ou client…" /></label>
          <label><span>Statut</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">Tous les statuts</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        </section>

        <section className="staff-cases-list">
          {filteredCases.length === 0 && <div className="staff-cases-empty"><span>▣</span><h2>Aucun dossier attribué</h2><p>Les dossiers confiés par l’administration apparaîtront ici.</p></div>}
          {filteredCases.map((legalCase) => {
            const client = profiles[legalCase.user_id];
            const caseDocuments = documents.filter((document) => document.case_id === legalCase.id);
            const isOpen = openCaseId === legalCase.id;
            return <article key={legalCase.id} className={`staff-case-card ${isOpen ? "open" : ""}`}>
              <div className="staff-case-summary">
                <div><small>{legalCase.category}</small><b>{legalCase.reference}</b><span>{new Date(legalCase.updated_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}</span></div>
                <div><h2>{legalCase.subject}</h2><p>{client?.full_name || client?.company_name || "Client"} · {legalCase.urgency}</p></div>
                <label><span>Statut</span><select value={legalCase.status} disabled={savingCaseId === legalCase.id} onChange={(event) => void changeStatus(legalCase, event.target.value)}>{editableStatuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}</select></label>
                <button type="button" onClick={() => setOpenCaseId(isOpen ? null : legalCase.id)}>{isOpen ? "Fermer" : "Ouvrir"}</button>
              </div>

              {isOpen && <div className="staff-case-details">
                <section><small>SITUATION</small><h3>Description</h3><p>{legalCase.description}</p><h3>Résultat souhaité</h3><p>{legalCase.objective || "Non renseigné"}</p></section>
                <section><small>DOCUMENTS</small><h3>{caseDocuments.length} pièce{caseDocuments.length > 1 ? "s" : ""}</h3>{caseDocuments.length === 0 ? <p>Aucun document transmis.</p> : <div className="staff-documents">{caseDocuments.map((document) => <button type="button" key={document.id} onClick={() => void openDocument(document)}><span>▤</span><div><b>{document.original_name}</b><small>{formatSize(document.size_bytes)}</small></div><em>Ouvrir</em></button>)}</div>}</section>
                <section className="staff-case-actions"><Link href={`/administration/messages?dossier=${legalCase.id}`}>Ouvrir la messagerie sécurisée →</Link></section>
              </div>}
            </article>;
          })}
        </section>
      </section>
    </main>
  );
}
