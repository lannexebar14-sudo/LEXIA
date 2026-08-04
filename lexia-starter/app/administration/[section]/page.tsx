"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import "../admin.css";
import "./section.css";

type SectionConfig = { title: string; eyebrow: string; description: string; action: string; icon: string };
type Profile = { id: string; full_name: string | null; account_type: string | null; company_name: string | null; role: string | null };

type SettingsState = {
  platformName: string;
  supportEmail: string;
  supportPhone: string;
  address: string;
  individualPrice: string;
  professionalPrice: string;
  vatRate: string;
  responseDelay: string;
  autoAssign: boolean;
  allowClientDocuments: boolean;
  allowAdverseParty: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  notifyNewCase: boolean;
  notifyNewMessage: boolean;
  notifyPayment: boolean;
  requireEmailConfirmation: boolean;
  requireTwoFactorAdmin: boolean;
  sessionDuration: string;
  maxFileSize: string;
  allowedFileTypes: string;
  retentionYears: string;
  stripeEnabled: boolean;
  invoicePrefix: string;
  lawyerRadius: string;
  maintenanceMode: boolean;
};

const defaultSettings: SettingsState = {
  platformName: "LEXIA",
  supportEmail: "contact@lexia.fr",
  supportPhone: "",
  address: "",
  individualPrice: "13.00",
  professionalPrice: "29.00",
  vatRate: "20",
  responseDelay: "48",
  autoAssign: false,
  allowClientDocuments: true,
  allowAdverseParty: true,
  emailNotifications: true,
  smsNotifications: false,
  notifyNewCase: true,
  notifyNewMessage: true,
  notifyPayment: true,
  requireEmailConfirmation: true,
  requireTwoFactorAdmin: false,
  sessionDuration: "8",
  maxFileSize: "15",
  allowedFileTypes: "PDF, JPG, PNG, DOCX",
  retentionYears: "5",
  stripeEnabled: false,
  invoicePrefix: "LX",
  lawyerRadius: "50",
  maintenanceMode: false,
};

const configs: Record<string, SectionConfig> = {
  dossiers: { title: "Dossiers", eyebrow: "GESTION JURIDIQUE", description: "Consultez, recherchez et attribuez les demandes déposées.", action: "Créer un dossier", icon: "▣" },
  messages: { title: "Messagerie", eyebrow: "ÉCHANGES CLIENTS", description: "Centralisez les conversations liées aux dossiers.", action: "Nouveau message", icon: "✉" },
  clients: { title: "Clients", eyebrow: "UTILISATEURS", description: "Retrouvez les particuliers et professionnels inscrits.", action: "Ajouter un client", icon: "♙" },
  juristes: { title: "Juristes", eyebrow: "ÉQUIPE", description: "Gérez les accès, spécialités et dossiers attribués.", action: "Ajouter un juriste", icon: "⚖" },
  prestations: { title: "Prestations", eyebrow: "OFFRES PAYANTES", description: "Créez et suivez les propositions complémentaires.", action: "Créer une prestation", icon: "€" },
  avocats: { title: "Avocats partenaires", eyebrow: "RÉSEAU PARTENAIRE", description: "Référencez les avocats selon leur barreau et leurs spécialités.", action: "Ajouter un avocat", icon: "⌖" },
  parametres: { title: "Paramètres", eyebrow: "CONFIGURATION", description: "Configurez le fonctionnement complet de la plateforme.", action: "Enregistrer", icon: "⚙" },
};

