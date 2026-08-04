"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import "../admin.css";
import "../admin-console.css";
import "../../mobile-app.css";
import "./dossiers.css";

type AdminCase = {
  id: string;
  reference: string;
  user_id: string;
  account_type: string;
  category: string;
  subject: string;
  description: string;
  objective: string | null;
  urgency: string;
  adverse_known: boolean;
  adverse_type: string | null;
  adverse_name: string | null;
  adverse_email: string | null;
  adverse_phone: string | null;
  status: string;
  opening_amount: number;
  services_amount: number;
  total_amount: number;
  assigned_jurist_id: string | null;
  created_at: string;
  updated_at: string;
};

type ClientProfile = {
  id: string;
  full_name: string | null;
  account_type: string;
  company_name: string | null;
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

const categoryLabels: Record<string, string> = {
  logement: "Logement",
  travail: "Travail",
  consommation: "Consommation",
  assurance: "Assurance",
  famille: "Famille",
  entreprise: "Entreprise",
  administration: "Administration",
  autre: "Autre situation",
};

const statusOptions = ["submitted", "in_review", "awaiting_client", "completed", "cancelled"];

function formatAmount(cents: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}

export default function AdminCasesPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [cases, setCases] = useState<AdminCase[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ClientProfile>>({});
  const [documents, setDocuments] = useState<CaseDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openCaseId, setOpenCaseId] = useState<string | null>(null);
  const [savingCaseId, setSavingCaseId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadPage() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.replace("/connexion");
      const { data: adminProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (adminProfile?.role !== "admin") return router.replace("/tableau-de-bord");

      const [caseResult, documentResult] = await Promise.all([
        supabase.from("legal_cases").select("*").order("created_at", { ascending: false }),
        supabase.from("legal_case_documents").select("id,case_id,storage_path,original_name,size_bytes,created_at").order("created_at", { ascending: false }),
      ]);

      if (!mounted) return;
      const loadedCases = (caseResult.data as AdminCase[]) || [];
      setCases(loadedCases);
      setDocuments((documentResult.data as CaseDocument[]) || []);

      const userIds = Array.from(new Set(loadedCases.map((legalCase) => legalCase.user_id)));
      if (userIds.length > 0) {
        const { data: clientProfiles } = await supabase.from("profiles").select("id,full_name,account_type,company_name").in("id", userIds);
        const profileMap = Object.fromEntries(((clientProfiles as ClientProfile[]) || []).map((profile) => [profile.id, profile]));
        setProfiles(profileMap);
      }
      setLoading(false);
    }

    loadPage();

    const channel = supabase
      .channel("admin-legal-cases")
      .on("postgres_changes", { event: "*", schema: "public", table: "legal_cases" }, async (payload) => {
        if (payload.eventType === "DELETE") {
          setCases((current) => current.filter((item) => item.id !== (payload.old as { id?: string }).id));
          return;
        }
        const incoming = payload.new as AdminCase;
        setCases((current) => [incoming, ...current.filter((item) => item.id !== incoming.id)].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        if (!profiles[incoming.user_id]) {
          const { data: profile } = await supabase.from("profiles").select("id,full_name,account_type,company_name").eq("id", incoming.user_id).maybeSingle();
          if (profile) setProfiles((current) => ({ ...current, [profile.id]: profile as ClientProfile }));
        }
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [profiles, router, supabase]);

  const filteredCases = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return cases.filter((legalCase) => {
      const profile = profiles[legalCase.user_id];
      const matchesStatus = statusFilter === "all" || legalCase.status === statusFilter;
      const matchesSearch = !normalized || [legalCase.reference, legalCase.subject, legalCase.category, profile?.full_name, profile?.company_name].filter(Boolean).some((value) => String(value).toLowerCase().includes(normalized));
      return matchesStatus && matchesSearch;
    });
  }, [cases, profiles, search, statusFilter]);

  const stats = useMemo(() => ({
    submitted: cases.filter((legalCase) => legalCase.status === "submitted").length,
    inReview: cases.filter((legalCase) => legalCase.status === "in_review").length,
    waiting: cases.filter((legalCase) => legalCase.status === "awaiting_client").length,
    urgent: cases.filter((legalCase) => legalCase.urgency === "urgente" && !["completed", "cancelled"].includes(legalCase.status)).length,
  }), [cases]);

  async function changeStatus(legalCase: AdminCase, nextStatus: string) {
    if (nextStatus === legalCase.status || savingCaseId) return;
    if (["completed", "cancelled"].includes(nextStatus) && !window.confirm(`Confirmer le statut « ${statusLabels[nextStatus]} » pour ${legalCase.reference} ?`)) return;

    setSavingCaseId(legalCase.id);
    setNotice("");
    const { error } = await supabase.from("legal_cases").update({ status: nextStatus }).eq("id", legalCase.id);
    if (error) {
      setNotice(`Le statut de ${legalCase.reference} n’a pas pu être modifié.`);
    } else {
      setCases((current) => current.map((item) => item.id === legalCase.id ? { ...item, status: nextStatus, updated_at: new Date().toISOString() } : item));
      setNotice(`${legalCase.reference} : statut mis à jour. Le client a été notifié.`);
    }
    setSavingCaseId(null);
  }

  async function openDocument(document: CaseDocument) {
    const { data, error } = await supabase.storage.from("case-documents").createSignedUrl(document.storage_path, 60);
    if (error || !data?.signedUrl) {
      setNotice("Le document n’a pas pu être ouvert.");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/connexion");
  }

  if (loading) return <main className="admin-loading">Chargement des dossiers…</main>;

  return (
    <main className="admin-app">
      <aside className="admin-sidebar">
        <Link href="/administration" className="admin-logo">LEXIA<span>.</span></Link>
        <div className="admin-badge">ADMINISTRATION</div>
        <nav>
          <Link href="/administration">◫ Vue d’ensemble</Link>
          <Link className="active" href="/administration/dossiers">▣ Dossiers</Link>
          <Link href="/administration/messages">✉ Messagerie</Link>
          <Link href="/administration/clients">♙ Clients</Link>
          <Link href="/administration/juristes">⚖ Juristes</Link>
          <Link href="/administration/prestations">€ Prestations</Link>
          <Link href="/administration/avocats">⌖ Avocats partenaires</Link>
          <Link href="/administration/parametres">⚙ Paramètres</Link>
        </nav>
        <button onClick={logout}>Se déconnecter</button>
      </aside>

      <section className="admin-main admin-cases-page">
        <header className="admin-cases-hero">
          <div><small>GESTION DES DEMANDES</small><h1>Dossiers clients</h1><p>Consultez les demandes, ouvrez les documents et actualisez leur traitement.</p></div>
          <Link href="/nouveau-dossier">＋ Déposer un dossier test</Link>
        </header>

        {notice && <div className="admin-case-notice">{notice}</div>}

        <section className="admin-case-stats">
          <article><span>Nouveaux</span><strong>{stats.submitted}</strong><small>À examiner</small></article>
          <article><span>En analyse</span><strong>{stats.inReview}</strong><small>Traitement en cours</small></article>
          <article><span>Client attendu</span><strong>{stats.waiting}</strong><small>Information demandée</small></article>
          <article><span>Urgents</span><strong>{stats.urgent}</strong><small>Dossiers actifs</small></article>
        </section>

        <section className="admin-case-toolbar">
          <label><span>Rechercher</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Référence, client, titre…" /></label>
          <label><span>Statut</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">Tous les statuts</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <div><b>{filteredCases.length}</b><span>dossier{filteredCases.length > 1 ? "s" : ""}</span></div>
        </section>

        <section className="admin-case-list">
          {filteredCases.length === 0 && <div className="admin-case-empty"><span>▣</span><h2>Aucun dossier correspondant</h2><p>Les dossiers transmis par les clients apparaîtront ici automatiquement.</p></div>}
          {filteredCases.map((legalCase) => {
            const profile = profiles[legalCase.user_id];
            const caseDocuments = documents.filter((document) => document.case_id === legalCase.id);
            const isOpen = openCaseId === legalCase.id;
            return <article key={legalCase.id} className={`admin-case-card ${isOpen ? "open" : ""}`}>
              <div className="admin-case-summary">
                <div className="admin-case-ref"><small>{categoryLabels[legalCase.category] || legalCase.category}</small><b>{legalCase.reference}</b><span>{new Date(legalCase.created_at).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}</span></div>
                <div className="admin-case-subject"><h2>{legalCase.subject}</h2><p>{profile?.full_name || profile?.company_name || "Client"} · {legalCase.account_type} · {legalCase.urgency}</p></div>
                <div className="admin-case-doc-count"><b>{caseDocuments.length}</b><span>document{caseDocuments.length > 1 ? "s" : ""}</span></div>
                <label className={`admin-status-select status-${legalCase.status}`}><select value={legalCase.status} disabled={savingCaseId === legalCase.id} onChange={(event) => changeStatus(legalCase, event.target.value)}>{statusOptions.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}</select></label>
                <button type="button" className="admin-case-open" onClick={() => setOpenCaseId(isOpen ? null : legalCase.id)}>{isOpen ? "Fermer" : "Ouvrir"}</button>
              </div>

              {isOpen && <div className="admin-case-details">
                <section><small>SITUATION TRANSMISE</small><h3>Description</h3><p>{legalCase.description}</p><h3>Résultat souhaité</h3><p>{legalCase.objective || "Non renseigné"}</p></section>
                <section><small>INFORMATIONS</small><div className="admin-info-grid"><article><span>Client</span><b>{profile?.full_name || "Non renseigné"}</b></article><article><span>Profil</span><b>{legalCase.account_type}</b></article><article><span>Urgence</span><b>{legalCase.urgency}</b></article><article><span>Montant prévu</span><b>{formatAmount(legalCase.total_amount)}</b></article><article><span>Partie adverse</span><b>{legalCase.adverse_known ? legalCase.adverse_name || "À compléter" : "Non renseignée"}</b></article><article><span>Dernière mise à jour</span><b>{new Date(legalCase.updated_at).toLocaleString("fr-FR")}</b></article></div></section>
                <section className="admin-documents-section"><small>DOCUMENTS SÉCURISÉS</small><h3>Pièces jointes</h3>{caseDocuments.length === 0 ? <p>Aucun document enregistré.</p> : <div>{caseDocuments.map((document) => <button type="button" key={document.id} onClick={() => openDocument(document)}><span>▤</span><div><b>{document.original_name}</b><small>{formatSize(document.size_bytes)} · {new Date(document.created_at).toLocaleDateString("fr-FR")}</small></div><em>Ouvrir</em></button>)}</div>}</section>
              </div>}
            </article>;
          })}
        </section>
      </section>
    </main>
  );
}
