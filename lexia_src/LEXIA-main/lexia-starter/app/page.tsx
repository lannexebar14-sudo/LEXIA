import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Check,
  FileText,
  Gavel,
  Home,
  LockKeyhole,
  MessageSquareText,
  Scale,
  ShieldCheck,
  UserRound,
} from "lucide-react";

const domains = [
  { icon: Home, title: "Logement", text: "Bail, dépôt de garantie, travaux, voisinage et impayés." },
  { icon: BriefcaseBusiness, title: "Travail", text: "Contrat, salaire, sanction, rupture et relations professionnelles." },
  { icon: Building2, title: "Professionnels", text: "Factures, contrats, clients, fournisseurs et litiges commerciaux." },
  { icon: ShieldCheck, title: "Assurance", text: "Refus de prise en charge, indemnisation et résiliation." },
  { icon: FileText, title: "Consommation", text: "Achat, remboursement, prestation contestée et abonnement." },
  { icon: Gavel, title: "Autres demandes", text: "Administration, famille, banque, automobile et situations diverses." },
];

export default function HomePage() {
  return (
    <main>
      <header className="header">
        <div className="container nav">
          <Link href="/" className="brand" aria-label="LEXIA accueil">
            <span className="brand-mark"><Scale size={21} strokeWidth={1.8} /></span>
            <span className="brand-name">LEX<span>IA</span></span>
          </Link>

          <nav className="navlinks" aria-label="Navigation principale">
            <Link href="#fonctionnement">Comment ça marche</Link>
            <Link href="#domaines">Domaines</Link>
            <Link href="#tarifs">Tarifs</Link>
            <Link href="#confiance">Pourquoi LEXIA</Link>
          </nav>

          <div className="actions">
            <Link className="btn btn-ghost" href="/connexion">Connexion</Link>
            <Link className="btn btn-primary btn-compact" href="/inscription">Créer un compte</Link>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow"><ShieldCheck size={15} /> Assistance juridique humaine et sécurisée</span>
            <h1>Votre situation mérite une réponse <em>claire.</em></h1>
            <p className="lead">
              Décrivez votre problème, transmettez vos documents et échangez directement avec un professionnel dans un espace privé.
            </p>

            <div className="hero-actions">
              <Link className="btn btn-primary btn-large" href="/nouveau-dossier">
                Déposer mon dossier <ArrowRight size={18} />
              </Link>
              <Link className="btn btn-outline btn-large" href="#fonctionnement">Découvrir le service</Link>
            </div>

            <div className="trust-row">
              <span><Check size={16} /> Paiement unique dès 13 €</span>
              <span><Check size={16} /> Sans abonnement</span>
              <span><Check size={16} /> Orientation vers un avocat</span>
            </div>
          </div>

          <aside className="case-preview" aria-label="Aperçu d'un dossier LEXIA">
            <div className="preview-top">
              <div>
                <span className="preview-label">DOSSIER LX-2026-00128</span>
                <h2>Litige avec mon propriétaire</h2>
              </div>
              <span className="status-pill">Analyse en cours</span>
            </div>

            <div className="progress-wrap">
              <div className="progress-label"><span>Complétude du dossier</span><strong>82 %</strong></div>
              <div className="progress"><span /></div>
            </div>

            <div className="message-card professional">
              <div className="avatar">LM</div>
              <div>
                <strong>Votre conseiller LEXIA</strong>
                <p>Bonjour, j’ai bien reçu votre bail et les photos. Pouvez-vous ajouter l’état des lieux de sortie ?</p>
                <small>Il y a 12 minutes</small>
              </div>
            </div>

            <div className="document-row">
              <div className="document-icon"><FileText size={20} /></div>
              <div><strong>Bail_location.pdf</strong><span>Document sécurisé · 2,4 Mo</span></div>
              <span className="document-ok"><Check size={16} /></span>
            </div>

            <div className="preview-bottom">
              <span><LockKeyhole size={15} /> Espace confidentiel</span>
              <Link href="/tableau-de-bord">Voir le tableau de bord <ArrowRight size={15} /></Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="stats-strip" id="confiance">
        <div className="container stats-grid">
          <div><strong>100 %</strong><span>en ligne et sécurisé</span></div>
          <div><strong>1 espace</strong><span>pour vos messages et documents</span></div>
          <div><strong>2 profils</strong><span>particuliers et professionnels</span></div>
          <div><strong>0 surprise</strong><span>aucun paiement sans votre accord</span></div>
        </div>
      </section>

      <section className="section light-section" id="fonctionnement">
        <div className="container">
          <div className="section-heading centered">
            <span className="section-kicker">COMMENT ÇA MARCHE ?</span>
            <h2>Une assistance simple, étape par étape</h2>
            <p>LEXIA centralise les faits, les pièces et les échanges afin que votre demande soit suivie clairement.</p>
          </div>

          <div className="steps-grid">
            <article className="step-card"><span className="step-number">01</span><UserRound /><h3>Créez votre compte</h3><p>Choisissez un profil particulier ou professionnel avec SIRET.</p></article>
            <article className="step-card"><span className="step-number">02</span><FileText /><h3>Déposez votre situation</h3><p>Expliquez les faits, vos objectifs et ajoutez vos documents.</p></article>
            <article className="step-card"><span className="step-number">03</span><MessageSquareText /><h3>Échangez par message</h3><p>Un professionnel analyse le dossier et vous répond dans l’espace privé.</p></article>
            <article className="step-card"><span className="step-number">04</span><Scale /><h3>Recevez une solution</h3><p>Conseils, aide à la rédaction ou orientation vers un avocat proche.</p></article>
          </div>
        </div>
      </section>

      <section className="section" id="domaines">
        <div className="container">
          <div className="section-heading split-heading">
            <div><span className="section-kicker">DOMAINES D’INTERVENTION</span><h2>Une aide adaptée à votre situation</h2></div>
            <p>Le formulaire s’adapte au motif choisi pour recueillir uniquement les informations utiles.</p>
          </div>
          <div className="domains-grid">
            {domains.map(({ icon: Icon, title, text }) => (
              <article className="domain-card" key={title}>
                <span className="domain-icon"><Icon size={23} /></span>
                <h3>{title}</h3><p>{text}</p><Link href="/nouveau-dossier">Déposer une demande <ArrowRight size={15} /></Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section pricing-section" id="tarifs">
        <div className="container pricing-grid">
          <div className="pricing-copy">
            <span className="section-kicker">UNE TARIFICATION TRANSPARENTE</span>
            <h2>Vous savez ce que vous payez avant de commencer.</h2>
            <p>Le premier paiement ouvre le dossier et permet sa première analyse. Toute prestation complémentaire vous est proposée dans la messagerie et nécessite votre accord explicite.</p>
            <div className="secure-line"><LockKeyhole size={18} /> Aucun prélèvement automatique supplémentaire</div>
          </div>

          <div className="price-cards">
            <article className="price-card featured">
              <div className="price-card-top"><span className="profile-icon"><UserRound /></span><span className="popular">PARTICULIER</span></div>
              <h3>Première analyse</h3><div className="big-price">13 € <small>TTC</small></div>
              <ul><li><Check /> Ouverture du dossier</li><li><Check /> Dépôt des documents</li><li><Check /> Première analyse humaine</li><li><Check /> Messagerie sécurisée</li></ul>
              <Link className="btn btn-primary" href="/nouveau-dossier?profil=particulier">Commencer</Link>
            </article>

            <article className="price-card">
              <div className="price-card-top"><span className="profile-icon"><Building2 /></span><span className="professional-label">PROFESSIONNEL</span></div>
              <h3>Analyse professionnelle</h3><div className="big-price">29 € <small>TTC</small></div>
              <ul><li><Check /> Vérification du SIRET</li><li><Check /> Dépôt des pièces commerciales</li><li><Check /> Analyse adaptée aux entreprises</li><li><Check /> Facture professionnelle</li></ul>
              <Link className="btn btn-outline" href="/nouveau-dossier?profil=professionnel">Déposer un dossier pro</Link>
            </article>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container cta-inner">
          <div><span className="section-kicker gold-kicker">VOTRE ESPACE LEXIA</span><h2>Ne restez pas seul face à votre dossier.</h2><p>Centralisez votre situation et commencez vos échanges dans un espace conçu pour vous guider.</p></div>
          <Link className="btn btn-gold btn-large" href="/nouveau-dossier">Déposer ma demande <ArrowRight size={18} /></Link>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-main">
          <div><Link href="/" className="brand footer-brand"><span className="brand-mark"><Scale size={21} /></span><span className="brand-name">LEX<span>IA</span></span></Link><p>L’assistance juridique en ligne, humaine et accessible.</p></div>
          <div><strong>LEXIA</strong><Link href="#fonctionnement">Fonctionnement</Link><Link href="#domaines">Domaines</Link><Link href="#tarifs">Tarifs</Link></div>
          <div><strong>Accès</strong><Link href="/connexion">Connexion</Link><Link href="/inscription">Créer un compte</Link><Link href="/nouveau-dossier">Nouveau dossier</Link></div>
          <div><strong>Informations</strong><span>Mentions légales</span><span>Confidentialité</span><span>Conditions générales</span></div>
        </div>
        <div className="container footer-bottom"><span>© 2026 LEXIA</span><span>Version de développement — cadre juridique à finaliser avant commercialisation.</span></div>
      </footer>
    </main>
  );
}
