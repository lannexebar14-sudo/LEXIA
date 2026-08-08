const faq = [
  ["Comment fonctionne LEXIA ?", "Vous créez votre espace, décrivez votre situation, ajoutez vos documents puis suivez l’analyse et les échanges depuis votre dossier sécurisé."],
  ["Puis-je déposer un dossier à tout moment ?", "Oui. Le dépôt en ligne et l’accès à votre espace sont disponibles à tout moment depuis un téléphone, une tablette ou un ordinateur."],
  ["LEXIA peut-il m’aider pour un impayé ?", "Oui. Le service LEXIA Impayés permet de structurer une créance, rassembler les justificatifs et préparer les démarches amiables adaptées à la situation."],
  ["Que se passe-t-il si une solution amiable n’aboutit pas ?", "Lorsque la situation nécessite une intervention extérieure, le dossier peut être orienté vers un professionnel compétent selon la nature du litige."],
  ["Mes documents sont-ils regroupés dans mon espace ?", "Oui. Les pièces du dossier, les échanges et les documents générés sont centralisés afin de faciliter le suivi de votre situation."],
  ["Le prix d’une prestation complémentaire est-il connu avant paiement ?", "Oui. Toute prestation complémentaire doit être présentée avant sa validation et son paiement."],
];

export default function HomeFaq() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };

  return (
    <section className="lexia-faq" id="faq">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <div className="public-container lexia-faq-layout">
        <div className="lexia-faq-heading">
          <span>QUESTIONS FRÉQUENTES</span>
          <h2>Comprendre LEXIA avant de commencer.</h2>
          <p>Les réponses essentielles sur le dépôt d’un dossier, les impayés, les documents et le suivi de votre demande.</p>
          <a href="/inscription" className="lexia-faq-cta">Créer mon espace <b>→</b></a>
        </div>
        <div className="lexia-faq-list">
          {faq.map(([question, answer], index) => (
            <details key={question} open={index === 0}>
              <summary><span>{String(index + 1).padStart(2, "0")}</span>{question}<b>+</b></summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </div>
      <div className="lexia-mobile-cta"><a href="/inscription">Déposer ma demande</a><a href="/connexion">Connexion</a></div>
    </section>
  );
}
