import Link from "next/link";
import HomeFaq from "./HomeFaq";
import "./home.css";
import "./home-menu.css";
import "./home-premium.css";
import "./home-faq.css";

const domains = [
  ["⌂", "Logement", "Bail, dépôt de garantie, travaux, expulsion et voisinage."],
  ["◇", "Travail", "Contrat, salaire, sanction, licenciement et rupture conventionnelle."],
  ["◎", "Consommation", "Achat, remboursement, abonnement, banque et assurance."],
  ["♙", "Famille", "Séparation, pension, autorité parentale et démarches amiables."],
  ["▦", "Entreprise", "Contrats, impayés, litiges commerciaux et relations fournisseurs."],
  ["⌖", "Administration", "Décision administrative, recours, contestation et formalités."],
];

export default function HomePage() {
  return <main className="public-site premium-home">
    <div className="announcement"><span><i>●</i> Assistance juridique en ligne</span><Link href="/impayes">Nouveau · LEXIA Impayés →</Link></div>

    <header className="public-header">
      <div className="public-container public-nav">
        <Link href="/" className="public-logo">LEXIA<span>.</span></Link>
        <nav className="public-links"><Link href="#fonctionnement">Fonctionnement</Link><Link href="#services">Services</Link><Link href="/impayes">Impayés</Link><Link href="/conseils-juridiques">Guides</Link><Link href="#tarifs">Tarifs</Link></nav>
        <div className="public-actions"><Link className="public-login" href="/connexion">Connexion</Link><Link className="public-button public-button-dark" href="/inscription">Créer mon espace</Link></div>
      </div>
      <nav className="mobile-service-menu" aria-label="Menu principal mobile"><div className="mobile-service-menu-inner"><Link href="/" className="active"><span>⌂</span>Accueil</Link><Link href="#services"><span>✦</span>Services</Link><Link href="/impayes"><span>€</span>Impayés</Link><Link href="/conseils-juridiques"><span>§</span>Guides</Link><Link href="#domaines"><span>◇</span>Domaines</Link><Link href="#tarifs"><span>◫</span>Tarifs</Link><Link href="#faq"><span>?</span>FAQ</Link><Link href="/connexion"><span>♙</span>Connexion</Link></div></nav>
    </header>

    <section className="public-hero">
      <div className="hero-glow hero-glow-a"/><div className="hero-glow hero-glow-b"/>
      <div className="public-container hero-layout">
        <div className="hero-copy">
          <div className="hero-label"><span>●</span> Spécialistes disponibles 24h/24 · 7j/7</div>
          <h1>Le droit, enfin <em>à portée de main.</em></h1>
          <p>Expliquez votre situation, transmettez vos documents et suivez votre dossier dans un espace sécurisé. LEXIA vous accompagne de la première analyse jusqu’aux démarches utiles.</p>
          <div className="hero-buttons"><Link className="public-button public-button-gold" href="/inscription">Déposer ma demande</Link><Link className="public-button public-button-light" href="/impayes">Recouvrer un impayé</Link></div>
          <div className="hero-proof"><div><strong>24/7</strong><span>Dépôt et suivi</span></div><div><strong>100 %</strong><span>En ligne</span></div><div><strong>Sécurisé</strong><span>Documents & échanges</span></div></div>
        </div>

        <div className="luxury-console" aria-label="Aperçu de l'espace LEXIA">
          <div className="luxury-console-top"><div><small>ESPACE CLIENT</small><strong>LEXIA<span>.</span></strong></div><span className="online-pill">● EN LIGNE</span></div>
          <div className="luxury-console-body">
            <div className="console-status"><small>DOSSIER EN COURS</small><strong>Votre situation est en analyse</strong><p>Les documents transmis sont centralisés dans votre espace.</p><div className="console-progress"><span/></div></div>
            <div className="console-grid"><article><span>01</span><b>Analyse</b><small>Situation étudiée</small></article><article><span>02</span><b>Échanges</b><small>Messagerie privée</small></article><article><span>03</span><b>Action</b><small>Courriers & démarches</small></article></div>
            <div className="console-message"><div>JL</div><p><b>Votre conseiller</b><span>Votre dossier a bien été pris en charge.</span></p><time>10:42</time></div>
          </div>
          <div className="console-float console-float-left">✓ Données protégées</div><div className="console-float console-float-right">Réponse personnalisée</div>
        </div>
      </div>
    </section>

    <section className="premium-services" id="services"><div className="public-container"><div className="premium-section-head"><span>NOS SERVICES</span><h2>Une plateforme pensée pour faire avancer votre dossier.</h2><p>Assistance juridique, résolution amiable et gestion des impayés réunies dans un même environnement.</p></div><div className="premium-service-grid">
      <article className="service-card service-card-main"><div className="service-icon">§</div><small>ASSISTANCE JURIDIQUE</small><h3>Déposez votre situation.</h3><p>Un espace sécurisé pour transmettre les faits, les pièces et suivre chaque étape de votre dossier.</p><Link href="/inscription">Ouvrir un dossier <span>→</span></Link></article>
      <article className="service-card"><div className="service-icon">€</div><small>LEXIA IMPAYÉS</small><h3>Agissez sur vos créances.</h3><p>Factures, loyers ou prestations impayées : constituez un dossier structuré pour engager une démarche amiable.</p><Link href="/impayes">Découvrir le service <span>→</span></Link></article>
      <article className="service-card"><div className="service-icon">✉</div><small>RÉSOLUTION AMIABLE</small><h3>Préparez les bons courriers.</h3><p>Relances, propositions, mises en demeure et correspondances centralisées dans votre dossier.</p><Link href="/inscription">Commencer <span>→</span></Link></article>
    </div></div></section>

    <section className="trust-strip" id="confiance"><div className="public-container trust-items"><div><span>01</span><p><strong>Accompagnement humain</strong>Un professionnel suit votre situation.</p></div><div><span>02</span><p><strong>Espace sécurisé</strong>Documents et échanges centralisés.</p></div><div><span>03</span><p><strong>Résolution amiable</strong>Des démarches structurées lorsque possible.</p></div><div><span>04</span><p><strong>Orientation adaptée</strong>Relais vers un professionnel si nécessaire.</p></div></div></section>

    <section className="public-section process-section" id="fonctionnement"><div className="public-container"><div className="section-heading centered"><span>UN PARCOURS SIMPLE</span><h2>Votre demande avance étape par étape.</h2><p>Pas de parcours compliqué : vous déposez, nous structurons, vous suivez.</p></div><div className="process-grid"><article><div className="process-number">01</div><div className="process-icon">✎</div><h3>Expliquez</h3><p>Décrivez les faits, les dates importantes et le résultat recherché.</p></article><article><div className="process-number">02</div><div className="process-icon">▤</div><h3>Documentez</h3><p>Ajoutez vos contrats, factures, courriers et justificatifs.</p></article><article><div className="process-number">03</div><div className="process-icon">✉</div><h3>Échangez</h3><p>Recevez les demandes complémentaires et les réponses dans votre messagerie.</p></article><article><div className="process-number">04</div><div className="process-icon">✓</div><h3>Agissez</h3><p>Suivez les démarches, courriers et prochaines étapes depuis votre espace.</p></article></div></div></section>

    <section className="public-section domains-section" id="domaines"><div className="public-container domains-layout"><div className="section-heading left"><span>DOMAINES D’INTERVENTION</span><h2>Une porte d’entrée pour vos principaux litiges.</h2><p>Particulier ou professionnel, choisissez le domaine qui correspond le mieux à votre situation.</p><Link href="/conseils-juridiques" className="text-link">Consulter les guides →</Link></div><div className="domain-grid">{domains.map(([icon,title,description])=><article key={title}><div>{icon}</div><h3>{title}</h3><p>{description}</p><span>En savoir plus →</span></article>)}</div></div></section>

    <section className="public-section pricing-section" id="tarifs"><div className="public-container"><div className="section-heading centered light-heading"><span>TARIFICATION CLAIRE</span><h2>Un coût annoncé avant de commencer.</h2><p>L’ouverture permet de créer votre espace, transmettre votre demande et commencer l’étude du dossier.</p></div><div className="pricing-grid"><article className="price-card"><div className="price-card-top"><span>PARTICULIER</span><div><strong>13 €</strong><small>TTC / dossier</small></div></div><p>Pour les litiges et démarches de la vie quotidienne.</p><ul><li>Espace sécurisé</li><li>Première analyse</li><li>Dépôt de documents</li><li>Messagerie du dossier</li></ul><Link href="/inscription" className="public-button public-button-gold">Commencer</Link></article><article className="price-card featured-price"><div className="popular-tag">PROFESSIONNELS</div><div className="price-card-top"><span>ENTREPRISE</span><div><strong>29 €</strong><small>TTC / dossier</small></div></div><p>Pour entreprises, indépendants et associations.</p><ul><li>Compte professionnel</li><li>Litiges commerciaux</li><li>Service Impayés</li><li>Facturation dédiée</li></ul><Link href="/impayes" className="public-button public-button-dark">Voir LEXIA Impayés</Link></article></div><p className="pricing-note">Toute prestation complémentaire est présentée avant validation et paiement.</p></div></section>

    <HomeFaq />

    <section className="public-section final-cta"><div className="public-container final-card"><div><span>VOTRE ESPACE JURIDIQUE</span><h2>Votre dossier peut commencer maintenant.</h2><p>Créez votre espace, transmettez les informations utiles et suivez l’avancement depuis votre téléphone ou votre ordinateur.</p></div><div className="final-actions"><Link href="/inscription" className="public-button public-button-gold">Créer mon dossier</Link><Link href="/connexion" className="final-login">J’ai déjà un compte →</Link></div></div></section>

    <footer className="public-footer"><div className="public-container footer-main"><div><Link href="/" className="footer-logo">LEXIA<span>.</span></Link><p>L’assistance juridique en ligne, simple, humaine et sécurisée.</p></div><div><b>Services</b><Link href="/impayes">LEXIA Impayés</Link><Link href="/conseils-juridiques">Guides juridiques</Link><Link href="#fonctionnement">Fonctionnement</Link><Link href="#faq">FAQ</Link></div><div><b>Mon espace</b><Link href="/inscription">Créer un compte</Link><Link href="/connexion">Se connecter</Link><Link href="/nouveau-dossier">Déposer un dossier</Link></div><div><b>Informations</b><Link href="/confidentialite">Confidentialité</Link><Link href="/conditions">Conditions générales</Link><Link href="/mentions-legales">Mentions légales</Link></div></div><div className="public-container footer-bottom"><span>© 2026 LEXIA. Tous droits réservés.</span></div></footer>
  </main>;
}
