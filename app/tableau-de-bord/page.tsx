import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: profile } = await supabase.from("profiles").select("full_name, role, account_type, company_name").eq("id", user.id).single();
  if (profile?.role === "admin") redirect("/administration");

  return (
    <main className="portal-shell">
      <aside className="portal-sidebar">
        <Link className="portal-logo" href="/">⚖ LEXIA</Link>
        <nav><a className="active">Vue d’ensemble</a><a>Mes dossiers</a><a>Messages</a><a>Documents</a><a>Factures</a></nav>
        <form action={signOut}><button className="sidebar-logout">Se déconnecter</button></form>
      </aside>
      <section className="portal-content">
        <header className="portal-header"><div><p className="eyebrow">ESPACE CLIENT</p><h1>Bonjour {profile?.full_name?.split(" ")[0] ?? ""}</h1></div><Link className="primary-button" href="/nouveau-dossier">+ Nouveau dossier</Link></header>
        <div className="stats-grid"><article><span>Dossiers actifs</span><strong>0</strong></article><article><span>Messages non lus</span><strong>0</strong></article><article><span>Documents</span><strong>0</strong></article></div>
        <section className="empty-panel"><div className="empty-icon">⚖</div><h2>Aucun dossier pour le moment</h2><p>Décrivez votre situation et transmettez vos documents pour commencer votre accompagnement.</p><Link className="primary-button" href="/nouveau-dossier">Déposer mon premier dossier</Link></section>
      </section>
    </main>
  );
}
