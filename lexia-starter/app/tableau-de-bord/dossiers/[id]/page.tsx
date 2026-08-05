"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../../../lib/supabase/client";
import ClientCaseConversation from "./ClientCaseConversation";
import "../../dashboard.css";
import "../../../mobile-app.css";
import "./case-detail.css";
import "./conversation.css";

type LegalCase = {
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
  created_at: string;
  updated_at: string;
};

type CaseEvent = {
  id: string;
  title: string;
  message: string;
  status: string | null;
  created_at: string;
};

type CaseDocument = {
  id: string;
  storage_path: string;
  original_name: string;
  mime_type: string | null;
  size_bytes: number;
  created_at: string;
};

type CaseService = {
  id: string;
  title: string;
  unit_amount: number;
};

const statusLabels: Record<string, string> = {
  submitted: "Transmis à l’administration",
  payment_pending: "Paiement en attente",
  paid: "Paiement confirmé",
  in_review: "Analyse en cours",
  awaiting_client: "Action attendue",
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

function formatAmount(cents: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}

export default function ClientCaseDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const [legalCase, setLegalCase] = useState<LegalCase | null>(null);
  const [events, setEvents] = useState<CaseEvent[]>([]);
  const [documents, setDocuments] = useState<CaseDocument[]>([]);
  const [services, setServices] = useState<CaseService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadCase() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.replace(`/connexion?redirect=/tableau-de-bord/dossiers/${params.id}`);

      const [caseResult, eventsResult, documentsResult, servicesResult] = await Promise.all([
        supabase.from("legal_cases").select("*").eq("id", params.id).eq("user_id", user.id).maybeSingle(),
        supabase.from("legal_case_events").select("id,title,message,status,created_at").eq("case_id", params.id).order("created_at", { ascending: false }),
        supabase.from("legal_case_documents").select("id,storage_path,original_name,mime_type,size_bytes,created_at").eq("case_id", params.id).order("created_at", { ascending: false }),
        supabase.from("legal_case_services").select("id,title,unit_amount").eq("case_id", params.id).order("created_at", { ascending: true }),
      ]);

      if (!mounted) return;
      if (caseResult.error || !caseResult.data) {
        setError("Ce dossier est introuvable ou vous n’êtes pas autorisé à le consulter.");
      } else {
        setLegalCase(caseResult.data as LegalCase);
        setEvents((eventsResult.data as CaseEvent[]) || []);
        setDocuments((documentsResult.data as CaseDocument[]) || []);
        setServices((servicesResult.data as CaseService[]) || []);
      }
      setLoading(false);
    }

    void loadCase();

    const caseChannel = supabase
      .channel(`client-case-${params.id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "legal_cases", filter: `id=eq.${params.id}` }, (payload) => {
        setLegalCase(payload.new as LegalCase);
      })
      .subscribe();

    const eventChannel = supabase
      .channel(`client-case-events-${params.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "legal_case_events", filter: `case_id=eq.${params.id}` }, (payload) => {
        const incoming = payload.new as CaseEvent;
        setEvents((current) => [incoming, ...current.filter((event) => event.id !== incoming.id)]);
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(caseChannel);
      supabase.removeChannel(eventChannel);
    };
  }, [params.id, router, supabase]);

  useEffect(() => {
    if (loading || !legalCase || window.location.hash !== "#messagerie") return;
    const timer = window.setTimeout(() => document.getElementById("messagerie")?.scrollIntoView({ behavior: "smooth", block: "start" }), 250);
    return () => window.clearTimeout(timer);
  }, [legalCase, loading]);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/connexion");
  }

  async function openDocument(document: CaseDocument) {
    const { data, error: signedError } = await supabase.storage.from("case-documents").createSignedUrl(document.storage_path, 60);
    if (signedError || !data?.signedUrl) {
      setError("Le document n’a pas pu être ouvert. Réessayez dans quelques instants.");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  if (loading) return <main className="app-loading">Chargement du dossier…</main>;

  return (
    <main className="client-app">
      <aside className="client-sidebar">
        <Link href="/tableau-de-bord" className="app-logo">LEXIA<span>.</span></Link>
        <nav>
          <Link href="/tableau-de-bord">⌂ Tableau de bord</Link>
          <Link href="/nouveau-dossier">＋ Nouveau dossier</Link>
          <Link className="active" href="/tableau-de-bord#dossiers">▣ Mes dossiers</Link>
          <Link href="#messagerie">✉ Messagerie du dossier</Link>
          <Link href="/tableau-de-bord#transparence">🔔 Suivi des actions</Link>
          <Link href="/tableau-de-bord#documents">▤ Documents</Link>
        </nav>
        <button onClick={logout}>Se déconnecter</button>
      </aside>

      <section className="client-content case-detail-page">
        <header className="case-detail-header">
          <div>
            <Link href="/tableau-de-bord#dossiers">← Retour à mes dossiers</Link>
            <small>DOSSIER CLIENT</small>
            <h1>{legalCase?.reference || "Dossier"}</h1>
          </div>
          {legalCase && <span className={`case-status status-${legalCase.status}`}>{statusLabels[legalCase.status] || legalCase.status}</span>}
        </header>

        {searchParams.get("depot") === "confirme" && <div className="case-success-banner"><b>Votre dossier a bien été transmis.</b><span>L’administration peut maintenant le consulter et vous serez averti à chaque évolution.</span></div>}
        {searchParams.get("documents") === "incomplets" && <div className="case-warning-banner">Le dossier est enregistré, mais certains documents n’ont pas pu être transférés. Vous pourrez les ajouter de nouveau dans la messagerie ci-dessous.</div>}
        {error && <div className="case-error-banner">{error}</div>}

        {legalCase && (
          <>
            <section className="case-detail-hero">
              <div>
                <span>{categoryLabels[legalCase.category] || legalCase.category}</span>
                <h2>{legalCase.subject}</h2>
                <p>Créé le {new Date(legalCase.created_at).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })}</p>
              </div>
              <div className="case-hero-meta">
                <article><small>Urgence</small><strong>{legalCase.urgency}</strong></article>
                <article><small>Profil</small><strong>{legalCase.account_type}</strong></article>
                <article><small>Montant prévu</small><strong>{formatAmount(legalCase.total_amount)}</strong></article>
                <article><small>Documents</small><strong>{documents.length}</strong></article>
              </div>
            </section>

            <ClientCaseConversation caseId={legalCase.id} userId={legalCase.user_id} reference={legalCase.reference} status={legalCase.status} />

            <div className="case-detail-grid">
              <section className="app-card case-main-card">
                <div className="card-title"><div><small>VOTRE DEMANDE</small><h3>Situation transmise</h3></div></div>
                <div className="case-copy-block"><h4>Description</h4><p>{legalCase.description}</p></div>
                <div className="case-copy-block"><h4>Résultat souhaité</h4><p>{legalCase.objective || "Aucun objectif complémentaire n’a été indiqué."}</p></div>
                <div className="case-copy-block"><h4>Partie adverse</h4><p>{legalCase.adverse_known ? [legalCase.adverse_name, legalCase.adverse_type, legalCase.adverse_email, legalCase.adverse_phone].filter(Boolean).join(" · ") || "Informations à compléter" : "Aucune partie adverse renseignée."}</p></div>
              </section>

              <section className="app-card timeline-card">
                <div className="card-title"><div><small>TRANSPARENCE</small><h3>Chronologie</h3></div></div>
                <div className="case-timeline">
                  {events.length === 0 && <p>Aucune action enregistrée.</p>}
                  {events.map((event) => <article key={event.id}><i /><div><b>{event.title}</b><p>{event.message}</p><small>{new Date(event.created_at).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}</small></div></article>)}
                </div>
              </section>
            </div>

            <div className="case-detail-grid lower-grid">
              <section className="app-card">
                <div className="card-title"><div><small>PIÈCES JOINTES</small><h3>Documents sécurisés</h3></div><span className="case-count">{documents.length}</span></div>
                <div className="case-document-list">
                  {documents.length === 0 && <p>Aucun document n’est actuellement enregistré.</p>}
                  {documents.map((document) => <button type="button" key={document.id} onClick={() => openDocument(document)}><span>▤</span><div><b>{document.original_name}</b><small>{formatSize(document.size_bytes)} · ajouté le {new Date(document.created_at).toLocaleDateString("fr-FR")}</small></div><em>Ouvrir</em></button>)}
                </div>
              </section>

              <section className="app-card">
                <div className="card-title"><div><small>PRESTATIONS</small><h3>Services sélectionnés</h3></div><span className="case-count">{services.length}</span></div>
                <div className="case-service-list">
                  {services.length === 0 && <p>Aucune prestation complémentaire sélectionnée.</p>}
                  {services.map((service) => <article key={service.id}><span>{service.title}</span><b>{formatAmount(service.unit_amount)}</b></article>)}
                  <article className="case-total"><span>Montant total</span><b>{formatAmount(legalCase.total_amount)}</b></article>
                </div>
                <p className="case-payment-note">Le statut du paiement et du traitement est actualisé automatiquement dans ce dossier.</p>
              </section>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
