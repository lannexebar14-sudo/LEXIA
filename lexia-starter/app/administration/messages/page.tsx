"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import AdminSupportInbox from "../[section]/AdminSupportInbox";
import AdminCaseInbox from "./AdminCaseInbox";
import "../admin.css";
import "../[section]/section.css";

export default function AdministrationMessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"dossiers" | "support">(searchParams.get("support") === "1" ? "support" : "dossiers");

  useEffect(() => {
    async function verifyAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.replace("/connexion");
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (profile?.role !== "admin") return router.replace("/tableau-de-bord");
      setLoading(false);
    }
    void verifyAdmin();
  }, [router, supabase]);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/connexion");
  }

  function changeTab(nextTab: "dossiers" | "support") {
    setTab(nextTab);
    router.replace(nextTab === "support" ? "/administration/messages?support=1" : "/administration/messages", { scroll: false });
  }

  if (loading) return <main className="admin-loading">Vérification de vos accès…</main>;

  return (
    <main className="admin-app">
      <aside className="admin-sidebar">
        <Link href="/administration" className="admin-logo">LEXIA<span>.</span></Link>
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
            <small>ÉCHANGES CENTRALISÉS</small>
            <h1>✉ Messagerie</h1>
            <p>Répondez aux clients dans leur dossier ou traitez les demandes envoyées depuis la bulle d’assistance.</p>
          </div>
        </header>

        <div className="section-tabs" role="tablist" aria-label="Type de messagerie">
          <button type="button" className={tab === "dossiers" ? "active" : ""} onClick={() => changeTab("dossiers")}>Dossiers clients</button>
          <button type="button" className={tab === "support" ? "active" : ""} onClick={() => changeTab("support")}>Assistance du site</button>
        </div>

        {tab === "dossiers" ? <AdminCaseInbox /> : <AdminSupportInbox />}
      </section>
    </main>
  );
}
