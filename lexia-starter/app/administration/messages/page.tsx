"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import AdminSupportInbox from "../[section]/AdminSupportInbox";
import AdminCaseInbox from "./AdminCaseInbox";
import "../admin.css";
import "../[section]/section.css";
import "./messaging-tabs.css";

type AccessContext = { role?: string | null };

export default function AdministrationMessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const [tab, setTab] = useState<"dossiers" | "support">(searchParams.get("support") === "1" ? "support" : "dossiers");

  useEffect(() => {
    let active = true;

    async function verifyAdminInBackground() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;
      if (!session?.user) {
        router.replace("/connexion?redirect=%2Fadministration%2Fmessages");
        return;
      }

      const { data, error } = await supabase.rpc("get_my_access_context").maybeSingle();
      if (!active || error) return;
      const context = data as AccessContext | null;
      if (context?.role !== "admin") router.replace("/tableau-de-bord");
    }

    void verifyAdminInBackground();
    return () => { active = false; };
  }, [router, supabase]);

  async function logout() {
    await supabase.auth.signOut({ scope: "local" });
    router.replace("/connexion");
  }

  function changeTab(nextTab: "dossiers" | "support") {
    setTab(nextTab);
    router.replace(nextTab === "support" ? "/administration/messages?support=1" : "/administration/messages", { scroll: false });
  }

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
          <Link href="/administration/emails">＠ E-mails</Link>
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
