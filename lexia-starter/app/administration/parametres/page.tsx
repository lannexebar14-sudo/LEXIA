"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import "../admin.css";
import "../admin-console.css";

type SettingsState = {
  platformName: string;
  supportEmail: string;
  supportPhone: string;
  address: string;
  individualPrice: string;
  professionalPrice: string;
  vatRate: string;
  invoicePrefix: string;
  responseDelay: string;
  lawyerRadius: string;
  sessionDuration: string;
  maxFileSize: string;
  allowedFileTypes: string;
  retentionYears: string;
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
  stripeEnabled: boolean;
  maintenanceMode: boolean;
};

type MaintenanceResult = {
  success?: boolean;
  maintenanceMode?: boolean;
  updatedAt?: string;
  error?: string;
};

const ACCESS_TOKEN_KEY = "lexia_maintenance_admin_token_v2";
const OLD_ACCESS_TOKEN_KEY = "lexia_maintenance_admin_token";

const defaultSettings: SettingsState = {
  platformName: "LEXIA",
  supportEmail: "contact@lexia.fr",
  supportPhone: "",
  address: "",
  individualPrice: "13.00",
  professionalPrice: "29.00",
  vatRate: "20",
  invoicePrefix: "LX",
  responseDelay: "48",
  lawyerRadius: "50",
  sessionDuration: "8",
  maxFileSize: "15",
  allowedFileTypes: "PDF, JPG, PNG, DOCX",
  retentionYears: "5",
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
  stripeEnabled: false,
  maintenanceMode: false,
};

