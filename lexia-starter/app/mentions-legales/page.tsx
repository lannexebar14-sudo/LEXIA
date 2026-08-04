import Link from "next/link";
import "../legal.css";

export default function MentionsLegalesPage() {
  return (
    <main className="legal-page">
      <header className="legal-header"><nav className="legal-nav"><Link href="/" className="legal-logo">LEXIA<span>.</span></Link><div className="legal-nav-links"><Link href="/confidentialite">Confidentialité</Link><Link href="/conditions">Conditions générales</Link><Link href="/mentions-legales">Mentions légales</Link></div></nav></header>

      <section className="legal-hero"><div className="legal-container"><span className="legal-eyebrow">INFORMATIONS ÉDITEUR</span><h1>Mentions légales</h1><p>Informations relatives à l’éditeur, à l’hébergement, à la propriété intellectuelle et au fonctionnement du site LEXIA.</p><div className="legal-alert">Les champs surlignés doivent obligatoirement être complétés avec l’identité juridique réelle de l’exploitant avant l’ouverture commerciale du service.</div></div></section>

      <section className="legal-container legal-content">
        <article className="legal-card"><h2>1. Éditeur du site</h2><div className="legal-table"><div className="legal-row"><span>Nom commercial</span><span>LEXIA</span></div><div className="legal-row"><span>Dénomination sociale</span><span className="legal-placeholder">À compléter avant lancement</span></div><div className="legal-row"><span>Forme juridique</span><span className="legal-placeholder">À compléter avant lancement</span></div><div className="legal-row"><span>Capital social</span><span className="legal-placeholder">À compléter avant lancement</span></div><div className="legal-row"><span>Siège social</span><span className="legal-placeholder">À compléter avant lancement</span></div><div className="legal-row"><span>SIREN / RCS</span><span className="legal-placeholder">À compléter avant lancement</span></div><div className="legal-row"><span>N° de TVA intracommunautaire</span><span className="legal-placeholder">À compléter si applicable</span></div><div className="legal-row"><span>E-mail</span><span>contact@lexia.fr ou adresse définitive à compléter</span></div><div className="legal-row"><span>Téléphone</span><span className="legal-placeholder">À compléter avant lancement</span></div></div></article>

        <article className="legal-card"><h2>2. Directeur de la publication</h2><p>Le directeur de la publication est :</p><div className="legal-table"><div className="legal-row"><span>Nom et qualité</span><span className="legal-placeholder">À compléter avant lancement</span></div><div className="legal-row"><span>Contact</span><span className="legal-placeholder">À compléter avant lancement</span></div></div></article>

        <article className="legal-card"><h2>3. Hébergement</h2><h3>Application web</h3><p>Le site est déployé au moyen de la plateforme Vercel. Les coordonnées juridiques exactes de l’entité contractante, la région d’hébergement et les informations contractuelles doivent être reprises depuis le compte Vercel de production.</p><h3>Base de données et authentification</h3><p>La base de données et l’authentification sont fournies par Supabase. La région de stockage et les coordonnées de l’entité contractante doivent être confirmées dans le tableau de bord du projet de production.</p><p>Le code source est hébergé sur GitHub. Aucun document client ne doit être stocké dans le dépôt de code.</p></article>

        <article className="legal-card"><h2>4. Nature du service</h2><p>LEXIA est une plateforme d’assistance en ligne permettant de déposer une situation, transmettre des documents, échanger avec une équipe et recevoir des informations, une aide à la formulation ou une orientation vers un avocat.</p><p>Sauf indication expresse et intervention d’un professionnel habilité, LEXIA n’est ni un cabinet d’avocats, ni une juridiction, ni un service public. Le contenu du site ne constitue pas, à lui seul, un avis juridique personnalisé ni une garantie de résultat.</p></article>

        <article className="legal-card"><h2>5. Activité réglementée et assurance</h2><p>Avant commercialisation, l’exploitant doit vérifier le cadre exact de ses prestations, la qualification des intervenants, les actes réservés aux professions réglementées et les obligations d’assurance applicables.</p><div className="legal-table"><div className="legal-row"><span>Responsabilité civile professionnelle</span><span className="legal-placeholder">Assureur, police et zone de couverture à compléter</span></div><div className="legal-row"><span>Autorité / ordre professionnel</span><span className="legal-placeholder">À compléter si applicable</span></div></div></article>

        <article className="legal-card"><h2>6. Propriété intellectuelle</h2><p>La structure du site, le nom LEXIA, les textes, interfaces, éléments graphiques, logos, logiciels et bases de données sont protégés par les règles de propriété intellectuelle, sous réserve des droits appartenant à des tiers.</p><p>Toute reproduction, représentation, extraction, adaptation ou exploitation non autorisée, totale ou partielle, est interdite.</p></article>

        <article className="legal-card"><h2>7. Responsabilité éditoriale</h2><p>L’éditeur s’efforce de fournir des informations exactes et à jour. Les informations générales présentes sur le site peuvent néanmoins évoluer et ne dispensent pas l’utilisateur de vérifier les règles applicables à sa situation ni de consulter un professionnel habilité lorsque cela est nécessaire.</p><p>L’utilisateur reste responsable des informations, documents et contenus qu’il transmet.</p></article>

        <article className="legal-card"><h2>8. Signalement d’un contenu</h2><p>Tout contenu manifestement illicite, toute atteinte à un droit ou tout problème de sécurité peut être signalé à l’adresse de contact de l’éditeur, en précisant l’URL ou le dossier concerné, la nature du signalement et les éléments permettant son examen.</p><p>Adresse de signalement : <strong>contact@lexia.fr</strong>, à remplacer par l’adresse définitive avant lancement.</p></article>

        <article className="legal-card"><h2>9. Données personnelles et cookies</h2><p>Les modalités de traitement des données sont détaillées dans la <Link href="/confidentialite"><strong>politique de confidentialité</strong></Link>. Les conditions contractuelles sont accessibles dans les <Link href="/conditions"><strong>conditions générales</strong></Link>.</p></article>

        <article className="legal-card"><h2>10. Médiation de la consommation</h2><p>Le consommateur pourra saisir le médiateur de la consommation compétent après une réclamation écrite préalable auprès de LEXIA.</p><div className="legal-table"><div className="legal-row"><span>Nom du médiateur</span><span className="legal-placeholder">À désigner avant lancement</span></div><div className="legal-row"><span>Adresse et site internet</span><span className="legal-placeholder">À compléter avant lancement</span></div></div></article>

        <article className="legal-card"><h2>11. Droit applicable</h2><p>Le site et ses conditions sont soumis au droit français, sous réserve des règles impératives applicables au consommateur. Les modalités de règlement des litiges sont précisées dans les conditions générales.</p><p><strong>Dernière mise à jour :</strong> 4 août 2026.</p></article>
      </section>

      <footer className="legal-footer"><div className="legal-footer-inner"><span>LEXIA — Assistance juridique en ligne</span><Link href="/">Retour à l’accueil</Link></div></footer>
    </main>
  );
}
