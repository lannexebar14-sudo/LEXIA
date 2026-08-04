import Link from "next/link";
import { ArrowLeft, ArrowRight, Building2, Check, FileText, Scale, ShieldCheck, UserRound } from "lucide-react";

export default function NouveauDossierPage() {
  return (
    <main className="intake-page">
      <header className="simple-header">
        <div className="container simple-nav">
          <Link href="/" className="brand"><span className="brand-mark"><Scale size={21} /></span><span className="brand-name">LEX<span>IA</span></span></Link>
          <span className="secure-badge"><ShieldCheck size={16} /> Dépôt sécurisé</span>
        </div>
      </header>

      <div className="container intake-shell">
        <Link href="/" className="back-link"><ArrowLeft size={16} /> Retour à l’accueil</Link>

        <div className="intake-progress">
          <div className="intake-progress-top"><span>Étape 1 sur 5</span><strong>Votre profil</strong></div>
          <div className="intake-progress-bar"><span /></div>
        </div>

        <section className="intake-card">
          <div className="intake-heading">
            <span className="section-kicker">NOUVEAU DOSSIER</span>
            <h1>Vous déposez cette demande en tant que…</h1>
            <p>Votre profil détermine les informations demandées et le tarif de première analyse.</p>
          </div>

          <div className="profile-choice-grid">
            <article className="profile-choice selected">
              <span className="choice-check"><Check size={15} /></span>
              <span className="choice-icon"><UserRound size={30} /></span>
              <h2>Particulier</h2>
              <p>Pour une situation personnelle : logement, travail, consommation, assurance, famille…</p>
              <div className="choice-price"><strong>13 €</strong><span>Première analyse TTC</span></div>
            </article>

            <article className="profile-choice">
              <span className="choice-icon"><Building2 size={30} /></span>
              <h2>Professionnel</h2>
              <p>Pour une entreprise, un artisan, un commerçant, une association ou un indépendant.</p>
              <div className="choice-price"><strong>29 €</strong><span>Première analyse TTC</span></div>
              <small>SIRET demandé à l’étape suivante</small>
            </article>
          </div>

          <div className="intake-note"><FileText size={18} /><p>La partie adverse et ses coordonnées pourront être ajoutées plus tard, de manière entièrement facultative.</p></div>

          <div className="intake-actions">
            <Link href="/" className="btn btn-ghost">Annuler</Link>
            <Link href="/inscription" className="btn btn-primary btn-large">Continuer <ArrowRight size={18} /></Link>
          </div>
        </section>
      </div>
    </main>
  );
}
