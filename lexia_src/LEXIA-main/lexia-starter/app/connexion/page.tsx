import Link from "next/link";
import { redirect } from "next/navigation";
import { signIn } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";

type Props = { searchParams?: { erreur?: string; message?: string } };

export default async function ConnexionPage({ searchParams }: Props) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    redirect(profile?.role === "admin" ? "/administration" : "/tableau-de-bord");
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <Link className="auth-brand" href="/"><span>⚖</span> LEXIA</Link>
        <p className="eyebrow">ESPACE SÉCURISÉ</p>
        <h1>Heureux de vous revoir.</h1>
        <p className="auth-intro">Connectez-vous pour suivre vos dossiers et échanger avec votre conseiller.</p>
        {searchParams?.erreur && <div className="alert error">{searchParams.erreur}</div>}
        {searchParams?.message && <div className="alert success">{searchParams.message}</div>}
        <form action={signIn} className="auth-form">
          <label>Adresse e-mail<input name="email" type="email" required autoComplete="email" placeholder="vous@exemple.fr" /></label>
          <label>Mot de passe<input name="password" type="password" required autoComplete="current-password" placeholder="Votre mot de passe" /></label>
          <button className="primary-button full" type="submit">Se connecter</button>
        </form>
        <p className="auth-footer">Pas encore de compte ? <Link href="/inscription">Créer mon espace</Link></p>
      </section>
      <aside className="auth-aside">
        <span className="gold-mark">LEXIA</span>
        <h2>Votre dossier juridique, accessible simplement.</h2>
        <ul><li>Messagerie privée</li><li>Documents sécurisés</li><li>Suivi en temps réel</li></ul>
      </aside>
    </main>
  );
}