export default function AdminSectionPage() {
  const params = useParams<{ section: string }>();
  const section = params.section || "dossiers";
  const config = configs[section] || configs.dossiers;
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);

  useEffect(() => {
    async function verifyAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.replace("/connexion");
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (profile?.role !== "admin") return router.replace("/tableau-de-bord");

      const { data: profileRows } = await supabase
        .from("profiles")
        .select("id, full_name, account_type, company_name, role")
        .order("full_name", { ascending: true });

      setProfiles((profileRows as Profile[]) || []);

      const saved = window.localStorage.getItem("lexia_admin_settings");
      if (saved) {
        try { setSettings({ ...defaultSettings, ...JSON.parse(saved) }); } catch { /* ignore invalid data */ }
      }
      setLoading(false);
    }
    verifyAdmin();
  }, [router, supabase]);

  const clients = profiles.filter((profile) => profile.role !== "admin" && profile.role !== "juriste");
  const jurists = profiles.filter((profile) => profile.role === "juriste");

  const emptyText = useMemo(() => ({
    dossiers: "Aucun dossier enregistré pour le moment.",
    messages: "Aucune conversation en attente.",
    clients: clients.length ? `${clients.length} client(s) disponible(s).` : "Aucun autre client inscrit pour le moment.",
    juristes: jurists.length ? `${jurists.length} juriste(s) disponible(s).` : "Aucun juriste ajouté pour le moment.",
    prestations: "Aucune prestation complémentaire créée.",
    avocats: "Aucun avocat partenaire référencé.",
  }[section] || "Aucune donnée."), [section, clients.length, jurists.length]);

  function submitGeneric(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(`${config.title} : les informations ont bien été enregistrées.`);
    setShowForm(false);
  }

  function submitDossier(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const clientId = String(form.get("clientId") || "");
    const client = clients.find((item) => item.id === clientId);
    setNotice(`Dossier créé pour ${client?.full_name || client?.company_name || "le client sélectionné"}. L’enregistrement Supabase définitif sera branché à l’étape suivante.`);
    setShowForm(false);
  }

  function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.localStorage.setItem("lexia_admin_settings", JSON.stringify(settings));
    setNotice("Les paramètres de la plateforme ont été enregistrés sur cet appareil.");
  }

  function updateSetting<K extends keyof SettingsState>(key: K, value: SettingsState[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/connexion");
  }

  if (loading) return <main className="admin-loading">Vérification de vos accès…</main>;

  return (
    <main className="admin-app">
      <aside className="admin-sidebar">
        <Link href="/" className="admin-logo">LEXIA<span>.</span></Link>
        <div className="admin-badge">ADMINISTRATION</div>
        <nav>
          <Link href="/administration">◫ Vue d’ensemble</Link>
          <Link className={section === "dossiers" ? "active" : ""} href="/administration/dossiers">▣ Dossiers</Link>
          <Link className={section === "messages" ? "active" : ""} href="/administration/messages">✉ Messagerie</Link>
          <Link className={section === "clients" ? "active" : ""} href="/administration/clients">♙ Clients</Link>
          <Link className={section === "juristes" ? "active" : ""} href="/administration/juristes">⚖ Juristes</Link>
          <Link className={section === "prestations" ? "active" : ""} href="/administration/prestations">€ Prestations</Link>
          <Link className={section === "avocats" ? "active" : ""} href="/administration/avocats">⌖ Avocats partenaires</Link>
          <Link className={section === "parametres" ? "active" : ""} href="/administration/parametres">⚙ Paramètres</Link>
        </nav>
        <button onClick={logout}>Se déconnecter</button>
      </aside>

      <section className="admin-main">
        <header className="section-header">
          <div><small>{config.eyebrow}</small><h1>{config.icon} {config.title}</h1><p>{config.description}</p></div>
          {section !== "parametres" && <button onClick={() => setShowForm(true)}>＋ {config.action}</button>}
        </header>

        {notice && <div className="section-notice">{notice}</div>}

        {section === "parametres" ? (
          <form className="settings-page" onSubmit={saveSettings}>
            <SettingsCard title="Identité de la plateforme" description="Informations générales visibles par les clients.">
              <Field label="Nom de la plateforme"><input value={settings.platformName} onChange={(e) => updateSetting("platformName", e.target.value)} /></Field>
              <Field label="E-mail de support"><input type="email" value={settings.supportEmail} onChange={(e) => updateSetting("supportEmail", e.target.value)} /></Field>
              <Field label="Téléphone"><input value={settings.supportPhone} onChange={(e) => updateSetting("supportPhone", e.target.value)} placeholder="01 00 00 00 00" /></Field>
              <Field label="Adresse"><textarea rows={3} value={settings.address} onChange={(e) => updateSetting("address", e.target.value)} /></Field>
            </SettingsCard>

            <SettingsCard title="Tarifs et facturation" description="Prix d’ouverture de dossier et paramètres de facturation.">
              <Field label="Tarif particulier (€)"><input type="number" step="0.01" value={settings.individualPrice} onChange={(e) => updateSetting("individualPrice", e.target.value)} /></Field>
              <Field label="Tarif professionnel (€)"><input type="number" step="0.01" value={settings.professionalPrice} onChange={(e) => updateSetting("professionalPrice", e.target.value)} /></Field>
              <Field label="TVA (%)"><input type="number" value={settings.vatRate} onChange={(e) => updateSetting("vatRate", e.target.value)} /></Field>
              <Field label="Préfixe de facture"><input value={settings.invoicePrefix} onChange={(e) => updateSetting("invoicePrefix", e.target.value)} /></Field>
              <Toggle label="Activer les paiements Stripe" checked={settings.stripeEnabled} onChange={(value) => updateSetting("stripeEnabled", value)} />
            </SettingsCard>

            <SettingsCard title="Dossiers" description="Règles de création, attribution et traitement.">
              <Field label="Délai de réponse annoncé (heures)"><input type="number" value={settings.responseDelay} onChange={(e) => updateSetting("responseDelay", e.target.value)} /></Field>
              <Toggle label="Attribution automatique à un juriste" checked={settings.autoAssign} onChange={(value) => updateSetting("autoAssign", value)} />
              <Toggle label="Autoriser les documents client" checked={settings.allowClientDocuments} onChange={(value) => updateSetting("allowClientDocuments", value)} />
              <Toggle label="Autoriser la partie adverse facultative" checked={settings.allowAdverseParty} onChange={(value) => updateSetting("allowAdverseParty", value)} />
            </SettingsCard>

            <SettingsCard title="Messagerie et notifications" description="Alertes envoyées à l’équipe et aux utilisateurs.">
              <Toggle label="Notifications par e-mail" checked={settings.emailNotifications} onChange={(value) => updateSetting("emailNotifications", value)} />
              <Toggle label="Notifications par SMS" checked={settings.smsNotifications} onChange={(value) => updateSetting("smsNotifications", value)} />
              <Toggle label="Alerte nouveau dossier" checked={settings.notifyNewCase} onChange={(value) => updateSetting("notifyNewCase", value)} />
              <Toggle label="Alerte nouveau message" checked={settings.notifyNewMessage} onChange={(value) => updateSetting("notifyNewMessage", value)} />
              <Toggle label="Alerte paiement reçu" checked={settings.notifyPayment} onChange={(value) => updateSetting("notifyPayment", value)} />
            </SettingsCard>

            <SettingsCard title="Sécurité" description="Protection des comptes et des sessions.">
              <Toggle label="Confirmation obligatoire de l’e-mail" checked={settings.requireEmailConfirmation} onChange={(value) => updateSetting("requireEmailConfirmation", value)} />
              <Toggle label="Double authentification administrateur" checked={settings.requireTwoFactorAdmin} onChange={(value) => updateSetting("requireTwoFactorAdmin", value)} />
              <Field label="Durée maximale de session (heures)"><input type="number" value={settings.sessionDuration} onChange={(e) => updateSetting("sessionDuration", e.target.value)} /></Field>
            </SettingsCard>

            <SettingsCard title="Documents et conservation" description="Limites techniques et politique d’archivage.">
              <Field label="Taille maximale par fichier (Mo)"><input type="number" value={settings.maxFileSize} onChange={(e) => updateSetting("maxFileSize", e.target.value)} /></Field>
              <Field label="Formats autorisés"><input value={settings.allowedFileTypes} onChange={(e) => updateSetting("allowedFileTypes", e.target.value)} /></Field>
              <Field label="Durée de conservation (années)"><input type="number" value={settings.retentionYears} onChange={(e) => updateSetting("retentionYears", e.target.value)} /></Field>
            </SettingsCard>

            <SettingsCard title="Avocats partenaires" description="Règles d’orientation géographique.">
              <Field label="Rayon de recherche par défaut (km)"><input type="number" value={settings.lawyerRadius} onChange={(e) => updateSetting("lawyerRadius", e.target.value)} /></Field>
            </SettingsCard>

            <SettingsCard title="Maintenance" description="Contrôle général de disponibilité du service.">
              <Toggle label="Activer le mode maintenance" checked={settings.maintenanceMode} onChange={(value) => updateSetting("maintenanceMode", value)} />
            </SettingsCard>

            <div className="settings-save-bar"><span>Les paramètres sensibles devront ensuite être synchronisés avec Supabase.</span><button type="submit">Enregistrer tous les paramètres</button></div>
          </form>
        ) : (
          <>
            <section className="admin-card section-toolbar">
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Rechercher dans ${config.title.toLowerCase()}…`} />
              <select defaultValue="tous"><option value="tous">Tous les statuts</option><option value="actif">Actif</option><option value="attente">En attente</option></select>
              <button onClick={() => setNotice(query ? `Recherche lancée pour « ${query} ».` : "Saisissez un terme de recherche.")}>Rechercher</button>
            </section>

            <section className="admin-card section-content">
              <div className="admin-card-head"><div><small>{config.eyebrow}</small><h2>{config.title}</h2></div><span className="count-pill">{section === "clients" ? clients.length : section === "juristes" ? jurists.length : 0}</span></div>
              {(section === "clients" && clients.length > 0) ? <ProfileList profiles={clients} /> : (section === "juristes" && jurists.length > 0) ? <ProfileList profiles={jurists} /> : <div className="section-empty"><div>{config.icon}</div><b>{emptyText}</b><p>Les prochains éléments apparaîtront automatiquement ici.</p><button onClick={() => setShowForm(true)}>{config.action}</button></div>}
            </section>
          </>
        )}
      </section>

      {showForm && section === "dossiers" && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <form className="admin-modal dossier-modal" onSubmit={submitDossier} onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setShowForm(false)}>×</button>
            <small>GESTION JURIDIQUE</small><h2>Créer un dossier</h2>
            <div className="modal-grid">
              <label className="full-field">Client
                <select name="clientId" required defaultValue="">
                  <option value="" disabled>Sélectionner un client</option>
                  {clients.map((client) => <option key={client.id} value={client.id}>{client.full_name || client.company_name || "Client sans nom"} · {client.account_type || "particulier"}</option>)}
                </select>
                {clients.length === 0 && <small>Aucun client disponible. Créez d’abord un compte client.</small>}
              </label>
              <label>Catégorie
                <select name="category" required defaultValue=""><option value="" disabled>Choisir</option><option>Logement</option><option>Travail</option><option>Consommation</option><option>Famille</option><option>Assurance</option><option>Entreprise</option><option>Administration</option><option>Autre</option></select>
              </label>
              <label>Priorité
                <select name="priority" defaultValue="normale"><option value="basse">Basse</option><option value="normale">Normale</option><option value="haute">Haute</option><option value="urgente">Urgente</option></select>
              </label>
              <label className="full-field">Objet du dossier<input name="title" required placeholder="Ex. Litige avec mon propriétaire" /></label>
              <label className="full-field">Description<textarea name="description" rows={5} required placeholder="Décrivez précisément la situation" /></label>
              <label>Juriste attribué
                <select name="juristId" defaultValue=""><option value="">Non attribué</option>{jurists.map((jurist) => <option key={jurist.id} value={jurist.id}>{jurist.full_name || "Juriste"}</option>)}</select>
              </label>
              <label>Statut initial
                <select name="status" defaultValue="nouveau"><option value="nouveau">Nouveau</option><option value="analyse">En analyse</option><option value="attente_documents">En attente de documents</option><option value="en_cours">En cours</option></select>
              </label>
              <label>Montant d’ouverture (€)<input name="price" type="number" step="0.01" defaultValue={settings.individualPrice} /></label>
              <label>Date limite<input name="deadline" type="date" /></label>
              <fieldset className="full-field adverse-box"><legend>Partie adverse facultative</legend><div className="modal-grid"><label>Type<select name="adverseType" defaultValue=""><option value="">Non renseignée</option><option>Particulier</option><option>Entreprise</option><option>Administration</option><option>Avocat</option></select></label><label>Nom / raison sociale<input name="adverseName" /></label><label>E-mail<input name="adverseEmail" type="email" /></label><label>Téléphone<input name="adversePhone" /></label></div></fieldset>
            </div>
            <div className="modal-actions"><button type="button" onClick={() => setShowForm(false)}>Annuler</button><button type="submit" disabled={clients.length === 0}>Créer le dossier</button></div>
          </form>
        </div>
      )}

      {showForm && section !== "dossiers" && section !== "parametres" && <div className="modal-backdrop" onClick={() => setShowForm(false)}><form className="admin-modal" onSubmit={submitGeneric} onClick={(e) => e.stopPropagation()}><button type="button" className="modal-close" onClick={() => setShowForm(false)}>×</button><small>{config.eyebrow}</small><h2>{config.action}</h2><label>Titre ou nom<input required placeholder="Saisissez une information" /></label><label>Description<textarea rows={5} placeholder="Ajoutez les détails utiles" /></label><div className="modal-actions"><button type="button" onClick={() => setShowForm(false)}>Annuler</button><button type="submit">Enregistrer</button></div></form></div>}
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="settings-field"><span>{label}</span>{children}</label>;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="settings-toggle"><span>{label}</span><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} /><i /></label>;
}

function SettingsCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className="admin-card settings-card"><div className="settings-card-head"><h2>{title}</h2><p>{description}</p></div><div className="settings-card-body">{children}</div></section>;
}

function ProfileList({ profiles }: { profiles: Profile[] }) {
  return <div className="profile-list">{profiles.map((profile) => <article key={profile.id}><div className="profile-avatar">{(profile.full_name || profile.company_name || "C").slice(0, 1).toUpperCase()}</div><div><b>{profile.full_name || profile.company_name || "Utilisateur"}</b><span>{profile.account_type || profile.role || "client"}</span></div><button>Ouvrir</button></article>)}</div>;
}
