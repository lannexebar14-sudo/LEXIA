"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { APP_ROLES, AppRole, ROLE_LABELS, ROLE_MANAGER_ROLES, isAppRole } from "../../../lib/roles";
import "../admin.css";
import "./roles.css";

type UserRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: AppRole;
  account_type: string;
  company_name: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  confirmed_at: string | null;
};

type RolePermission = {
  role: AppRole;
  label: string;
  description: string;
  can_access_backoffice: boolean;
  can_view_assigned_cases: boolean;
  can_view_all_cases: boolean;
  can_update_assigned_cases: boolean;
  can_update_all_cases: boolean;
  can_message_assigned_clients: boolean;
  can_manage_support: boolean;
  can_view_users: boolean;
  can_manage_roles: boolean;
  can_manage_catalog: boolean;
  can_view_payments: boolean;
  can_manage_settings: boolean;
  can_search_lawyers: boolean;
  can_manage_technical: boolean;
};

type RoleChange = {
  id: number;
  user_id: string;
  previous_role: AppRole;
  new_role: AppRole;
  changed_by: string | null;
  changed_at: string;
};

const permissionLabels: Array<[keyof RolePermission, string]> = [
  ["can_access_backoffice", "Accès au back-office"],
  ["can_view_assigned_cases", "Dossiers attribués"],
  ["can_view_all_cases", "Tous les dossiers"],
  ["can_update_assigned_cases", "Modifier les dossiers attribués"],
  ["can_update_all_cases", "Modifier tous les dossiers"],
  ["can_message_assigned_clients", "Messagerie juridique"],
  ["can_manage_support", "Assistance du site"],
  ["can_view_users", "Annuaire des utilisateurs"],
  ["can_manage_roles", "Modifier les rôles"],
  ["can_manage_catalog", "Catalogue des prestations"],
  ["can_view_payments", "Paiements et chiffre d’affaires"],
  ["can_manage_settings", "Paramètres de la plateforme"],
  ["can_search_lawyers", "Annuaire des avocats"],
  ["can_manage_technical", "Administration technique"],
];

