"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { isAppRole } from "../../../lib/roles";
import "../admin.css";
import "./development.css";

type RoleCount = { role: string; total: number };
type PlatformSettings = { maintenance_mode: boolean; updated_at: string | null };

export default function DevelopmentCenterPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceSaving, setMaintenanceSaving] = useState(false);
  const [serviceCount, setServiceCount] = useState(0);
  const [activeServiceCount, setActiveServiceCount] = useState(0);
  const [roleCounts, setRoleCounts] = useState<RoleCount[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadPage() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/connexion?redirect=%2Fadministration%2Fdeveloppement");
        return;
      }

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
      const role = isAppRole(profile?.role) ? profile.role : "client";
      if (role !== "developpeur" && role !== "admin") {
        router.replace("/tableau-de-bord");
        return;
      }

      const [settingsResult, servicesResult, usersResult] = await Promise.all([
        supabase.from("platform_settings").select("maintenance_mode,updated_at").eq("id", "main").maybeSingle(),
        supabase.from("service_catalog").select("id,active"),
        supabase.rpc("list_users_with_roles"),
      ]);

      if (!mounted) return;

      if (!settingsResult.error && settingsResult.data) {
        const settings = settingsResult.data as PlatformSettings;
        setMaintenanceMode(Boolean(settings.maintenance_mode));
        setUpdatedAt(settings.updated_at);
      }

      if (!servicesResult.error) {
        const services = (servicesResult.data as Array<{ id: string; active: boolean }>) || [];
        setServiceCount(services.length);
        setActiveServiceCount(services.filter((item) => item.active).length);
      }

      if (!usersResult.error) {
        const users = (usersResult.data as Array<{ role: string }>) || [];
        const counts = new Map<string, number>();
        users.forEach((item) => counts.set(item.role, (counts.get(item.role) || 0) + 1));
        setRoleCounts(Array.from(counts.entries()).map(([roleName, total]) => ({ role: roleName, total })));
      }

      setLoading(false);
    }

    void loadPage();
    return () => { mounted = false; };
  }, [router, supabase]);

  async function toggleMaintenance() {
    if (maintenanceSaving) return;
    const nextValue = !maintenanceMode;
    if (nextValue && !window.confirm("Activer le mode maintenance pour tous les visiteurs ?")) return;

    setMaintenanceSaving(true);
    setNotice("");
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    const { data, error: updateError } = await supabase
      .from("platform_settings")
      .update({ maintenance_mode: nextValue, updated_at: new Date().toISOString(), updated_by: user?.id || null })
      .eq("id", "main")
      .select("maintenance_mode,updated_at")
      .single();

    if (updateError || !data) {
      setError("Le mode maintenance n’a pas pu être modifié.");
    } else {
      setMaintenanceMode(Boolean(data.maintenance_mode));
      setUpdatedAt(data.updated_at);
      setNotice(nextValue ? "Le mode maintenance est actif." : "La plateforme est de nouveau accessible.");
    }

    setMaintenanceSaving(false);
  }

  async function logout() {
    await supabase.auth.signOut({ scope: "local" });
    router.replace("/connexion");
  }

  if (loading) return <main className="admin-loading">Chargement du centre technique…</main>;

  return (
    <main className="admin-app development-page">
      <aside className="admin-sidebar">
        <Link href="/administration/developpement" className="admin-logo">LEXIA<span>.</span></Link>
        <div className="admin-badge">DÉVELOPPEUR</div>
        <nav>
          <Link className="active" href="/administration/developpement">⌘ Centre technique</Link>
          <Link href="/administration/utilisateurs">♟ Utilisateurs & rôles</Link>
        </nav>
        <button onClick={logout}>Se déconnecter</button>
      </aside>

      <section className="admin-main development-main">
        <header className="development-hero">
          <div><small>ADMINISTRATION TECHNIQUE</small><h1>Centre développeur</h1><p>Gérez les accès et l’état technique de Lexia sans ouvrir automatiquement les dossiers juridiques ni les paiements.</p></div>
          <span className={maintenanceMode ? "maintenance" : "online"}>{maintenanceMode ? "Maintenance" : "En ligne"}</span>
        </header>

        {notice && <div className="development-notice success">✓ {notice}</div>}
        {error && <div className="development-notice error">! {error}</div>}

        <section className="development-stats">
          <article><span>Comptes inscrits</span><strong>{roleCounts.reduce((sum, item) => sum + item.total, 0)}</strong><small>Tous rôles confondus</small></article>
          <article><span>Prestations</span><strong>{activeServiceCount}/{serviceCount}</strong><small>Actives dans le catalogue</small></article>
          <article><span>État plateforme</span><strong>{maintenanceMode ? "OFF" : "ON"}</strong><small>{updatedAt ? `Mis à jour le ${new Date(updatedAt).toLocaleString("fr-FR")}` : "État actuel"}</small></article>
        </section>

        <div className="development-grid">
          <section className="development-card">
            <div><small>SÉCURITÉ DES ACCÈS</small><h2>Utilisateurs et rôles</h2><p>Attribuez les rôles Client, Juriste, Avocat, Administrateur ou Développeur. Chaque modification est historisée.</p></div>
            <Link href="/administration/utilisateurs">Gérer les utilisateurs →</Link>
          </section>

          <section className="development-card maintenance-card">
            <div><small>DISPONIBILITÉ</small><h2>Mode maintenance</h2><p>Bloquez temporairement l’accès public pendant une intervention technique.</p></div>
            <button type="button" onClick={() => void toggleMaintenance()} disabled={maintenanceSaving}>{maintenanceSaving ? "Mise à jour…" : maintenanceMode ? "Désactiver la maintenance" : "Activer la maintenance"}</button>
          </section>
        </div>

        <section className="development-card role-overview">
          <div><small>RÉPARTITION</small><h2>Comptes par rôle</h2></div>
          <div>{roleCounts.map((item) => <article key={item.role}><span>{item.role}</span><strong>{item.total}</strong></article>)}</div>
        </section>

        <section className="development-warning">
          <strong>Confidentialité juridique</strong>
          <p>Le rôle Développeur peut gérer la technique et les droits, mais les politiques Supabase ne lui accordent pas la lecture des dossiers, messages juridiques, documents confidentiels ou paiements.</p>
        </section>
      </section>
    </main>
  );
}
