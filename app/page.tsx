import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <header className="header">
        <div className="container nav">
          <Link href="/" className="logo">LEX<span>IA</span></Link>
          <nav className="navlinks">
            <Link href="#fonctionnement">Comment ça marche</Link>
            <Link href="#domaines">Domaines</Link>
            <Link href="#tarifs">Tarifs</Link>
          </nav>
          <div className="actions">
            <Link className="btn btn-outline" href="/connexion">Connexion</Link>
            <Link className="btn btn-primary" href="/inscription">Créer un compte</Link>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">Assistance juridique en ligne</span>
            <h1>Votre dossier.<br /><em>Notre expertise.</em></h1>
            <p className="lead">
              Expliquez votre situation, transmettez vos documents et échangez avec un professionnel depuis un espace sécurisé.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary" href="/nouveau-dossier">Déposer mon dossier</Link>
              <Link className="btn btn-outline" href="#fonctionnement">Découvrir le service</Link>
            </div>
            <div className="trust">
              <span>✓ Messagerie sécurisée</span>
              <span>✓ Documents protégés</span>
              <span>✓ Orientation vers un avocat</span>
            </div>
          </div>

          <aside className="hero-card" id="tarifs">
            <h3>Première analyse</h3>
            <p>Ouverture du dossier et premier échange avec un professionnel.</p>
            <div className="price">13 € <small>TTC — particuliers</small></div>
            <div className="feature-list">
              <div className="feature">Analyse des premières informations</div>
              <div className="feature">Dépôt sécurisé des documents</div>
              <div className="feature">Messagerie dédiée au dossier</div>
              <div className="feature">Prestations complémentaires uniquement avec accord</div>
            </div>
            <Link className="btn btn-gold" href="/inscription">Commencer maintenant</Link>
          </aside>
        </div>
      </section>

      <section className="section" id="fonctionnement">
        <div className="container">
          <h2>Une démarche simple</h2>
          <p className="section-intro">LEXIA centralise votre situation, vos pièces et vos échanges dans un seul espace.</p>
          <div className="grid-3">
            <article className="card"><h3>1. Déposez</h3><p>Choisissez le motif, expliquez les faits et ajoutez vos documents.</p></article>
            <article className="card"><h3>2. Échangez</h3><p>Discutez directement avec le professionnel chargé de votre dossier.</p></article>
            <article className="card"><h3>3. Avancez</h3><p>Recevez des solutions, une aide à la rédaction ou une orientation vers un avocat.</p></article>
          </div>
        </div>
      </section>

      <section className="section" id="domaines">
        <div className="container">
          <h2>Principaux domaines</h2>
          <div className="grid-3">
            <article className="card"><h3>Logement</h3><p>Bail, dépôt de garantie, travaux, impayés et voisinage.</p></article>
            <article className="card"><h3>Travail</h3><p>Contrat, salaire, sanction, rupture et relations employeur-salarié.</p></article>
            <article className="card"><h3>Consommation</h3><p>Achat, remboursement, assurance, banque et prestations contestées.</p></article>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-inner">
          <strong>LEXIA — Assistance juridique</strong>
          <span>Projet de démonstration — cadre juridique à valider avant lancement.</span>
        </div>
      </footer>
    </main>
  );
}