export default function UsersAndRolesPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [history, setHistory] = useState<RoleChange[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [currentRole, setCurrentRole] = useState<AppRole | null>(null);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | AppRole>("all");
  const [loading, setLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function loadRoleHistory() {
    const { data } = await supabase
      .from("user_role_changes")
      .select("id,user_id,previous_role,new_role,changed_by,changed_at")
      .order("changed_at", { ascending: false })
      .limit(20);
    setHistory((data as RoleChange[]) || []);
  }

  useEffect(() => {
    let mounted = true;

    async function loadPage() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/connexion?redirect=%2Fadministration%2Futilisateurs");
        return;
      }

      const { data: ownProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      const ownRole = isAppRole(ownProfile?.role) ? ownProfile.role : "client";
      if (!ROLE_MANAGER_ROLES.includes(ownRole)) {
        router.replace(ownRole === "juriste" || ownRole === "avocat" ? "/administration/mes-dossiers" : "/tableau-de-bord");
        return;
      }

      const [usersResult, permissionsResult, historyResult] = await Promise.all([
        supabase.rpc("list_users_with_roles"),
        supabase.from("role_permissions").select("*").order("role"),
        supabase.from("user_role_changes").select("id,user_id,previous_role,new_role,changed_by,changed_at").order("changed_at", { ascending: false }).limit(20),
      ]);

      if (!mounted) return;
      if (usersResult.error || permissionsResult.error) {
        setError("Les utilisateurs et leurs droits n’ont pas pu être chargés.");
      } else {
        const normalizedUsers = ((usersResult.data as UserRow[]) || []).map((item) => ({
          ...item,
          role: isAppRole(item.role) ? item.role : "client",
        }));
        setUsers(normalizedUsers);
        setPermissions((permissionsResult.data as RolePermission[]) || []);
        setHistory((historyResult.data as RoleChange[]) || []);
      }

      setCurrentUserId(user.id);
      setCurrentRole(ownRole);
      setLoading(false);
    }

    void loadPage();
    return () => { mounted = false; };
  }, [router, supabase]);

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return users.filter((user) => {
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const haystack = `${user.full_name || ""} ${user.email || ""} ${user.company_name || ""}`.toLowerCase();
      return matchesRole && (!normalized || haystack.includes(normalized));
    });
  }, [query, roleFilter, users]);

  const counts = useMemo(() => Object.fromEntries(APP_ROLES.map((role) => [role, users.filter((user) => user.role === role).length])) as Record<AppRole, number>, [users]);
  const usersById = useMemo(() => Object.fromEntries(users.map((user) => [user.id, user])), [users]);

  async function changeRole(user: UserRow, nextValue: string) {
    if (!isAppRole(nextValue) || nextValue === user.role || savingUserId) return;
    const confirmed = window.confirm(`Attribuer le rôle « ${ROLE_LABELS[nextValue]} » à ${user.full_name || user.email} ?`);
    if (!confirmed) return;

    setSavingUserId(user.id);
    setNotice("");
    setError("");

    const { error: roleError } = await supabase.rpc("set_user_role", {
      p_user_id: user.id,
      p_role: nextValue,
    });

    if (roleError) {
      setError(roleError.message || "Le rôle n’a pas pu être modifié.");
    } else {
      setUsers((current) => current.map((item) => item.id === user.id ? { ...item, role: nextValue } : item));
      setNotice(`${user.full_name || user.email} est maintenant ${ROLE_LABELS[nextValue].toLowerCase()}.`);
      await loadRoleHistory();
    }

    setSavingUserId("");
  }

  async function logout() {
    await supabase.auth.signOut({ scope: "local" });
    router.replace("/connexion");
  }

  if (loading) return <main className="admin-loading">Chargement des utilisateurs et des droits…</main>;

  return (
    <main className="admin-app roles-admin-page">
      <aside className="admin-sidebar">
        <Link href="/administration" className="admin-logo">LEXIA<span>.</span></Link>
        <div className="admin-badge">ADMINISTRATION</div>
        <nav>
          <Link href="/administration">◫ Vue d’ensemble</Link>
          <Link href="/administration/dossiers">▣ Dossiers</Link>
          <Link href="/administration/messages">✉ Messagerie</Link>
          <Link href="/administration/clients">♙ Clients</Link>
          <Link href="/administration/juristes">⚖ Juristes</Link>
          <Link className="active" href="/administration/utilisateurs">♟ Utilisateurs & rôles</Link>
          <Link href="/administration/prestations">€ Prestations</Link>
          <Link href="/administration/avocats">⌖ Avocats partenaires</Link>
          <Link href="/administration/parametres">⚙ Paramètres</Link>
        </nav>
        <button onClick={logout}>Se déconnecter</button>
      </aside>

      <section className="admin-main roles-main">
        <header className="roles-hero">
          <div>
            <small>CONTRÔLE DES ACCÈS</small>
            <h1>Utilisateurs & rôles</h1>
            <p>Chaque nouveau compte est créé avec le rôle Client. Les changements sont sécurisés et enregistrés dans l’historique.</p>
          </div>
          <div className="roles-current-access">
            <span>Votre accès</span>
            <strong className={`role-badge role-${currentRole || "client"}`}>{currentRole ? ROLE_LABELS[currentRole] : "Client"}</strong>
          </div>
        </header>

        {notice && <div className="roles-notice success">✓ {notice}</div>}
        {error && <div className="roles-notice error">! {error}</div>}

        <section className="roles-stats">
          {APP_ROLES.map((role) => (
            <article key={role}>
              <span className={`role-dot role-${role}`} />
              <div><small>{ROLE_LABELS[role]}</small><strong>{counts[role]}</strong></div>
            </article>
          ))}
        </section>

        <section className="roles-panel">
          <div className="roles-panel-head">
            <div><small>COMPTES INSCRITS</small><h2>Gérer les rôles</h2></div>
            <span>{filteredUsers.length} utilisateur{filteredUsers.length > 1 ? "s" : ""}</span>
          </div>

          <div className="roles-toolbar">
            <label><span>Rechercher</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nom, e-mail ou entreprise…" /></label>
            <label><span>Rôle</span><select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as "all" | AppRole)}><option value="all">Tous les rôles</option>{APP_ROLES.map((role) => <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}</select></label>
          </div>

          <div className="roles-users-list">
            {filteredUsers.length === 0 && <div className="roles-empty">Aucun utilisateur ne correspond à cette recherche.</div>}
            {filteredUsers.map((user) => (
              <article key={user.id} className="roles-user-row">
                <div className="roles-avatar">{(user.full_name || user.email || "U").slice(0, 1).toUpperCase()}</div>
                <div className="roles-user-identity">
                  <b>{user.full_name || user.company_name || "Utilisateur"}</b>
                  <span>{user.email}</span>
                  <small>Inscrit le {new Date(user.created_at).toLocaleDateString("fr-FR")} · {user.confirmed_at ? "E-mail confirmé" : "E-mail non confirmé"}</small>
                </div>
                <div className="roles-user-last-login">
                  <span>Dernière connexion</span>
                  <b>{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : "Jamais"}</b>
                </div>
                <label className={`roles-role-select role-${user.role}`}>
                  <span>Rôle</span>
                  <select
                    value={user.role}
                    disabled={savingUserId === user.id || user.id === currentUserId}
                    onChange={(event) => void changeRole(user, event.target.value)}
                    aria-label={`Rôle de ${user.full_name || user.email}`}
                  >
                    {APP_ROLES.map((role) => <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}
                  </select>
                  {user.id === currentUserId && <small>Compte actuel protégé</small>}
                </label>
              </article>
            ))}
          </div>
        </section>

        <section className="roles-panel permissions-panel">
          <div className="roles-panel-head"><div><small>MATRICE DE SÉCURITÉ</small><h2>Droits attribués à chaque rôle</h2></div></div>
          <div className="permissions-grid">
            {permissions
              .slice()
              .sort((a, b) => APP_ROLES.indexOf(a.role) - APP_ROLES.indexOf(b.role))
              .map((permission) => (
                <article key={permission.role} className={`permission-card role-card-${permission.role}`}>
                  <header><span className={`role-dot role-${permission.role}`} /><div><h3>{permission.label}</h3><p>{permission.description}</p></div></header>
                  <div>{permissionLabels.map(([key, label]) => <span key={String(key)} className={permission[key] ? "granted" : "denied"}><i>{permission[key] ? "✓" : "—"}</i>{label}</span>)}</div>
                </article>
              ))}
          </div>
        </section>

        <section className="roles-panel history-panel">
          <div className="roles-panel-head"><div><small>TRAÇABILITÉ</small><h2>Derniers changements de rôle</h2></div><span>{history.length}</span></div>
          <div className="roles-history">
            {history.length === 0 && <div className="roles-empty">Aucun changement de rôle enregistré.</div>}
            {history.map((change) => {
              const target = usersById[change.user_id];
              const actor = change.changed_by ? usersById[change.changed_by] : null;
              return <article key={change.id}><div><b>{target?.full_name || target?.email || "Utilisateur"}</b><span>{ROLE_LABELS[change.previous_role]} → {ROLE_LABELS[change.new_role]}</span></div><div><b>{new Date(change.changed_at).toLocaleString("fr-FR")}</b><small>Par {actor?.full_name || actor?.email || "système"}</small></div></article>;
            })}
          </div>
        </section>
      </section>
    </main>
  );
}
