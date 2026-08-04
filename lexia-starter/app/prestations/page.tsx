import Link from "next/link";
import { accountOpeningPrices, prestations, urgencySupplements } from "@/lib/prestations";
import "../home.css";
import "./prestations.css";

const openingOffers = [
  {
    title: "Particulier",
    price: accountOpeningPrices.particulier,
    description: "Pour les litiges et démarches de la vie quotidienne.",
    features: ["Création du dossier sécurisé", "Première lecture de la situation", "Dépôt des documents", "Accès à la messagerie"],
  },
  {
    title: "Professionnel",
    price: accountOpeningPrices.professionnel,
    description: "Pour les entreprises, indépendants et associations disposant d’un SIRET.",
    features: ["Espace professionnel", "Première lecture du litige", "Dépôt des documents", "Facture au nom de la structure"],
  },
];

export default function PrestationsPage() {
  return (
    <main className="public-site services-page">
      <div className="announcement">
        <span>Des tarifs connus avant chaque validation</span>
        <Link href="/inscription">Ouvrir un dossier →</Link>
      </div>

      <header className="public-header">
        <div className="public-container public-nav">
          <Link href="/" className="public-logo">LEXIA<span>.</span></Link>
          <nav className="public-links" aria-label="Navigation principale">
            <Link href="/#fonctionnement">Fonctionnement</Link>
            <Link href="/#domaines">Domaines</Link>
            <Link href="/prestations">Prestations & tarifs</Link>
            <Link href="/#confiance">Pourquoi LEXIA</Link>
          </nav>
          <div className="public-actions">
            <Link className="public-login" href="/connexion">Se connecter</Link>
            <Link className="public-button public-button-dark" href="/inscription">Créer mon espace</Link>
          </div>
        </div>
      </header>

      <section className="services-hero">
        <div className="public-container services-hero-layout">
          <div>
            <span className="services-kicker">PRESTATIONS & TARIFS</span>
            <h1>Une aide adaptée, avec un prix clair avant de commencer.</h1>
            <p>L’ouverture du dossier permet de présenter la situation et de centraliser les documents. Les prestations complémentaires sont facultatives et ne sont ajoutées qu’avec votre accord.</p>
            <div className="hero-buttons">
              <Link className="public-button public-button-gold" href="/inscription">Déposer ma demande</Link>
              <Link className="public-button public-button-light" href="#prestations">Voir les prestations</Link>
            </div>
          </div>
          <aside className="services-summary-card">
            <small>À RETENIR</small>
            <strong>13 €</strong>
            <span>pour ouvrir un dossier particulier</span>
            <div><b>0 €</b><p>Aucun supplément sans validation préalable.</p></div>
            <div><b>✓</b><p>Le détail de la prestation apparaît avant le paiement.</p></div>
          </aside>
        </div>
      </section>

      <section className="services-section opening-section">
        <div className="public-container">
          <div className="section-heading centered">
            <span>OUVERTURE DU DOSSIER</span>
            <h2>Le point de départ de votre accompagnement.</h2>
            <p>L’ouverture comprend la création de l’espace, le dépôt des pièces, une première lecture et l’accès aux échanges liés au dossier.</p>
          </div>
          <div className="opening-grid">
            {openingOffers.map((offer) => (
              <article key={offer.title}>
                <div className="opening-card-head"><span>{offer.title.toUpperCase()}</span><strong>{offer.price} € <small>TTC</small></strong></div>
                <p>{offer.description}</p>
                <ul>{offer.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
              </article>
            ))}
          </div>
          <div className="urgency-strip">
            <div><b>Traitement normal</b><span>Inclus</span></div>
            <div><b>Priorité souhaitée</b><span>+ {urgencySupplements.rapide} €</span></div>
            <div><b>Échéance urgente</b><span>+ {urgencySupplements.urgente} €</span></div>
          </div>
        </div>
      </section>

      <section className="services-section catalog-section" id="prestations">
        <div className="public-container">
          <div className="section-heading centered">
            <span>PRESTATIONS COMPLÉMENTAIRES</span>
            <h2>Choisissez uniquement ce dont votre dossier a besoin.</h2>
            <p>Les tarifs ci-dessous concernent les dossiers standards. Une demande plus complexe fait l’objet d’une proposition détaillée avant tout paiement.</p>
          </div>
          <div className="services-grid">
            {prestations.map((service) => (
              <article key={service.id} className={service.badge ? "service-card highlighted" : "service-card"}>
                {service.badge && <span className="service-badge">{service.badge}</span>}
                <div className="service-card-top"><div className="service-icon">{service.icon}</div><span>{service.category}</span></div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <ul>{service.includes.map((item) => <li key={item}>{item}</li>)}</ul>
                <div className="service-card-bottom"><strong>{service.price} € <small>TTC</small></strong><Link href="/inscription">Choisir →</Link></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="services-section legal-service-note">
        <div className="public-container legal-note-card">
          <div><span>CADRE DE LA PRESTATION</span><h2>Une intervention adaptée à la nature du dossier.</h2></div>
          <p>Lorsqu’une demande constitue une consultation juridique personnalisée ou implique la rédaction d’un acte, elle est prise en charge ou validée par un professionnel juridiquement habilité. L’orientation vers un avocat reste proposée lorsque la situation nécessite une représentation, une procédure ou une expertise particulière.</p>
        </div>
      </section>

      <section className="public-section final-cta">
        <div className="public-container final-card">
          <div><span>COMMENCER SIMPLEMENT</span><h2>Décrivez d’abord votre situation.</h2><p>Vous pourrez sélectionner une prestation complémentaire depuis le récapitulatif de votre dossier. Rien n’est facturé sans votre validation.</p></div>
          <div className="final-actions"><Link href="/inscription" className="public-button public-button-gold">Créer mon dossier</Link><Link href="/connexion" className="final-login">J’ai déjà un compte →</Link></div>
        </div>
      </section>

      <footer className="public-footer">
        <div className="public-container footer-main">
          <div><Link href="/" className="footer-logo">LEXIA<span>.</span></Link><p>L’assistance juridique en ligne, simple, humaine et sécurisée.</p></div>
          <div><b>Service</b><Link href="/#fonctionnement">Fonctionnement</Link><Link href="/#domaines">Domaines</Link><Link href="/prestations">Prestations & tarifs</Link></div>
          <div><b>Mon espace</b><Link href="/inscription">Créer un compte</Link><Link href="/connexion">Se connecter</Link><Link href="/nouveau-dossier">Déposer un dossier</Link></div>
          <div><b>Informations</b><Link href="/confidentialite">Confidentialité</Link><Link href="/conditions">Conditions générales</Link><Link href="/mentions-legales">Mentions légales</Link></div>
        </div>
        <div className="public-container footer-bottom"><span>© 2026 LEXIA. Tous droits réservés.</span><span>Tarifs TTC pour dossiers standards, sous réserve de validation du périmètre.</span></div>
      </footer>
    </main>
  );
}