export default function AdminSettingsPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [notice, setNotice] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [maintenanceSaving, setMaintenanceSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadPage() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.replace("/connexion");

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (profile?.role !== "admin") return router.replace("/tableau-de-bord");

      let nextSettings = { ...defaultSettings };
      const saved = window.localStorage.getItem("lexia_admin_settings");
      if (saved) {
        try {
          nextSettings = { ...nextSettings, ...JSON.parse(saved) };
        } catch {
          setNotice("Les anciens paramètres n’ont pas pu être relus. Les valeurs par défaut sont affichées.");
        }
      }

      const { data: platformSettings, error: platformError } = await supabase
        .from("platform_settings")
        .select("maintenance_mode, updated_at")
        .eq("id", "main")
        .maybeSingle();

      if (platformError || typeof platformSettings?.maintenance_mode !== "boolean") {
        setNotice("L’état global du site n’a pas pu être vérifié. Le mode maintenance reste inchangé.");
      } else {
        nextSettings.maintenanceMode = platformSettings.maintenance_mode;
        if (platformSettings.updated_at) setSavedAt(platformSettings.updated_at);
      }

      const savedDate = window.localStorage.getItem("lexia_admin_settings_saved_at");
      if (!platformSettings?.updated_at && savedDate) setSavedAt(savedDate);

      window.localStorage.setItem("lexia_admin_settings", JSON.stringify(nextSettings));
      if (mounted) {
        setSettings(nextSettings);
        setLoading(false);
      }
    }

    loadPage();

    const channel = supabase
      .channel("settings-maintenance-status")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "platform_settings", filter: "id=eq.main" },
        (payload) => {
          const nextValue = Boolean((payload.new as { maintenance_mode?: boolean }).maintenance_mode);
          setSettings((current) => ({ ...current, maintenanceMode: nextValue }));
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [router, supabase]);

  function update<K extends keyof SettingsState>(key: K, value: SettingsState[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const now = new Date().toISOString();
    window.localStorage.setItem("lexia_admin_settings", JSON.stringify(settings));
    window.localStorage.setItem("lexia_admin_settings_saved_at", now);
    setSavedAt(now);
    setNotice("Les paramètres ont été enregistrés. Le mode maintenance est synchronisé séparément avec le serveur.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function changeMaintenance(value: boolean) {
    if (maintenanceSaving || value === settings.maintenanceMode) return;

    const previousValue = settings.maintenanceMode;
    setMaintenanceSaving(true);
    setNotice(value ? "Activation du mode maintenance…" : "Réouverture du site…");

    try {
      const { data, error } = await supabase.functions.invoke<MaintenanceResult>("set-maintenance", {
        body: { enabled: value },
      });

      if (error) throw new Error(error.message || "Le serveur a refusé la modification.");
      if (!data?.success || data.maintenanceMode !== value) {
        throw new Error(data?.error || "Le serveur n’a pas confirmé le nouvel état.");
      }

      const { data: verification, error: verificationError } = await supabase
        .from("platform_settings")
        .select("maintenance_mode, updated_at")
        .eq("id", "main")
        .single();

      if (verificationError || verification.maintenance_mode !== value) {
        throw new Error("La vérification finale du mode maintenance a échoué.");
      }

      const nextSettings = { ...settings, maintenanceMode: value };
      setSettings(nextSettings);
      window.localStorage.setItem("lexia_admin_settings", JSON.stringify(nextSettings));
      window.localStorage.setItem("lexia_admin_settings_saved_at", verification.updated_at || new Date().toISOString());
      setSavedAt(verification.updated_at || new Date().toISOString());
      window.localStorage.removeItem(ACCESS_TOKEN_KEY);
      window.localStorage.removeItem(OLD_ACCESS_TOKEN_KEY);

      if (value) {
        setNotice("Mode maintenance activé. Redirection vers la page de maintenance…");
        window.setTimeout(() => window.location.assign("/"), 500);
      } else {
        setNotice("Mode maintenance désactivé. Le site est de nouveau accessible à tous.");
      }
    } catch (maintenanceError) {
      setSettings((current) => ({ ...current, maintenanceMode: previousValue }));
      setNotice(maintenanceError instanceof Error
        ? `Échec : ${maintenanceError.message}`
        : "Le mode maintenance n’a pas pu être modifié.");
    } finally {
      setMaintenanceSaving(false);
    }
  }

  function resetSettings() {
    setSettings((current) => ({ ...defaultSettings, maintenanceMode: current.maintenanceMode }));
    setNotice("Les valeurs par défaut ont été restaurées, sauf l’état global du mode maintenance.");
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/connexion");
  }

  if (loading) return <main className="admin-loading">Chargement des paramètres…</main>;

  return (
    <main className="admin-app">
      <AdminSidebar onLogout={logout} />

      <section className="admin-main console-main settings-console">
        <header className="console-hero settings-hero">
          <div>
            <small>CONFIGURATION GÉNÉRALE</small>
            <h1>Paramètres</h1>
            <p>Centralisez les réglages commerciaux, opérationnels et de sécurité de LEXIA.</p>
          </div>
          <div className="settings-hero-status">
            <span className={settings.maintenanceMode ? "warning" : "online"}><i />{settings.maintenanceMode ? "Maintenance active" : "Plateforme disponible"}</span>
            <small>{savedAt ? `Dernière synchronisation : ${new Date(savedAt).toLocaleString("fr-FR")}` : "État serveur en attente"}</small>
          </div>
        </header>

        {notice && <div className="console-notice">{notice}</div>}

        <section className="settings-overview">
          <article><span>Tarif particulier</span><strong>{Number(settings.individualPrice).toFixed(2)} €</strong><small>Ouverture standard</small></article>
          <article><span>Tarif professionnel</span><strong>{Number(settings.professionalPrice).toFixed(2)} €</strong><small>Compte avec SIRET</small></article>
          <article><span>Délai annoncé</span><strong>{settings.responseDelay} h</strong><small>Réponse habituelle</small></article>
          <article><span>Rayon avocat</span><strong>{settings.lawyerRadius} km</strong><small>Recherche par défaut</small></article>
        </section>

        <form className="settings-modern-form" onSubmit={saveSettings}>
          <div className="settings-modern-grid">
            <SettingsGroup icon="✦" title="Identité et assistance" description="Informations générales communiquées aux utilisateurs.">
              <Field label="Nom de la plateforme"><input value={settings.platformName} onChange={(event) => update("platformName", event.target.value)} /></Field>
              <Field label="E-mail de support"><input type="email" value={settings.supportEmail} onChange={(event) => update("supportEmail", event.target.value)} /></Field>
              <Field label="Téléphone"><input value={settings.supportPhone} onChange={(event) => update("supportPhone", event.target.value)} placeholder="01 00 00 00 00" /></Field>
              <Field label="Adresse"><textarea rows={3} value={settings.address} onChange={(event) => update("address", event.target.value)} placeholder="Adresse administrative" /></Field>
            </SettingsGroup>

            <SettingsGroup icon="€" title="Tarifs et facturation" description="Prix d’ouverture et informations utilisées sur les factures.">
              <div className="settings-inline-fields">
                <Field label="Particulier (€)"><input type="number" min="0" step="0.01" value={settings.individualPrice} onChange={(event) => update("individualPrice", event.target.value)} /></Field>
                <Field label="Professionnel (€)"><input type="number" min="0" step="0.01" value={settings.professionalPrice} onChange={(event) => update("professionalPrice", event.target.value)} /></Field>
              </div>
              <div className="settings-inline-fields">
                <Field label="TVA (%)"><input type="number" min="0" value={settings.vatRate} onChange={(event) => update("vatRate", event.target.value)} /></Field>
                <Field label="Préfixe facture"><input value={settings.invoicePrefix} onChange={(event) => update("invoicePrefix", event.target.value.toUpperCase())} /></Field>
              </div>
              <Switch label="Paiements Stripe" description="Autoriser les paiements en ligne lorsque Stripe sera branché." checked={settings.stripeEnabled} onChange={(value) => update("stripeEnabled", value)} />
            </SettingsGroup>

            <SettingsGroup icon="▣" title="Traitement des dossiers" description="Règles appliquées au dépôt et au suivi des demandes.">
              <div className="settings-inline-fields">
                <Field label="Délai annoncé (heures)"><input type="number" min="1" value={settings.responseDelay} onChange={(event) => update("responseDelay", event.target.value)} /></Field>
                <Field label="Rayon avocat (km)"><input type="number" min="1" value={settings.lawyerRadius} onChange={(event) => update("lawyerRadius", event.target.value)} /></Field>
              </div>
              <Switch label="Attribution automatique" description="Attribuer automatiquement les nouveaux dossiers à un juriste." checked={settings.autoAssign} onChange={(value) => update("autoAssign", value)} />
              <Switch label="Documents clients" description="Autoriser les clients à transmettre leurs pièces depuis leur espace." checked={settings.allowClientDocuments} onChange={(value) => update("allowClientDocuments", value)} />
              <Switch label="Partie adverse" description="Permettre de renseigner facultativement les coordonnées adverses." checked={settings.allowAdverseParty} onChange={(value) => update("allowAdverseParty", value)} />
            </SettingsGroup>

            <SettingsGroup icon="✉" title="Notifications" description="Choisissez les événements qui doivent alerter l’équipe.">
              <Switch label="Notifications e-mail" description="Canal principal pour les alertes de la plateforme." checked={settings.emailNotifications} onChange={(value) => update("emailNotifications", value)} />
              <Switch label="Notifications SMS" description="Canal secondaire, à activer après connexion d’un fournisseur SMS." checked={settings.smsNotifications} onChange={(value) => update("smsNotifications", value)} />
              <div className="notification-mini-grid">
                <Switch label="Nouveau dossier" checked={settings.notifyNewCase} onChange={(value) => update("notifyNewCase", value)} compact />
                <Switch label="Nouveau message" checked={settings.notifyNewMessage} onChange={(value) => update("notifyNewMessage", value)} compact />
                <Switch label="Paiement reçu" checked={settings.notifyPayment} onChange={(value) => update("notifyPayment", value)} compact />
              </div>
            </SettingsGroup>

            <SettingsGroup icon="◈" title="Sécurité et sessions" description="Renforcez l’accès aux comptes et à l’administration.">
              <Switch label="Confirmation de l’e-mail" description="Exiger la validation de l’adresse avant l’accès au compte." checked={settings.requireEmailConfirmation} onChange={(value) => update("requireEmailConfirmation", value)} />
              <Switch label="Double authentification admin" description="Préparer l’obligation de 2FA pour les comptes administrateurs." checked={settings.requireTwoFactorAdmin} onChange={(value) => update("requireTwoFactorAdmin", value)} />
              <Field label="Durée maximale d’une session (heures)"><input type="number" min="1" value={settings.sessionDuration} onChange={(event) => update("sessionDuration", event.target.value)} /></Field>
            </SettingsGroup>

            <SettingsGroup icon="▤" title="Documents et conservation" description="Limites techniques et durée de conservation des données.">
              <div className="settings-inline-fields">
                <Field label="Taille maximale (Mo)"><input type="number" min="1" value={settings.maxFileSize} onChange={(event) => update("maxFileSize", event.target.value)} /></Field>
                <Field label="Conservation (années)"><input type="number" min="1" value={settings.retentionYears} onChange={(event) => update("retentionYears", event.target.value)} /></Field>
              </div>
              <Field label="Formats autorisés"><input value={settings.allowedFileTypes} onChange={(event) => update("allowedFileTypes", event.target.value)} /></Field>
              <div className="settings-info-box"><span>i</span><p>Les règles de conservation devront être validées juridiquement avant la mise en production définitive.</p></div>
            </SettingsGroup>
          </div>

          <section className={`maintenance-card ${settings.maintenanceMode ? "enabled" : ""}`}>
            <div><span>⚠</span><div><h2>Mode maintenance global</h2><p>Le changement est appliqué immédiatement à tous les visiteurs et à tous les appareils.</p></div></div>
            <Switch
              label={maintenanceSaving ? "Modification en cours…" : settings.maintenanceMode ? "Maintenance activée" : "Plateforme ouverte"}
              checked={settings.maintenanceMode}
              onChange={changeMaintenance}
              compact
              disabled={maintenanceSaving}
            />
          </section>

          <div className="settings-modern-save">
            <div><b>Configuration prête à être enregistrée</b><span>Le mode maintenance est enregistré immédiatement sur le serveur.</span></div>
            <div><button type="button" onClick={resetSettings}>Restaurer les valeurs par défaut</button><button type="submit">Enregistrer les paramètres</button></div>
          </div>
        </form>
      </section>
    </main>
  );
}

function SettingsGroup({ icon, title, description, children }: { icon: string; title: string; description: string; children: ReactNode }) {
  return <section className="settings-modern-card">
    <header><span>{icon}</span><div><h2>{title}</h2><p>{description}</p></div></header>
    <div className="settings-modern-body">{children}</div>
  </section>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="modern-field"><span>{label}</span>{children}</label>;
}

function Switch({ label, description, checked, onChange, compact = false, disabled = false }: { label: string; description?: string; checked: boolean; onChange: (value: boolean) => void; compact?: boolean; disabled?: boolean }) {
  return <label className={`modern-switch ${compact ? "compact" : ""}`}>
    <span><b>{label}</b>{description && <small>{description}</small>}</span>
    <input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} />
    <i />
  </label>;
}

function AdminSidebar({ onLogout }: { onLogout: () => void }) {
  return <aside className="admin-sidebar">
    <Link href="/" className="admin-logo">LEXIA<span>.</span></Link>
    <div className="admin-badge">ADMINISTRATION</div>
    <nav>
      <Link href="/administration">◫ Vue d’ensemble</Link>
      <Link href="/administration/dossiers">▣ Dossiers</Link>
      <Link href="/administration/messages">✉ Messagerie</Link>
      <Link href="/administration/clients">♙ Clients</Link>
      <Link href="/administration/juristes">⚖ Juristes</Link>
      <Link href="/administration/prestations">€ Prestations</Link>
      <Link href="/administration/avocats">⌖ Avocats partenaires</Link>
      <Link className="active" href="/administration/parametres">⚙ Paramètres</Link>
    </nav>
    <button onClick={onLogout}>Se déconnecter</button>
  </aside>;
}
