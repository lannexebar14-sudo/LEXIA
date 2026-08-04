import Link from "next/link";
import "../legal.css";

export default function ConfidentialitePage() {
  return (
    <main className="legal-page">
      <header className="legal-header">
        <nav className="legal-nav">
          <Link href="/" className="legal-logo">LEXIA<span>.</span></Link>
          <div className="legal-nav-links">
            <Link href="/confidentialite">Confidentialité</Link>
            <Link href="/conditions">Conditions générales</Link>
            <Link href="/mentions-legales">Mentions légales</Link>
          </div>
        </nav>
      </header>

      <section className="legal-hero">
        <div className="legal-container">
          <span className="legal-eyebrow">DONNÉES PERSONNELLES</span>
          <h1>Politique de confidentialité</h1>
          <p>Cette politique explique quelles données LEXIA collecte, pourquoi elles sont utilisées, combien de temps elles sont conservées et comment exercer vos droits.</p>
          <div className="legal-alert">Version de travail à faire valider avant l’ouverture commerciale. Les coordonnées définitives du responsable de traitement et du délégué à la protection des données doivent être complétées.</div>
        </div>
      </section>

      <section className="legal-container legal-content">
        <article className="legal-card">
          <h2>1. Responsable du traitement</h2>
          <p>Le responsable du traitement est l’entité qui exploite la plateforme LEXIA.</p>
          <div className="legal-table">
            <div className="legal-row"><span>Dénomination</span><span className="legal-placeholder">À compléter avant lancement</span></div>
            <div className="legal-row"><span>Adresse</span><span className="legal-placeholder">À compléter avant lancement</span></div>
            <div className="legal-row"><span>E-mail vie privée</span><span>confidentialite@lexia.fr ou adresse définitive à compléter</span></div>
            <div className="legal-row"><span>DPO / référent RGPD</span><span className="legal-placeholder">À désigner ou préciser</span></div>
          </div>
        </article>

        <article className="legal-card">
          <h2>2. Données collectées</h2>
          <p>LEXIA peut traiter les catégories de données suivantes :</p>
          <ul>
            <li>données d’identité et de contact : nom, prénom, e-mail, téléphone, adresse ;</li>
            <li>données professionnelles : société, fonction, SIRET et coordonnées professionnelles ;</li>
            <li>données de compte : identifiant, rôle, historique de connexion et préférences ;</li>
            <li>données relatives aux dossiers : faits exposés, objectifs, niveau d’urgence, partie adverse, échanges et statut du dossier ;</li>
            <li>documents transmis : contrats, courriers, factures, décisions, photographies, captures et autres justificatifs ;</li>
            <li>données de paiement et de facturation, hors données bancaires complètes traitées par le prestataire de paiement ;</li>
            <li>données techniques : adresse IP, navigateur, appareil, journaux de sécurité et cookies ;</li>
            <li>messages envoyés depuis la bulle d’assistance et la messagerie du compte.</li>
          </ul>
          <p>Certains dossiers peuvent contenir des données particulièrement sensibles. L’utilisateur ne doit transmettre que les informations strictement nécessaires au traitement de sa demande.</p>
        </article>

        <article className="legal-card">
          <h2>3. Finalités et bases légales</h2>
          <div className="legal-table">
            <div className="legal-row"><span>Création et gestion du compte</span><span>Exécution du contrat et mesures précontractuelles</span></div>
            <div className="legal-row"><span>Analyse et suivi des demandes</span><span>Exécution du contrat</span></div>
            <div className="legal-row"><span>Messagerie et assistance</span><span>Exécution du contrat ou intérêt légitime à répondre aux visiteurs</span></div>
            <div className="legal-row"><span>Paiement et facturation</span><span>Exécution du contrat et obligations légales</span></div>
            <div className="legal-row"><span>Sécurité, prévention des abus</span><span>Intérêt légitime et obligations légales</span></div>
            <div className="legal-row"><span>Communications commerciales</span><span>Consentement lorsque celui-ci est requis</span></div>
            <div className="legal-row"><span>Mesure d’audience non essentielle</span><span>Consentement</span></div>
          </div>
        </article>

        <article className="legal-card">
          <h2>4. Destinataires</h2>
          <p>Les données sont accessibles uniquement aux personnes qui en ont besoin dans le cadre de leurs fonctions :</p>
          <ul>
            <li>administrateurs et personnel habilité de LEXIA ;</li>
            <li>juristes ou intervenants autorisés affectés au dossier ;</li>
            <li>avocats partenaires, uniquement avec l’accord du client ou lorsque cela est nécessaire à sa demande ;</li>
            <li>prestataires techniques : hébergement, base de données, authentification, paiement, e-mail et maintenance ;</li>
            <li>autorités légalement habilitées, sur demande conforme au droit applicable.</li>
          </ul>
          <p>LEXIA ne vend pas les données personnelles de ses utilisateurs.</p>
        </article>

        <article className="legal-card">
          <h2>5. Hébergement et transferts</h2>
          <p>La plateforme utilise notamment Vercel pour l’hébergement applicatif, Supabase pour l’authentification et la base de données, et GitHub pour le code source. Les régions d’hébergement et garanties contractuelles devront être configurées et documentées avant la mise en production commerciale.</p>
          <p>Lorsqu’un prestataire traite des données en dehors de l’Espace économique européen, LEXIA met en place un mécanisme reconnu par le RGPD, tel qu’une décision d’adéquation ou des clauses contractuelles types.</p>
        </article>

        <article className="legal-card">
          <h2>6. Durées de conservation</h2>
          <ul>
            <li>compte actif : pendant toute la durée d’utilisation du service ;</li>
            <li>dossiers et échanges : pendant la durée nécessaire au service, puis archivage selon les délais légaux applicables ;</li>
            <li>documents comptables et factures : durée légale de conservation ;</li>
            <li>prospects et demandes sans contrat : durée limitée à compter du dernier contact ;</li>
            <li>journaux de sécurité : durée proportionnée aux besoins de sécurité ;</li>
            <li>cookies : durée définie dans le gestionnaire de consentement.</li>
          </ul>
          <p>Les durées définitives devront être inscrites dans le registre RGPD de LEXIA avant le lancement.</p>
        </article>

        <article className="legal-card">
          <h2>7. Vos droits</h2>
          <p>Selon la situation, vous pouvez exercer vos droits d’accès, de rectification, d’effacement, de limitation, d’opposition, de portabilité et de retrait du consentement.</p>
          <p>La demande peut être adressée à <strong>confidentialite@lexia.fr</strong>, sous réserve de remplacement par l’adresse définitive. Une preuve d’identité pourra être demandée uniquement lorsque cela est nécessaire pour vérifier l’identité du demandeur.</p>
          <p>Vous pouvez également déposer une réclamation auprès de la CNIL.</p>
        </article>

        <article className="legal-card">
          <h2>8. Cookies</h2>
          <p>Les cookies strictement nécessaires au fonctionnement, à la sécurité et à l’authentification peuvent être déposés sans consentement lorsqu’ils répondent aux critères légaux. Les cookies de mesure d’audience, de personnalisation ou de publicité non essentiels ne sont déposés qu’après votre choix.</p>
          <p>Un gestionnaire de consentement devra permettre d’accepter, de refuser ou de modifier les préférences à tout moment.</p>
        </article>

        <article className="legal-card">
          <h2>9. Sécurité</h2>
          <p>LEXIA met en œuvre des mesures techniques et organisationnelles adaptées : contrôle des accès, authentification, journalisation, chiffrement des communications, sauvegardes, séparation des rôles, limitation des accès aux dossiers et procédures de gestion des incidents.</p>
          <p>Aucun système n’étant totalement invulnérable, les utilisateurs doivent protéger leur mot de passe et signaler toute activité suspecte.</p>
        </article>

        <article className="legal-card">
          <h2>10. Mise à jour</h2>
          <p>Cette politique peut être modifiée pour tenir compte des évolutions du service, des prestataires ou du droit applicable. La date de dernière mise à jour sera affichée sur cette page.</p>
          <p><strong>Dernière mise à jour :</strong> 4 août 2026.</p>
        </article>
      </section>

      <footer className="legal-footer"><div className="legal-footer-inner"><span>LEXIA — Assistance juridique en ligne</span><Link href="/">Retour à l’accueil</Link></div></footer>
    </main>
  );
}
