import Link from "next/link";
import { signUp } from "@/app/auth/actions";

type Props = { searchParams?: { erreur?: string } };

export default function InscriptionPage({ searchParams }: Props) {
  return (
    <main className="auth-shell">
      <section className="auth-card wide">
        <Link className="auth-brand" href="/"><span>⚖</span> LEXIA</Link>
        <p className="eyebrow">CRÉATION DE COMPTE</p>
        <h1>Créez votre espace sécurisé.</h1>
        <p className="auth-intro">Déposez ensuite votre situation, vos documents et échangez avec notre équipe.</p>
        {searchParams?.erreur && <div className="alert error">{searchParams.erreur}</div>}
        <form action={signUp} className="auth-form">
          <fieldset className="account-choice">
            <legend>Type de compte</legend>
            <label><input type="radio" name="account_type" value="particulier" defaultChecked /> Particulier <small>Ouverture : 13 €</small></label>
            <label><input type="radio" name="account_type" value="professionnel" /> Professionnel <small>Ouverture : 29 €</small></label>
          </fieldset>
          <label>Nom et prénom<input name="full_name" required autoComplete="name" placeholder="Votre identité" /></label>
          <div className="form-grid">
            <label>Entreprise <span>(si professionnel)</span><input name="company_name" placeholder="Raison sociale" /></label>
            <label>SIRET <span>(si professionnel)</span><input name="siret" inputMode="numeric" placeholder="14 chiffres" /></label>
          </div>
          <label>Adresse e-mail<input name="email" type="email" required autoComplete="email" placeholder="vous@exemple.fr" /></label>
          <label>Mot de passe<input name="password" type="password" required minLength={8} autoComplete="new-password" placeholder="8 caractères minimum" /></label>
          <label className="check-line"><input type="checkbox" required /> J’accepte les conditions d’utilisation et la politique de confidentialité.</label>
          <button className="primary-button full" type="submit">Créer mon compte</button>
        </form>
        <p className="auth-footer">Déjà inscrit ? <Link href="/connexion">Se connecter</Link></p>
      </section>
      <aside className="auth-aside">
        <span className="gold-mark">ASSISTANCE HUMAINE</span>
        <h2>Expliquez votre situation. Nous vous aidons à avancer.</h2>
        <ul><li>Première analyse</li><li>Échanges par messagerie</li><li>Aide à la rédaction</li></ul>
      </aside>
    </main>
  );
}
