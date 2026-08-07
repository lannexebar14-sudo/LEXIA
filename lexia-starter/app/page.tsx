import Link from "next/link";
import "./home.css";

const domains = [
  ["⌂", "Logement", "Bail, dépôt de garantie, travaux, expulsion et voisinage."],
  ["◇", "Travail", "Contrat, salaire, sanction, licenciement et rupture conventionnelle."],
  ["◎", "Consommation", "Achat, remboursement, abonnement, banque et assurance."],
  ["♙", "Famille", "Séparation, pension, autorité parentale et démarches amiables."],
  ["▦", "Entreprise", "Contrats, impayés, litiges commerciaux et relations fournisseurs."],
  ["⌖", "Administration", "Décision administrative, recours, contestation et formalités."],
];

export default function HomePage() {
  return (
    <main className="public-site">
      <div className="announcement">
        <span>Assistance juridique en ligne pour particuliers et professionnels</span>
        <Link href="/inscription">Ouvrir un dossier →</Link>
      </div>

      <header className="public-header">
        <div className="public-container public-nav">
          <Link href="/" className="public-logo">LEXIA<span>.</span></Link>
          <nav className="public-links" aria-label="Navigation principale">
            <Link href="#fonctionnement">Fonctionnement</Link>
            <Link href="#domaines">Domaines</Link>
            <Link href="#tarifs">Tarifs</Link>
            <Link href="#confiance">Pourquoi LEXIA</Link>
          </nav>
          <div className="public-actions">
            <Link className="public-login" href="/connexion">Se connecter</Link>
            <Link className="public-button public-button-dark" href="/inscription">Créer mon espace</Link>
          </div>
        </div>
      </header>

      <section className="public-hero">
        <div className="public-container hero-layout">
          <div className="hero-copy">
            <div className="hero-label"><span>●</span> Assistance humaine et confidentielle</div>
            <h1>Le juridique devient enfin <em>plus simple.</em></h1>
            <p>
              Décrivez votre situation, transmettez vos documents et échangez avec un professionnel depuis un espace sécurisé. LEXIA vous aide à comprendre, agir et rédiger les bonnes démarches.
            </p>
            <div className="hero-buttons">
              <Link className="public-button public-button-gold" href="/inscription">Déposer ma demande</Link>
              <Link className="public-button public-button-light" href="#fonctionnement">Voir comment ça marche</Link>
            </div>
            <div className="hero-proof">
              <div><strong>13 €</strong><span>Ouverture particulier</span></div>
              <div><strong>29 €</strong><span>Ouverture professionnel</span></div>
              <div><strong>100 %</strong><span>Espace confidentiel</span></div>
            </div>
          </div>

          <div className="product-preview" aria-label="Aperçu de l'espace LEXIA">
            <div className="preview-top">
              <div className="preview-brand">LEXIA<span>.</span></div>
              <div className="preview-user">VT</div>
            </div>
            <div className="preview-body">
              <aside className="preview-menu">
                <span className="selected">Vue d’ensemble</span>
                <span>Mes dossiers</span>
                <span>Messagerie</span>
                <span>Documents</span>
                <span>Paiements</span>
              </aside>
              <div className="preview-content">
                <small>ESPACE CLIENT</small>
                <h2>Bonjour Valentin</h2>
                <div className="preview-banner">
                  <div><span>DOSSIER EN COURS</span><strong>Litige avec mon propriétaire</strong><p>Votre conseiller vous a envoyé un nouveau message.</p></div>
                  <b>Ouvrir →</b>
                </div>
                <div className="preview-stats">
                  <article><span>Dossiers actifs</span><strong>1</strong></article>
                  <article><span>Messages</span><strong>2</strong></article>
                  <article><span>Documents</span><strong>6</strong></article>
                </div>
                <div className="preview-message">
                  <div className="advisor-avatar">JL</div>
                  <div><b>Votre conseiller</b><p>Bonjour, j’ai bien analysé les documents transmis…</p></div>
                  <time>10:42</time>
                </div>
              </div>
            </div>
            <div className="floating-security">✓ Données protégées</div>
            <div className="floating-response"><strong>Réponse personnalisée</strong><span>par un professionnel</span></div>
          </div>
        </div>
      </section>

      <section className="trust-strip" id="confiance">
        <div className="public-container trust-items">
          <div><span>01</span><p><strong>Accompagnement humain</strong>Des réponses adaptées à votre situation.</p></div>
          <div><span>02</span><p><strong>Documents centralisés</strong>Toutes vos pièces dans un espace unique.</p></div>
          <div><span>03</span><p><strong>Paiement transparent</strong>Aucun supplément sans votre accord.</p></div>
          <div><span>04</span><p><strong>Relais vers un avocat</strong>Orientation locale lorsque nécessaire.</p></div>
        </div>
      </section>

      <section className="founder-highlight" data-lexia-founder="true">
        <div className="public-container founder-card">
          <div className="founder-photo" role="img" aria-label="Valentin Thiery, créateur et fondateur de LEXIA" />
          <div className="founder-copy">
            <span>CRÉÉ ET FONDÉ PAR</span>
            <h2>Valentin Thiery</h2>
            <p>LEXIA est née d’un constat simple : rendre l’accès au droit plus rapide, plus humain et plus accessible.</p>
            <p>Développée avec des avocats, juristes, développeurs et spécialistes du numérique, la plateforme accompagne particuliers et professionnels partout en France.</p>
            <strong>Créateur et fondateur de LEXIA</strong>
          </div>
          <div className="founder-facts">
            <div><b>49 000+</b><span>avocats référencés</span></div>
            <div><b>24h/24</b><span>7 jours sur 7</span></div>
            <div><b>100 %</b><span>confidentiel</span></div>
          </div>
        </div>
      </section>

      <section className="public-section process-section" id="fonctionnement">
        <div className="public-container">
          <div className="section-heading centered">
            <span>UN PARCOURS SIMPLE</span>
            <h2>Votre demande prise en charge en quelques étapes.</h2>
            <p>LEXIA rassemble les informations, les documents et les échanges nécessaires pour faire avancer votre situation.</p>
          </div>
          <div className="process-grid">
            <article><div className="process-number">01</div><div className="process-icon">✎</div><h3>Expliquez la situation</h3><p>Choisissez le domaine concerné et décrivez les faits avec vos propres mots.</p></article>
            <article><div className="process-number">02</div><div className="process-icon">▤</div><h3>Ajoutez vos documents</h3><p>Contrats, courriers, photos et justificatifs sont déposés dans votre espace.</p></article>
            <article><div className="process-number">03</div><div className="process-icon">✉</div><h3>Échangez en privé</h3><p>Votre conseiller pose ses questions et vous accompagne via la messagerie sécurisée.</p></article>
            <article><div className="process-number">04</div><div className="process-icon">✓</div><h3>Passez à l’action</h3><p>Recevez une solution, une aide à la rédaction ou une orientation vers un avocat.</p></article>
          </div>
        </div>
      </section>

      <section className="public-section domains-section" id="domaines">
        <div className="public-container domains-layout">
          <div className="section-heading left">
            <span>DOMAINES D’INTERVENTION</span>
            <h2>Une première assistance pour les situations du quotidien.</h2>
            <p>Particulier ou professionnel, sélectionnez le motif correspondant à votre situation lors du dépôt.</p>
            <Link href="/inscription" className="text-link">Voir tous les domaines →</Link>
          </div>
          <div className="domain-grid">
            {domains.map(([icon, title, description]) => (
              <article key={title}><div>{icon}</div><h3>{title}</h3><p>{description}</p><span>En savoir plus →</span></article>
            ))}
          </div>
        </div>
      </section>

      <section className="public-section pricing-section" id="tarifs">
        <div className="public-container">
          <div className="section-heading centered light-heading">
            <span>TARIFICATION CLAIRE</span>
            <h2>Un coût connu dès le départ.</h2>
            <p>L’ouverture comprend le dépôt sécurisé, la première étude et l’accès à la messagerie du dossier.</p>
          </div>
          <div className="pricing-grid">
            <article className="price-card">
              <div className="price-card-top"><span>PARTICULIER</span><div><strong>13 €</strong><small>TTC / dossier</small></div></div>
              <p>Pour les litiges et démarches de la vie quotidienne.</p>
              <ul><li>Création de l’espace sécurisé</li><li>Première analyse de la situation</li><li>Dépôt des documents</li><li>Messagerie avec un conseiller</li></ul>
              <Link href="/inscription" className="public-button public-button-gold">Commencer en particulier</Link>
            </article>
            <article className="price-card featured-price">
              <div className="popular-tag">PROFESSIONNELS</div>
              <div className="price-card-top"><span>ENTREPRISE</span><div><strong>29 €</strong><small>TTC / dossier</small></div></div>
              <p>Pour les sociétés, indépendants et associations disposant d’un SIRET.</p>
              <ul><li>Compte professionnel dédié</li><li>Analyse d’un litige commercial</li><li>Facture au nom de l’entreprise</li><li>Prestations adaptées aux professionnels</li></ul>
              <Link href="/inscription" className="public-button public-button-light">Créer un compte professionnel</Link>
            </article>
          </div>
          <p className="pricing-note">Toute prestation complémentaire fait l’objet d’une proposition détaillée et doit être acceptée avant paiement.</p>
        </div>
      </section>

      <section className="public-section final-cta">
        <div className="public-container final-card">
          <div><span>VOTRE ESPACE JURIDIQUE</span><h2>Une situation vous préoccupe ? Commencez par nous l’expliquer.</h2><p>Créez votre compte, déposez les informations utiles et suivez votre dossier depuis votre téléphone ou votre ordinateur.</p></div>
          <div className="final-actions"><Link href="/inscription" className="public-button public-button-gold">Créer mon dossier</Link><Link href="/connexion" className="final-login">J’ai déjà un compte →</Link></div>
        </div>
      </section>

      <footer className="public-footer">
        <div className="public-container footer-main">
          <div><Link href="/" className="footer-logo">LEXIA<span>.</span></Link><p>L’assistance juridique en ligne, simple, humaine et sécurisée.</p></div>
          <div><b>Service</b><Link href="#fonctionnement">Fonctionnement</Link><Link href="#domaines">Domaines</Link><Link href="#tarifs">Tarifs</Link></div>
          <div><b>Mon espace</b><Link href="/inscription">Créer un compte</Link><Link href="/connexion">Se connecter</Link><Link href="/nouveau-dossier">Déposer un dossier</Link></div>
          <div><b>Informations</b><Link href="/confidentialite">Confidentialité</Link><Link href="/conditions">Conditions générales</Link><Link href="/mentions-legales">Mentions légales</Link></div>
        </div>
        <div className="public-container footer-bottom"><span>© 2026 LEXIA. Tous droits réservés.</span></div>
      </footer>
    </main>
  );
}
