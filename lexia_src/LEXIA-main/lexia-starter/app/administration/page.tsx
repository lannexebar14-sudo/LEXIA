import { redirect } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";

export default async function AdministrationPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");
  const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/tableau-de-bord");

  return (
    <main className="portal-shell admin-theme">
      <aside className="portal-sidebar">
        <a className="portal-logo" href="/administration">⚖ LEXIA <small>ADMIN</small></a>
        <nav><a className="active">Tableau de bord</a><a>Nouveaux dossiers</a><a>Clients</a><a>Messagerie</a><a>Prestations</a><a>Paiements</a><a>Juristes</a><a>Avocats</a></nav>
        <form action={signOut}><button className="sidebar-logout">Se déconnecter</button></form>
      </aside>
      <section className="portal-content">
        <header className="portal-header"><div><p className="eyebrow">ADMINISTRATION LEXIA</p><h1>Bonjour {profile?.full_name?.split(" ")[0] ?? "Administrateur"}</h1></div><div className="admin-badge">Accès administrateur</div></header>
        <div className="stats-grid admin-stats"><article><span>Nouveaux dossiers</span><strong>0</strong><small>À attribuer</small></article><article><span>Messages en attente</span><strong>0</strong><small>À traiter</small></article><article><span>Prestations proposées</span><strong>0 €</strong><small>Ce mois-ci</small></article><article><span>Chiffre d’affaires</span><strong>0 €</strong><small>Ce mois-ci</small></article></div>
        <section className="admin-grid"><article className="admin-panel"><div className="panel-title"><h2>Dossiers récents</h2><button>Voir tout</button></div><div className="empty-row">Aucun dossier reçu pour le moment.</div></article><article className="admin-panel"><div className="panel-title"><h2>Actions rapides</h2></div><div className="quick-actions"><button>Créer un dossier</button><button>Ajouter un juriste</button><button>Ajouter un avocat</button><button>Créer une prestation</button></div></article></section>
      </section>
    </main>
  );
}
