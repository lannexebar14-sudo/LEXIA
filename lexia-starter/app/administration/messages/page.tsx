"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import AdminSupportInbox from "../[section]/AdminSupportInbox";
import "../admin.css";
import "../[section]/section.css";

export default function AdministrationMessagesPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.replace("/connexion");
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (profile?.role !== "admin") return router.replace("/tableau-de-bord");
      setLoading(false);
    }
    verifyAdmin();
  }, [router, supabase]);

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
          <Link href="/administration/dossiers">▣ Dossiers</Link>
          <Link className="active" href="/administration/messages">✉ Messagerie</Link>
          <Link href="/administration/clients">♙ Clients</Link>
          <Link href="/administration/juristes">⚖ Juristes</Link>
          <Link href="/administration/prestations">€ Prestations</Link>
          <Link href="/administration/avocats">⌖ Avocats partenaires</Link>
          <Link href="/administration/parametres">⚙ Paramètres</Link>
        </nav>
        <button onClick={logout}>Se déconnecter</button>
      </aside>

      <section className="admin-main">
        <header className="section-header">
          <div>
            <small>ASSISTANCE EN DIRECT</small>
            <h1>✉ Messagerie</h1>
            <p>Retrouvez ici tous les messages envoyés depuis la bulle d’assistance du site.</p>
          </div>
        </header>
        <AdminSupportInbox />
      </section>
    </main>
  );
}
