"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import AdminEmailComposer from "./AdminEmailComposer";
import ResendTestSetup from "./ResendTestSetup";
import "../admin.css";
import "../admin-console.css";
import "../../mobile-app.css";
import "./emails.css";
import "./resend-test.css";

type AccessContext = { role?: string | null };

export default function AdministrationEmailsPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let active = true;

    async function verifyAdminInBackground() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;
      if (!session?.user) {
        router.replace("/connexion?redirect=%2Fadministration%2Femails");
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

  return (
    <main className="admin-app">
      <aside className="admin-sidebar">
        <Link href="/administration" className="admin-logo">LEXIA<span>.</span></Link>
        <div className="admin-badge">ADMINISTRATION</div>
        <nav>
          <Link href="/administration">◫ Vue d’ensemble</Link>
          <Link href="/administration/dossiers">▣ Dossiers</Link>
          <Link href="/administration/messages">✉ Messagerie</Link>
          <Link href="/administration/clients">♙ Clients</Link>
          <Link href="/administration/juristes">⚖ Juristes</Link>
          <Link href="/administration/prestations">€ Prestations</Link>
          <Link href="/administration/avocats">⌖ Avocats partenaires</Link>
          <Link className="active" href="/administration/emails">＠ E-mails</Link>
          <Link href="/administration/parametres">⚙ Paramètres</Link>
        </nav>
        <button onClick={logout}>Se déconnecter</button>
      </aside>

      <section className="admin-main email-studio-page">
        <div className="email-console-shell">
          <header className="email-brand-banner">
            <div className="email-brand-wordmark">LEXIA<span>.</span></div>
            <div className="email-brand-signature">
              <b>ASSISTANCE JURIDIQUE</b>
              <span>CONFIDENTIELLE<br />ET SÉCURISÉE</span>
            </div>
            <div className="email-brand-lock" aria-hidden="true">♙</div>
          </header>

          <section className="email-dns-card test-mode">
            <div className="email-dns-icon" aria-hidden="true">✓</div>
            <div>
              <small>CONFIGURATION D’ENVOI</small>
              <b>Mode test Resend</b>
              <p>Envoi temporaire sans utiliser lexiafrance.fr, depuis onboarding@resend.dev.</p>
            </div>
            <span>TEMPORAIRE</span>
          </section>

          <ResendTestSetup />
          <AdminEmailComposer />
        </div>
      </section>
    </main>
  );
}
