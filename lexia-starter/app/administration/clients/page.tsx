"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import "../admin.css";
import "./clients-fast.css";

type UserRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: string | null;
  account_type: string | null;
  company_name: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  confirmed_at: string | null;
};

type AccessContext = { role?: string | null };

function withTimeout<T>(task: PromiseLike<T>, delay = 2600): Promise<T | null> {
  return Promise.race([
    Promise.resolve(task),
    new Promise<null>((resolve) => window.setTimeout(() => resolve(null), delay)),
  ]);
}

export default function AdministrationClientsPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [query, setQuery] = useState("");
  const [syncing, setSyncing] = useState(true);
  const [warning, setWarning] = useState("");
  const [notice, setNotice] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadClients() {
      const sessionResult = await withTimeout(supabase.auth.getSession(), 1400);
      if (!active) return;
      const session = sessionResult?.data.session;

      if (!session?.user) {
        router.replace("/connexion?redirect=%2Fadministration%2Fclients");
        return;
      }

      const accessResult = await withTimeout(supabase.rpc("get_my_access_context").maybeSingle(), 1800);
      if (!active) return;
      const context = accessResult?.data as AccessContext | null | undefined;

      if (accessResult && !accessResult.error && context?.role !== "admin") {
        router.replace("/tableau-de-bord");
        return;
      }

      const usersResult = await withTimeout(supabase.rpc("list_users_with_roles"), 2800);
      if (!active) return;

      if (!usersResult || usersResult.error) {
        setWarning("Les comptes clients n’ont pas encore pu être synchronisés.");
        setSyncing(false);
        return;
      }

      setUsers(((usersResult.data as UserRow[]) || []).filter((user) => !user.role || user.role === "client"));
      setSyncing(false);
    }

    void loadClients();
    return () => { active = false; };
  }, [router, supabase]);

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return users.filter((user) => {
      const haystack = `${user.full_name || ""} ${user.email || ""} ${user.company_name || ""}`.toLowerCase();
      return !normalized || haystack.includes(normalized);
    });
  }, [query, users]);

  const professionals = users.filter((user) => user.account_type === "professionnel").length;
  const confirmed = users.filter((user) => Boolean(user.confirmed_at)).length;

  async function deleteClient(user: UserRow) {
    if (deletingId) return;
    const clientName = user.full_name || user.company_name || user.email;
    const confirmed = window.confirm(
      `Supprimer définitivement le compte de ${clientName} (${user.email}) ?\n\nLe client sera déconnecté, devra créer un nouveau compte pour revenir sur LEXIA et recevra automatiquement un e-mail l’informant de la suppression.`,
    );
    if (!confirmed) return;

    const secondConfirmation = window.prompt(`Pour confirmer la suppression définitive, saisissez exactement : SUPPRIMER`);
    if (secondConfirmation !== "SUPPRIMER") {
      setWarning("Suppression annulée : la confirmation n’a pas été saisie correctement.");
      return;
    }

    setDeletingId(user.id);
    setWarning("");
    setNotice("");

    const { data, error } = await supabase.functions.invoke("admin-delete-client", {
      body: { userId: user.id },
    });

    if (error || !data?.success) {
      setWarning(data?.error || "La suppression du compte n’a pas pu être effectuée.");
      setDeletingId(null);
      return;
    }

    setUsers((current) => current.filter((item) => item.id !== user.id));
    setNotice(data.message || `Le compte ${user.email} a été supprimé et le client a été informé par e-mail.`);
    setDeletingId(null);
  }

  async function logout() {
    await supabase.auth.signOut({ scope: "local" });
    router.replace("/connexion");
  }

  return (
    <main className="admin-app clients-fast-page">
      <aside className="admin-sidebar">
        <Link href="/administration" className="admin-logo">LEXIA<span>.</span></Link>
        <div className="admin-badge">ADMINISTRATION</div>
        <nav>
          <Link href="/administration">◫ Vue d’ensemble</Link>
          <Link href="/administration/dossiers">▣ Dossiers</Link>
          <Link href="/administration/messages">✉ Messagerie</Link>
          <Link className="active" href="/administration/clients">♙ Clients</Link>
          <Link href="/administration/juristes">⚖ Juristes</Link>
          <Link href="/administration/prestations">€ Prestations</Link>
          <Link href="/administration/avocats">⌖ Avocats partenaires</Link>
          <Link href="/administration/emails">＠ E-mails</Link>
          <Link href="/administration/parametres">⚙ Paramètres</Link>
        </nav>
        <button onClick={logout}>Se déconnecter</button>
      </aside>

      <section className="admin-main clients-fast-main">
        <header className="clients-fast-hero">
          <div>
            <small>UTILISATEURS INSCRITS</small>
            <h1>Clients</h1>
            <p>Consultez immédiatement les particuliers et professionnels inscrits sur Lexia.</p>
          </div>
          <Link href="/administration/utilisateurs">Gérer les rôles</Link>
        </header>

        <div className="clients-fast-stats">
          <article><span>Clients</span><strong>{users.length}</strong><small>{syncing ? "Synchronisation…" : "Comptes inscrits"}</small></article>
          <article><span>Professionnels</span><strong>{professionals}</strong><small>Comptes entreprise</small></article>
          <article><span>Confirmés</span><strong>{confirmed}</strong><small>Adresse e-mail vérifiée</small></article>
        </div>

        <section className="clients-fast-card">
          <div className="clients-fast-toolbar">
            <div><small>ANNUAIRE CLIENTS</small><h2>Liste des comptes</h2></div>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un nom ou un e-mail…" />
          </div>

          {warning && <div className="clients-fast-warning">{warning}</div>}
          {notice && <div className="clients-fast-success">{notice}</div>}

          <div className="clients-fast-list">
            {syncing && users.length === 0 && <div className="clients-fast-empty">Synchronisation des comptes en arrière-plan…</div>}
            {!syncing && filteredUsers.length === 0 && <div className="clients-fast-empty">Aucun client correspondant.</div>}
            {filteredUsers.map((user) => (
              <article key={user.id}>
                <span className="clients-fast-avatar">{(user.full_name || user.email || "C").trim().charAt(0).toUpperCase()}</span>
                <div>
                  <strong>{user.full_name || user.company_name || "Client Lexia"}</strong>
                  <small>{user.email}</small>
                </div>
                <div className="clients-fast-meta">
                  <b>{user.account_type === "professionnel" ? "Professionnel" : "Particulier"}</b>
                  <small>Inscrit le {new Date(user.created_at).toLocaleDateString("fr-FR")}</small>
                </div>
                <span className={user.confirmed_at ? "clients-fast-confirmed" : "clients-fast-pending"}>
                  {user.confirmed_at ? "Confirmé" : "À confirmer"}
                </span>
                <button
                  type="button"
                  className="clients-fast-delete"
                  disabled={deletingId === user.id}
                  onClick={() => deleteClient(user)}
                  title="Supprimer définitivement ce compte client"
                >
                  {deletingId === user.id ? "Suppression…" : "Supprimer le compte"}
                </button>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
